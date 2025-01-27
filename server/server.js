const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path'); 
const mkdirp = require('mkdirp');
const fs = require('fs');
require('dotenv').config();

const app = express();
const allowedOrigins = ['https://www.bhoomikarealestate.com', 'https://bhoomikarealestate.com', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));app.use('/uploads', express.static('uploads'));app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'cities');
    mkdirp.sync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExt) + '-' + Date.now() + fileExt;
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log(`Password does not match for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/cities', upload.single('file'), async (req, res) => {
  const { cityName } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const imageUrl = path.join('uploads', 'cities', file.filename);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties 
       WHERE locationDetails ILIKE $1
       OR description ILIKE $1`,
      [`%${cityName}%`]
    );

    const availableProperties = parseInt(countResult.rows[0].count, 10);

    await pool.query(
      'INSERT INTO cities (cityName, availableProperties, imageUrl) VALUES ($1, $2, $3)',
      [cityName, availableProperties, imageUrl]
    );

    res.status(201).send('City added');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cities ORDER BY updateddate DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/cities/:id', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { cityName } = req.body;
  const file = req.file;

  console.log(req.body);

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties 
       WHERE locationDetails ILIKE $1
       OR description ILIKE $1`,
      [`%${cityName}%`]
    );

    const availableProperties = parseInt(countResult.rows[0].count, 10);

    let updateQuery = 'UPDATE cities SET cityName = $1, availableProperties = $2';
    const values = [cityName, availableProperties];

    if (file) {
      const publicUrl = `uploads/cities/${file.filename}`;
      updateQuery += ', imageUrl = $3';
      values.push(publicUrl);
    }

    updateQuery += ' WHERE id = $' + (file ? '4' : '3');
    values.push(id);

    await pool.query(updateQuery, values);
    res.send('City updated and property count recalculated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/cities', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No IDs provided' });
  }

  try {
    const cities = await pool.query('SELECT imageUrl FROM cities WHERE id = ANY($1::int[])', [ids]);

    for (const city of cities.rows) {
      const imageUrl = city.imageurl;

      if (imageUrl) {
        const fileName = path.basename(imageUrl);
        
        const filePath = path.join(__dirname, 'uploads', 'cities', fileName);

        console.log('Attempting to delete file at path:', filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted:', filePath);
        } else {
          console.warn('Image file not found at path:', filePath);
        }
      } else {
        console.warn('No image URL found for city:', city);
      }
    }
    await pool.query('DELETE FROM cities WHERE id = ANY($1::int[])', [ids]);

    res.send('Cities deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const propertyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'properties');
    mkdirp.sync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExt) + '-' + Date.now() + fileExt;
    cb(null, fileName);
  }
});

const propertyUpload = multer({ storage: propertyStorage });


app.post('/properties', propertyUpload.array('files', 6), async (req, res) => {
  const {
    propertyType, fullName, phoneNumber, propertyName, numOfBedRooms,
    numOfRooms, numOfToilets, locationDetails, plotSize,
    budget, description, commercialType, rentalType, villaRooms
  } = req.body;
  const files = req.files;

  console.log(req.body);
  

  if (!propertyType || !phoneNumber || !locationDetails || !plotSize || !budget) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (propertyType === 'Land' && !description) {
    return res.status(400).json({ error: 'Description is required for Land properties' });
  }

  const imageUrls = files ? files.map(file => path.join('uploads', 'properties', file.filename)) : [];
  const values = [
    propertyType || null,
    fullName || null,
    phoneNumber || null,
    propertyName || null,
    numOfRooms ? parseInt(numOfRooms, 10) : null,
    numOfToilets ? parseInt(numOfToilets, 10) : null,
    locationDetails || null,
    plotSize || null,
    budget || null,
    description || null,
    imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
    numOfBedRooms ? parseInt(numOfBedRooms, 10) : null,
    commercialType || null,
    rentalType || null,
    villaRooms || null,
  ];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO properties (propertyType, fullName, phoneNumber, propertyName, numOfRooms, numOfToilets, locationDetails, plotSize, budget, description, imageUrls, numOfBedRooms, commercialType, rentalType, villa_Rooms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      values
    );

    const citiesFromLocation = locationDetails.split(',').map(city => city.trim());
    const citiesFromDescription = description ? description.split(/,\s*/).map(city => city.trim()) : [];

    const allCities = Array.from(new Set([...citiesFromLocation, ...citiesFromDescription]));
    console.log(`Cities array: ${allCities}`);

    const updatePromises = allCities.map(async city => {
      const countResult = await client.query(
        `SELECT COUNT(*) FROM properties 
         WHERE locationDetails ILIKE $1
         OR description ILIKE $1`,
        [`%${city}%`]
      );

      const availableProperties = parseInt(countResult.rows[0].count, 10);
      console.log(`City: ${city}, Count: ${availableProperties}`);

      const updateResult = await client.query(
        'UPDATE cities SET availableProperties = $1 WHERE TRIM(LOWER(cityName)) = TRIM(LOWER($2)) RETURNING *',
        [availableProperties, city]
      );

      if (updateResult.rowCount === 0) {
        console.log(`City not found for update: ${city}`);
      } else {
        console.log(`City updated: ${city}`);
      }
    });

    await Promise.all(updatePromises);

    await client.query('COMMIT');
    res.status(201).send('Property added and city counts updated');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});


app.put('/properties/:id', propertyUpload.array('files', 6), async (req, res) => {
  const { id } = req.params;
  const {
    propertyType,
    fullName,
    phoneNumber,
    propertyName,
    numOfRooms,
    numOfToilets,
    locationDetails,
    plotSize,
    budget,
    rentalType,
    commercialType,
    numOfBedRooms,
    description,
    villaRooms
  } = req.body;

  const files = req.files;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingResult = await client.query('SELECT imageUrls FROM properties WHERE id = $1', [id]);
    const existingImageUrls = existingResult.rows[0]?.imageurls || [];

    const newImageUrls = files.map(file => path.join('uploads', 'properties', file.filename));

    const removedImages = JSON.parse(req.body.removedImages || '[]');
    console.log("Raw Removed Images:", req.body.removedImages); 

    const normalizedExistingImageUrls = existingImageUrls.map(url => url.replace(/\\/g, '/'));
    console.log("Normalized Existing Image URLs:", normalizedExistingImageUrls);

  const normalizedRemovedImages = removedImages.map(url => url.replace(/^https:\/\/api.bhoomikarealestate.com\//, '').replace(/\\/g, '/'));
  console.log("Normalized Removed Images:", normalizedRemovedImages);

  const filteredExistingImageUrls = normalizedExistingImageUrls.filter(url => !normalizedRemovedImages.includes(url));
  console.log("Filtered Existing Image URLs:", filteredExistingImageUrls);


    const allImageUrls = Array.from(new Set([...filteredExistingImageUrls, ...newImageUrls]));

    const formattedImageUrls = allImageUrls.map(url => url.replace(/\\/g, '/'));

    let updateQuery = `UPDATE properties 
      SET propertyType = $1, fullName = $2, phoneNumber = $3, propertyName = $4, 
      numOfRooms = $5, numOfToilets = $6, locationDetails = $7, plotSize = $8, 
      budget = $9, description = $10, numOfBedRooms = $11, rentalType = $12, commercialType = $13, 
      imageUrls = $14, villa_Rooms = $15 
      WHERE id = $16`;

    const values = [
      propertyType || null,
      fullName || null,
      phoneNumber || null,
      propertyName || null,
      numOfRooms ? parseInt(numOfRooms, 10) : null,
      numOfToilets ? parseInt(numOfToilets, 10) : null,
      locationDetails || null,
      plotSize || null,
      budget || null,
      description || null,
      numOfBedRooms ? parseInt(numOfBedRooms, 10) : null,
      rentalType || null,
      commercialType || null,
      JSON.stringify(formattedImageUrls),
      villaRooms || null, 
      id
    ];

    await client.query(updateQuery, values);

    const citiesFromLocation = locationDetails ? locationDetails.split(',').map(city => city.trim()) : [];
    const citiesFromDescription = description ? description.split(/,\s*/).map(city => city.trim()) : [];
    const allCities = Array.from(new Set([...citiesFromLocation, ...citiesFromDescription]));

    console.log(`Cities array: ${allCities}`);

    const updatePromises = allCities.map(async city => {
      const countResult = await client.query(
        `SELECT COUNT(*) FROM properties 
         WHERE locationDetails ILIKE $1
         OR description ILIKE $1`,
        [`%${city}%`]
      );

      const availableProperties = parseInt(countResult.rows[0].count, 10);
      console.log(`City: ${city}, Count: ${availableProperties}`);

      await client.query(
        'UPDATE cities SET availableProperties = $1 WHERE TRIM(LOWER(cityName)) = TRIM(LOWER($2))',
        [availableProperties, city]
      );
    });

    await Promise.all(updatePromises);

    await client.query('COMMIT');
    res.send('Property updated and city counts recalculated');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during update:', err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});





app.get('/properties/city/:cityName', async (req, res) => {
  const { cityName } = req.params;
  console.log(`Received cityName: ${cityName}`);

  try {
    const result = await pool.query(
      `SELECT * FROM properties 
       WHERE locationDetails ILIKE $1
       OR description ILIKE $1`,
      [`%${cityName}%`]
    );
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY updateddate DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/properties', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No IDs provided' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const properties = await client.query('SELECT imageurls, locationDetails, description FROM properties WHERE id = ANY($1::int[])', [ids]);

    for (const property of properties.rows) {
      const imageUrlsStr = property.imageurls; 

      if (!imageUrlsStr || imageUrlsStr.length === 0) {
        console.warn('No imageUrls found for property:', property);
        continue; 
      }

      let imageUrls;
      try {
        imageUrls = JSON.parse(imageUrlsStr); 
      } catch (err) {
        console.error('Error parsing imageUrls:', err);
        imageUrls = [];
      }

      console.log('Fetched imageUrls:', imageUrls);

      for (const property of properties.rows) {
        const imageUrls = property.imageurls;
      
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
          console.warn('No valid imageUrls found for property:', property);
          continue;  
        }
      
        console.log('Fetched imageUrls:', imageUrls);
      
        for (const imageUrl of imageUrls) {
          if (imageUrl) {
            const normalizedImageUrl = imageUrl.replace(/\\/g, '/');  
            const fileName = path.basename(normalizedImageUrl);
            const filePath = path.join(__dirname, 'uploads', 'properties', fileName);
      
            console.log('Attempting to delete file at path:', filePath);
      
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('File deleted:', filePath);
              } else {
                console.warn('Image file not found at path:', filePath);
              }
            } catch (fsError) {
              console.error('Error deleting file:', fsError);
            }
          } else {
            console.warn('Empty image URL found for property:', property);
          }
        }
      }
      
    }

    await client.query('DELETE FROM properties WHERE id = ANY($1::int[])', [ids]);

    const citiesFromProperties = properties.rows.flatMap(property => {
      const citiesFromLocation = property.locationdetails ? property.locationdetails.split(',').map(city => city.trim()) : [];
      const citiesFromDescription = property.description ? property.description.split(/,\s*/).map(city => city.trim()) : [];
      return Array.from(new Set([...citiesFromLocation, ...citiesFromDescription]));
    });

    console.log(`Cities array for recalculation: ${citiesFromProperties}`);

    const updatePromises = citiesFromProperties.map(async city => {
      const countResult = await client.query(
        `SELECT COUNT(*) FROM properties 
         WHERE locationDetails ILIKE $1
         OR description ILIKE $1`,
        [`%${city}%`]
      );

      const availableProperties = parseInt(countResult.rows[0].count, 10);
      console.log(`City: ${city}, Count: ${availableProperties}`);

      await client.query(
        'UPDATE cities SET availableProperties = $1 WHERE TRIM(LOWER(cityName)) = TRIM(LOWER($2))',
        [availableProperties, city]
      );
    });

    await Promise.all(updatePromises);

    await client.query('COMMIT');
    res.send('Properties deleted and city counts recalculated');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Server error:', err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});


app.post('/enquiries',propertyUpload.array('files', 6), async (req, res) => {
  console.log('Request Body:', req.body);

  const { 
    fullName, 
    phoneNumber, 
    propertyType, 
    numOfRooms, 
    numOfBedRooms, 
    commercialType, 
    rentalType, 
    numOfToilets, 
    locationDetails, 
    plotSize, 
    budget, 
    description,
    villaRooms 
  } = req.body;

  console.log(req.body);

  if (!fullName || !phoneNumber || !propertyType) {

    return res.status(400).json({ error: 'Missing required fields' });
    
  }

  const values = [
    fullName || null,
    phoneNumber || null,
    propertyType || null,
    numOfRooms ? parseInt(numOfRooms, 10) : null,
    numOfToilets ? parseInt(numOfToilets, 10) : null,
    locationDetails || null,
    plotSize || null,
    budget || null,
    description || null,
    numOfBedRooms ? parseInt(numOfBedRooms, 10) : null,
    commercialType || null,
    rentalType || null,
    villaRooms || null
  ];

  try {
    await pool.query(
      `INSERT INTO enquiry 
        (fullName, phone, propertyType, numOfRooms, numOfToilets, locationDetails, plotSize, budget, description, numOfBedRooms, commercialType, rentalType, villa_Rooms) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, 
      values
    );

    res.status(201).send('Enquiry submitted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/enquiries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enquiry ORDER BY submitteddate DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/schedule-visit', async (req, res) => {
  const { fullName, email, phoneNumber, visitDate, visitTime, visitTimePeriod, propertyName, locationDetails, description, property_id } = req.body;

  console.log({
      fullName,
      email,
      phoneNumber,
      visitDate,
      visitTime,
      visitTimePeriod,
      propertyName,
      locationDetails,
      description,
      property_id
  });

  const formattedVisitDate = visitDate && visitDate.trim() !== '' ? visitDate : null;

  let formattedVisitTime = null;
  if (visitTime && visitTime.trim() !== '') {
      let [hours, minutes] = visitTime.split(':');
      hours = parseInt(hours, 10);
      let period = visitTimePeriod || '';

      if (hours > 12) {
          hours -= 12;
      } else if (hours === 0) {
          hours = 12;
      }
      
      formattedVisitTime = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  }

  try {
      await pool.query(
          'INSERT INTO visit_schedules (fullname, email, phone_number, visit_date, visit_time, property_name, location_details, description, property_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [fullName, email, phoneNumber, formattedVisitDate, formattedVisitTime, propertyName, locationDetails, description, property_id]
      );

      const transporter = nodemailer.createTransport({
          host: 'smtp.hostinger.com',
          port: 465,
          secure: true,
          auth: {
              user: 'dilna@bhoomikarealestate.com',
              pass: 'Bhoomika@2024'
          }
      });

      const mailOptions = {
          from: '"Bhoomika Real Estate Website" <dilna@bhoomikarealestate.com>',
          to: 'dilna@bhoomikarealestate.com',
          subject: 'New Visit Scheduled',
          html: `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
                  <h3 style="background-color: #4CAF50; color: white; padding: 10px 15px; text-align: center; border-radius: 5px;">New Visit Scheduled</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Full Name:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${fullName}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Email:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${email}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Phone Number:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${phoneNumber}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Visit Date:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${formattedVisitDate || 'N/A'}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Visit Time:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${formattedVisitTime || 'N/A'}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Property Name:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${propertyName}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Location Details:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${locationDetails}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Description:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${description}</td>
                      </tr>
                      <tr>
                          <td style="font-weight: bold; padding: 10px 0; border-bottom: 1px solid #ddd;">Property ID:</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${property_id}</td>
                      </tr>
                  </table>
              </div>
          `
      };

      await transporter.sendMail(mailOptions);

      res.status(201).send('Visit scheduled');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});



app.get('/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visit_schedules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const sellingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'selling');
    mkdirp.sync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExt) + '-' + Date.now() + fileExt;
    cb(null, fileName);
  }
});

