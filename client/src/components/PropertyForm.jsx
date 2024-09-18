import React, { useState, useEffect } from "react";
import "./PropertyForm.css";
import SelectNormal from "./SelectNormal";
import TextArea from "./TextArea";
import InputUpload from "./InputUpload";
import InputDrop from "./InputDrop";
import InputNormal from "./InputNormal";
import PhoneInput from "./PhoneInput";
import ButtonNormal from "./ButtonNormal";
import ImagePreview from "./ImagePreview";
import axios from "axios";
import AlertMessage from "./AlertMessage";
import LoadingScreen from "./LoadingScreen";
import imageCompression from "browser-image-compression";
import AlertBox from "./AlertBox";

function PropertyForm({
  mode,
  setIsFormOpen,
  propertyData,
  onSubmit,
  setSelectedIds,
  submitUrl,
  showImageUpload,
  span,
  heading,
  setRequired,
  showPropertyName,
  showContactMessage,
  setName
}) {
  const [propertyType, setPropertyType] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [commercialType, setCommercialType] = useState("");
  const [rentalType, setRentalType] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [numOfRooms, setNumOfRooms] = useState("");
  const [numOfBedRooms, setNumOfBedRooms] = useState("");
  const [numOfToilets, setNumOfToilets] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [plotSize, setPlotSize] = useState({ input: "", unit: "Cent" });
  const [budget, setBudget] = useState({ input: "", unit: "Lakhs" });
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [alertMessage, setAlertMessage] = useState({
    isVisible: false,
    message: "",
    isError: false,
  });
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    if (mode === "edit" && propertyData) {
      setPropertyType(propertyData.propertytype);
      setFullName(propertyData.fullname);
      setPhoneNumber(propertyData.phonenumber);
      setPropertyName(propertyData.propertyname || "");
      setNumOfRooms(propertyData.numofrooms);
      setNumOfBedRooms(propertyData.numofbedrooms);
      setCommercialType(propertyData.commercialType);
      setRentalType(propertyData.rentalType);
      setNumOfToilets(propertyData.numoftoilets);
      setLocationDetails(propertyData.locationdetails);

      const [input, unit] = propertyData.plotsize.split(" ");
      setPlotSize({ input: input || "", unit: unit || "Cent" });
      const [budgetInput, budgetUnit] = propertyData.budget.split(" ");
      setBudget({ input: budgetInput || "", unit: budgetUnit || "Lakhs" });
      setDescription(propertyData.description || "");

      setExistingImages(propertyData.imageurls || []);
    }
  }, [mode, propertyData]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > 6) {
      setAlertMessage({
        isVisible: true,
        message: "You can only upload up to 6 images.",
        isError: true,
      });
      return;
    }

    const compressedFilesPromises = selectedFiles.map(async (file) => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
      } catch (error) {
        console.error("Error compressing file", error);
        return file;
      }
    });

    const compressedFiles = await Promise.all(compressedFilesPromises);

    setFiles((prevFiles) => [...prevFiles, ...compressedFiles]);

    const newPreviews = compressedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index, isNew = true) => {
    if (isNew) {
      const updatedFiles = files.filter((_, i) => i !== index);
      const updatedPreviews = previews.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
    } else {
      const updatedImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedImages);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedIds([]);
  };

  const isFieldValid = (value, isRequired) => {
    return !isRequired || (isRequired && value.trim() !== "");
  };  

  const handleSubmit = async () => {
    if (
      !isFieldValid(propertyType, true) ||
      !isFieldValid(fullName, true) ||
      !isFieldValid(phoneNumber, true) ||
      !isFieldValid(locationDetails, setRequired) ||
      !isFieldValid(plotSize.input, setRequired) ||
      !isFieldValid(budget.input, setRequired)
    ) {
      setAlertMessage({
        isVisible: true,
        message: "Please fill in all the required fields.",
        isError: true,
      });
      return;
    }

    if (propertyType === "Land" && !description) {
      setAlertMessage({
        isVisible: true,
        message: "Please provide a description for the land.",
        isError: true,
      });
      return;
    }

    if (phoneNumber.length !== 10) {
      setAlertMessage({
        isVisible: true,
        message: "Phone number must be exactly 10 digits.",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setAlertText("Submitting form...");
    setAlertVisible(true);

    const combinedPlotSize = `${plotSize.input} ${plotSize.unit}`;
    const combinedBudget = `${budget.input} ${budget.unit}`;

    const formData = new FormData();
    formData.append("propertyType", propertyType || "");
    formData.append("fullName", fullName || "");
    formData.append("phoneNumber", phoneNumber || "");
    formData.append("numOfRooms", Number(numOfRooms) || 0);
    formData.append("numOfBedRooms", Number(numOfBedRooms) || 0);
    formData.append("commercialType", commercialType || "");
    formData.append("rentalType", rentalType || "");
    formData.append("numOfToilets", Number(numOfToilets) || 0);
    formData.append("locationDetails", locationDetails || "");
    formData.append("plotSize", combinedPlotSize || "");
    formData.append("budget", combinedBudget || "");
    formData.append("description", description || "");

    if (showPropertyName) {
      formData.append("propertyName", propertyName || "");
    }

    if (showImageUpload) {
      files.forEach((file) => formData.append("files", file));
    }

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      let response;
      if (mode === "edit" && propertyData) {
        response = await axios.put(
          `${submitUrl}/${propertyData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axios.post(submitUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSelectedIds([]);

      setAlertText("Property submitted successfully!");
      setTimeout(() => {
        handleCloseForm();
        onSubmit(response.data);
        setAlertVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting form", error);
      // setAlertText("Failed to submit form. Please try again.");
      setAlertMessage({
        isVisible: true,
        message: "Failed to submit form. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="propertyform">
      <h6>
        {mode === "edit" ? (
          <>
            <span>Edit</span> {propertyData ? propertyData.propertyName : ""}
          </>
        ) : (
          <>
            <span>{span}</span> {heading}
          </>
        )}
      </h6>

      <div className="propertyform_fields">
        <SelectNormal
          options={[
            "Land",
            "Commercial",
            "House",
            "Villa",
            "Rental",
            "Farm Land",
            "Industrial",
          ]}
          defaultOption="Select Property Type"
          onChange={(e) => setPropertyType(e.target.value)}
          label="Property Type"
          value={propertyType}
          required
        />

        <div className="propertyform_row3">
          {propertyType === "Commercial" && (
            <>
              <SelectNormal
                options={["Plot", "Building"]}
                defaultOption="Select Commercial Type"
                onChange={(e) => setCommercialType(e.target.value)}
                label="Commercial Type"
                value={commercialType}
                required={setRequired ? true : false}
              />
              {commercialType === "Building" && (
                <InputNormal
                  type="number"
                  label="Number of Rooms"
                  required={setRequired ? true : false}
                  value={numOfRooms}
                  onChange={(e) => setNumOfRooms(e.target.value)}
                />
              )}
            </>
          )}

          {propertyType === "Rental" && (
            <>
              <SelectNormal
                options={["House", "Flat"]}
                defaultOption="Select Rental Type"
                onChange={(e) => setRentalType(e.target.value)}
                label="Rental Type"
                value={rentalType}
                required={setRequired ? true : false}
              />

              <InputNormal
                type="number"
                label="Number of Rooms"
                required={setRequired ? true : false}
                value={numOfRooms}
                onChange={(e) => setNumOfRooms(e.target.value)}
              />
            </>
          )}
        </div>

        {(propertyType === "House" || propertyType === "Villa") && (
          <>
            <InputNormal
              type="text"
              label={setName ? 'Property Holder Name' : 'Full Name'}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <PhoneInput
              type="number"
              label="Phone Number"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {showPropertyName && (
              <InputNormal
                type="text"
                label="Property Name"
                required={setRequired ? true : false}
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            )}
            <div className="propertyform_row1">
              <InputNormal
                type="number"
                label="Number of Bed Rooms"
                required={setRequired ? true : false}
                value={numOfBedRooms}
                onChange={(e) => setNumOfBedRooms(e.target.value)}
              />
              <InputNormal
                type="number"
                label="Number of Baths"
                required={setRequired ? true : false}
                value={numOfToilets}
                onChange={(e) => setNumOfToilets(e.target.value)}
              />
            </div>

          </>
        )}

        {(propertyType === "Commercial" ||
          propertyType === "Land" ||
          propertyType === "Farm Land" ||
          propertyType === "Industrial" ||
          propertyType === "Rental") && (
          <>
            <InputNormal
              type="text"
              label={setName ? 'Property Holder Name' : 'Full Name'}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <PhoneInput
              type="number"
              label="Phone Number"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          
          </>
        )}

        <InputNormal
          label="Location Details"
          required
          value={locationDetails}
          onChange={(e) => setLocationDetails(e.target.value)}
        />

        <TextArea
          label="Description"
          required={propertyType === "Land"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {showImageUpload && (
          <>
            <InputUpload
              label="Upload Images"
              required={setRequired ? true : false}
              onChange={handleFileChange}
            />

            <ImagePreview
              previews={[...previews, ...existingImages]}
              onRemove={handleRemoveImage}
            />
          </>
        )}

        <div className="propertyform_row2">
          <InputDrop
            type="number"
            label="Size of Plot"
            required={setRequired ? true : false}
            value={plotSize}
            onChange={(value) => setPlotSize(value)}
          />
          <InputDrop
            type="number"
            label={`Budget per ${plotSize.unit === 'Cent' ? 'Cent' : 'Sq ft'}`}
            required={setRequired ? true : false}
            value={budget}
            onChange={(value) => setBudget(value)}
          />
        </div>

        <div className="propertyform_btns">
          <ButtonNormal
            onClick={handleCloseForm}
            text="Cancel"
            btn_color="btn_white"
          />
          <ButtonNormal
            onClick={handleSubmit}
            text="Submit"
            btn_color="btn_black"
          />
        </div>
      </div>

      <AlertMessage
        isVisible={alertMessage.isVisible}
        message={alertMessage.message}
        isError={alertMessage.isError}
        onClose={() => setAlertMessage({ ...alertMessage, isVisible: false })}
      />

      <LoadingScreen isVisible={loading} text="Submitting form..." />

      {alertVisible && (
        <AlertBox showContactMessage={showContactMessage} text={loading ? "Submitting form..." : alertText} />
      )}
    </div>
  );
}

export default PropertyForm;
