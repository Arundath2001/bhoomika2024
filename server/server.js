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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
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
      const imageUrl = file.path;
      updateQuery += ', imageUrl = $3';
      values.push(imageUrl);
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
    budget, description, commercialType, rentalType
  } = req.body;
  const files = req.files;

  if (!propertyType || !fullName || !phoneNumber || !locationDetails || !plotSize || !budget) {
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
  ];

  try {
    await pool.query(
      `INSERT INTO properties (propertyType, fullName, phoneNumber, propertyName, numOfRooms, numOfToilets, locationDetails, plotSize, budget, description, imageUrls, numOfBedRooms, commercialType, rentalType)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      values
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties 
       WHERE locationDetails ILIKE $1
       OR description ILIKE $1`,
      [`%${locationDetails}%`]
    );

    const availableProperties = parseInt(countResult.rows[0].count, 10);

    await pool.query(
      'UPDATE cities SET availableProperties = $1 WHERE cityName = $2',
      [availableProperties, locationDetails]
    );

    res.status(201).send('Property added and city updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});




app.put('/properties/:id', propertyUpload.array('files', 6), async (req, res) => {
  const { id } = req.params;
  const {
    propertyType, fullName, phoneNumber, propertyName,
    numOfRooms, numOfToilets, locationDetails, plotSize,
    budget, rentalType, commercialType, numOfBedRooms
  } = req.body;
  const files = req.files;

  try {
    let updateQuery = `UPDATE properties 
      SET propertyType = $1, fullName = $2, phoneNumber = $3, propertyName = $4, 
      numOfRooms = $5, numOfToilets = $6, locationDetails = $7, plotSize = $8, 
      budget = $9, numOfBedRooms = $10, rentalType = $11, commercialType = $12`;

    const values = [
      propertyType || null,
      fullName || null,
      phoneNumber || null,
      propertyName || null,
      parseInt(numOfRooms, 10) || null,
      parseInt(numOfToilets, 10) || null,
      locationDetails || null,
      plotSize || null,
      budget || null,
      parseInt(numOfBedRooms, 10) || null,
      rentalType || null,
      commercialType || null
    ];

    if (files && files.length > 0) {
      const imageUrls = files.map(file => path.join('uploads', 'properties', file.filename));
      updateQuery += ', imageUrls = $13';
      values.push(JSON.stringify(imageUrls));
    }

    updateQuery += ' WHERE id = $' + (files && files.length > 0 ? '14' : '13');
    values.push(id);

    await pool.query(updateQuery, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties 
       WHERE locationDetails ILIKE $1
       OR description ILIKE $1`,
      [`%${locationDetails}%`]
    );

    const availableProperties = parseInt(countResult.rows[0].count, 10);

    await pool.query(
      'UPDATE cities SET availableProperties = $1 WHERE cityName = $2',
      [availableProperties, locationDetails]
    );

    res.send('Property updated and city count recalculated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
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

  try {
    const properties = await pool.query('SELECT imageurls FROM properties WHERE id = ANY($1::int[])', [ids]);

    for (const property of properties.rows) {
      const imageUrlsStr = property.imageurls; 

      if (!imageUrlsStr || imageUrlsStr.length === 0) {
        console.warn('No imageUrls found for property:', property);
        continue; 
      }

      if (Array.isArray(imageUrlsStr)) {
        console.log('Fetched imageUrls:', imageUrlsStr);

        for (const imageUrl of imageUrlsStr) {
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
      } else {
        console.warn('ImageUrls is not an array:', imageUrlsStr);
      }
    }

    await pool.query('DELETE FROM properties WHERE id = ANY($1::int[])', [ids]);

    res.send('Properties deleted');
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
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
    description 
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
    rentalType || null
  ];

  try {
    await pool.query(
      `INSERT INTO enquiry 
        (fullName, phone, propertyType, numOfRooms, numOfToilets, locationDetails, plotSize, budget, description, numOfBedRooms, commercialType, rentalType) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, 
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
  const { fullName, email, phoneNumber, visitDate, visitTime, propertyName, locationDetails } = req.body;

  console.log({
    fullName,
    email,
    phoneNumber,
    visitDate,
    visitTime,
    propertyName,
    locationDetails
  });

  const formattedVisitDate = visitDate && visitDate.trim() !== '' ? visitDate : null;
  const formattedVisitTime = visitTime && visitTime.trim() !== '' ? visitTime : null;

  try {
    await pool.query(
      'INSERT INTO visit_schedules (fullname, email, phone_number, visit_date, visit_time, property_name, location_details) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [fullName, email, phoneNumber, formattedVisitDate, formattedVisitTime, propertyName, locationDetails]
    );
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
    description
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
    rentalType || null
  ];

  try {
    await pool.query(
      `INSERT INTO selling_info (fullName, phone, propertyType, propertyName, numOfRooms, numOfToilets, locationDetails, plotSize, budget, imageUrls, description, numOfBedRooms, commercialType, rentalType)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, 
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
          service: 'gmail', 
          auth: {
              user: "todolistemailofficial@gmail.com", 
              pass: "urmb ilpc szxo kyjv" 
          }
      });

     
     const mailOptions = {
      from: `"${fname} ${lname}" <${email}>`,
      to: 'dilna@bhoomikarealestate.com', 
      subject: 'New Message from Portfolio Contact Form', 
      html: `
          <html>
          <head>
              <style>
                  /* Add CSS styles here if needed */
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      border: 1px solid #ccc;
                      border-radius: 5px;
                      background-color: #f9f9f9;
                  }
                  .message {
                      margin-top: 20px;
                      padding: 10px;
                      background-color: #fff;
                      border: 1px solid #ddd;
                      border-radius: 5px;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h2>Hello,</h2>
                  <p>My name is ${fname} ${lname}. Below is my message:</p>
                  <div class="message">
                      <p>${message}</p>
                  </div>
                  <p><strong>Email:</strong> ${email}</p>
                  <p>Best regards,<br/>${fname} ${lname}</p>
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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));