const sellingUpload = multer({ storage: sellingStorage });

app.post('/selling-info', sellingUpload.array('files', 6), async (req, res) => {
  const { 
    fullName, 
    phoneNumber, 
    propertyType, 
    propertyName, 
    numOfRooms,
    numOfBedRooms,
    commercialType,
    rentalType, 
    numOfToilets, 
    locationDetails, 
    plotSize, 
    budget,
    description,
    villaRooms
  } = req.body;
  
  const files = req.files;

  if (!fullName || !phoneNumber || !propertyType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const imageUrls = files ? files.map(file => path.join('uploads', 'selling', file.filename)) : [];

  const values = [
    fullName || null,
    phoneNumber || null,
    propertyType || null,
    propertyName || null,
    numOfRooms ? parseInt(numOfRooms, 10) : null,
    numOfToilets ? parseInt(numOfToilets, 10) : null,
    locationDetails || null,
    plotSize || null,
    budget || null,
    imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
    description || null,
    numOfBedRooms ? parseInt(numOfBedRooms, 10) : null,
    commercialType || null,
    rentalType || null,
    villaRooms || null
  ];

  try {
    await pool.query(
      `INSERT INTO selling_info (fullName, phone, propertyType, propertyName, numOfRooms, numOfToilets, locationDetails, plotSize, budget, imageUrls, description, numOfBedRooms, commercialType, rentalType, villa_Rooms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, 
      values
    );

    res.status(201).send('Form submitted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'An error occurred while saving the form. Please try again.' });
  }
});


app.get('/selling-info', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM selling_info ORDER BY updateddate DESC');
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.get('/cities/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM cities');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/enquiries/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM enquiry');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/properties/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM properties');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/schedules/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM visit_schedules');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/selling-info/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM selling_info');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/selling-info', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    const result = await pool.query('SELECT imageUrls FROM selling_info WHERE id = ANY($1)', [ids]);

    const imagePaths = result.rows
      .map(row => row.imageurls) 
      .filter(Boolean) 
      .flat(); 

    imagePaths.forEach(imageUrl => {
      const localImagePath = path.join(__dirname, imageUrl); 
      fs.unlink(localImagePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${localImagePath}`, err);
        }
      });
    });

    await pool.query('DELETE FROM selling_info WHERE id = ANY($1)', [ids]);

    res.status(200).json({ message: 'Items and images deleted successfully' });
  } catch (error) {
    console.error('Error deleting items:', error);
    res.status(500).json({ error: 'Failed to delete items' });
  }
});

