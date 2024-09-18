import React, { useState, useEffect } from "react";
import axios from "axios";
import './PopupForm2.css';
import InputNormal from "./InputNormal";
import InputDrop from "./InputDrop";
import PhoneInput from "./PhoneInput";
import ButtonNormal from "./ButtonNormal";
import TextArea from "./TextArea";
import SelectNormal from "./SelectNormal";
import InputUpload from "./InputUpload";
import ImagePreview from "./ImagePreview";
import LoadingScreen from "./LoadingScreen";
import AlertMessage from "./AlertMessage";

function PopupForm2({ onClose }) {
    const [propertyType, setPropertyType] = useState('');
    const [plotSize, setPlotSize] = useState({ input: '', unit: 'Cent' });
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [propertyName, setPropertyName] = useState('');
    const [numOfRooms, setNumOfRooms] = useState('');
    const [numOfToilets, setNumOfToilets] = useState('');
    const [locationDetails, setLocationDetails] = useState('');
    const [budget, setBudget] = useState({ input: '', unit: 'Lakhs' });
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ isVisible: false, message: '', isError: false });

    const handlePropertyChange = (e) => {
        setPropertyType(e.target.value);
    };

    const handlePlotSizeChange = (newValue) => {
        setPlotSize(newValue);
    };

    const handleBudgetChange = (newValue) => {
        setBudget(newValue);
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        if (files.length + selectedFiles.length > 6) {
            setAlert({ isVisible: true, message: 'You can only upload up to 6 images.', isError: true });
            return;
        }

        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setFilePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    };

    const handleRemovePreview = (index) => {
        setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles.splice(index, 1);
            return newFiles;
        });

        setFilePreviews(prevPreviews => {
            const newPreviews = [...prevPreviews];
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName || !phone || !propertyType || !locationDetails || !plotSize.input || !budget.input) {
            setAlert({ isVisible: true, message: "Please fill in all required fields.", isError: true });
            return;
        }

        if (phone.length !== 10) {
            setAlert({ isVisible: true, message: "Phone number must be exactly 10 digits.", isError: true });
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('phone', phone);
        formData.append('propertyType', propertyType);
        formData.append('locationDetails', locationDetails);
        formData.append('plotSize', `${plotSize.input} ${plotSize.unit}`);
        formData.append('budget', `${budget.input} ${budget.unit}`);

        if (propertyType === 'House' || propertyType === 'Villa') {
            formData.append('propertyName', propertyName);
            formData.append('numOfRooms', numOfRooms);
            formData.append('numOfToilets', numOfToilets);
        }

        if (propertyType === 'Land' || description) {
            formData.append('description', description);
        }

        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await axios.post('http://93.127.167.205:5000/selling-info', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                setAlert({ isVisible: true, message: 'Form submitted successfully!', isError: false });
                setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                }, 2000); 
            }
        } catch (error) {
            console.error("Error submitting the form", error);
            setAlert({ isVisible: true, message: 'Error submitting the form', isError: true });
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoading && alert.isVisible) {
            const timer = setTimeout(() => {
                setAlert({ isVisible: false, message: '', isError: false });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isLoading, alert]);

    return (
        <div className="popupform2">
            <LoadingScreen isVisible={isLoading} text="Submitting your form..." />
            {alert.isVisible && <AlertMessage isVisible={alert.isVisible} message={alert.message} onClose={() => setAlert({ isVisible: false, message: '', isError: false })} isError={alert.isError} />}

            <h6>Sell Your Property Fast: Get Started Here!</h6>

            <form className="popupform2_fields" onSubmit={handleSubmit}>
                <InputNormal label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <PhoneInput type="number" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <SelectNormal options={["Land", "Commercial", "House", "Villa", "Rental", "Farm Land", "Industrial"]} defaultOption="Select Property Type" onChange={handlePropertyChange} label="Property Type" required />

                {(propertyType === 'House' || propertyType === 'Villa') && (
                    <div className="popupform2_rowmain">
                        <InputNormal label="Property Name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
                        <div className="popupform2_row1">
                            <InputNormal label="Number of Rooms" value={numOfRooms} onChange={(e) => setNumOfRooms(e.target.value)} />
                            <InputNormal label="Number of Toilets" value={numOfToilets} onChange={(e) => setNumOfToilets(e.target.value)} />
                        </div>
                    </div>
                )}

                <TextArea label="Location Details" value={locationDetails} onChange={(e) => setLocationDetails(e.target.value)} required />

                <TextArea 
                    label="Description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required={propertyType === 'Land'} 
                />

                <InputUpload label="Upload Images" required onChange={handleFileChange} />

                <ImagePreview previews={filePreviews} onRemove={handleRemovePreview} />

                <div className="popupform2_row2">
                    <InputDrop 
                        label="Size of Plot" 
                        value={plotSize} 
                        onChange={handlePlotSizeChange} 
                        required 
                        type="number"
                    />
                    <InputDrop 
                        label={`Budget per ${plotSize.unit === 'Cent' ? 'Cent' : 'Sq ft'}`} 
                        value={budget} 
                        onChange={handleBudgetChange} 
                        required 
                        type="number"
                    />
                </div>

                <div className="popupform2_btns">
                    <ButtonNormal onClick={onClose} text="Cancel" btn_color="btn_white" />
                    <ButtonNormal text="Submit" btn_color="btn_black" type="submit" />
                </div>
            </form>
        </div>
    );
}

export default PopupForm2;