app.delete('/schedules', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
      await pool.query('DELETE FROM visit_schedules WHERE id = ANY($1)', [ids]);
      res.status(200).json({ message: 'Items deleted successfully' });
  } catch (error) {
      console.error('Error deleting items:', error);
      res.status(500).json({ error: 'Failed to delete items' });
  }
});

app.delete('/enquiry', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
      await pool.query('DELETE FROM enquiry WHERE id = ANY($1)', [ids]);
      res.status(200).json({ message: 'Items deleted successfully' });
  } catch (error) {
      console.error('Error deleting items:', error);
      res.status(500).json({ error: 'Failed to delete items' });
  }
});


app.post('/sendEmail', async (req, res) => {
  const { fname, lname, phone, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com', 
      port: 465, 
      secure: true, 
      auth: {
        user: 'dilna@bhoomikarealestate.com', 
        pass: 'Bhoomika@2024' 
      }
    });

     
    const mailOptions = {
      from: '"Bhoomika Real Estate Website" <dilna@bhoomikarealestate.com>',
      to: 'dilna@bhoomikarealestate.com', 
      subject: 'New Message from Bhoomika Contact Form', 
      html: `
          <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      background-color: #f4f4f4;
                      padding: 20px;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      border: 1px solid #ddd;
                      border-radius: 10px;
                      background-color: #fff;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                  }
                  h2 {
                      background-color: #4CAF50;
                      color: white;
                      padding: 10px;
                      border-radius: 5px;
                      text-align: center;
                  }
                  .message {
                      margin-top: 20px;
                      padding: 15px;
                      background-color: #f9f9f9;
                      border: 1px solid #ddd;
                      border-radius: 5px;
                  }
                  p {
                      margin: 10px 0;
                  }
                  .footer {
                      margin-top: 20px;
                      font-size: 0.9em;
                      color: #555;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h2>New Message from Contact Form</h2>
                  <p>Hello,</p>
                  <p>My name is <strong>${fname} ${lname}</strong>. Below is my message:</p>
                  <div class="message">
                      <p>${message}</p>
                  </div>
                  <p><strong>Email:</strong> ${email}</p>
                  <div class="footer">
                      <p>Best regards,<br/>${fname} ${lname}</p>
                  </div>
              </div>
          </body>
          </html>
      `
  };
  

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
  res.status(200).send('Email sent successfully');
} catch (error) {
  console.error('Error sending email:', error);
  res.status(500).send('Failed to send email');
}
});

app.get('/paginated-cities', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';

    let queryText = 'SELECT * FROM cities';
    let queryParams = [];
    let conditions = [];

    if (searchQuery) {
      conditions.push('LOWER(cityname) LIKE $' + (queryParams.length + 1));
      queryParams.push(`%${searchQuery}%`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY updateddate DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await pool.query(queryText, queryParams);

    let countQuery = 'SELECT COUNT(*) FROM cities';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const totalResult = await pool.query(countQuery, queryParams.slice(0, queryParams.length - 2));
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      cities: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/paginated-properties', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const propertyType = req.query.propertyType ? req.query.propertyType.trim() : ''; 

    let queryText = 'SELECT * FROM properties';
    let queryParams = [];
    let conditions = [];

    if (searchQuery) {
      conditions.push('LOWER(locationdetails) LIKE $' + (queryParams.length + 1));
      queryParams.push(`%${searchQuery}%`);
    }

    if (propertyType) {
      conditions.push('propertytype = $' + (queryParams.length + 1));
      queryParams.push(propertyType);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY updateddate DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await pool.query(queryText, queryParams);

    let countQuery = 'SELECT COUNT(*) FROM properties';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const totalResult = await pool.query(countQuery, queryParams.slice(0, queryParams.length - 2));
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      properties: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).send('Server error');
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
