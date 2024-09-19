import React, { useState, useEffect } from "react";
import './PopupForm1.css';
import PhoneInput from "./PhoneInput";
import InputDrop from "./InputDrop";
import InputNormal from "./InputNormal";
import TextArea from "./TextArea";
import ButtonNormal from "./ButtonNormal";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";
import AlertMessage from "./AlertMessage";
import SelectNormal from "./SelectNormal";


function PopupForm1({ onClose }) {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        propertyType : "",
        location: "",
        plotSize: { input: "", unit: "Cent" },
        budget: { input: "", unit: "Lakhs" },
        description: ""
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ isVisible: false, message: '', isError: false });

    const handlePropertyChange = (e) => {
        const { value } = e.target;
        setFormData(prevData => ({ ...prevData, propertyType: value }));
    };

    const handleNormalChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleDropChange = (name, newValue) => {
        setFormData(prevData => ({ ...prevData, [name]: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phone.length !== 10) {
            setAlert({ isVisible: true, message: "Phone number must be exactly 10 digits.", isError: true });
            return;
        }

        setLoading(true);

        const plotSize = `${formData.plotSize.input} ${formData.plotSize.unit}`;
        const budget = `${formData.budget.input} ${formData.budget.unit}`;

        try {
            await axios.post('http://localhost:5000/enquiries', {
                ...formData,
                plotSize,
                budget
            });
            
            setAlert({ isVisible: true, message: "Your enquiry has been submitted successfully!", isError: false });
            setTimeout(() => {
                setLoading(false);
                onClose();
            }, 2000); 
        } catch (error) {
            console.error("Error submitting the form", error);
            setAlert({ isVisible: true, message: "There was an error submitting your enquiry. Please try again.", isError: true });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && alert.isVisible) {
            const timer = setTimeout(() => {
                setAlert({ isVisible: false, message: '', isError: false });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [loading, alert]);

    return (
        <div className="popupform1">
            <LoadingScreen isVisible={loading} text="Submitting your enquiry..." />
            {alert.isVisible && <AlertMessage isVisible={alert.isVisible} message={alert.message} onClose={() => setAlert({ isVisible: false, message: '', isError: false })} isError={alert.isError} />}
            <h6>Explore Land Options: Share Your <br /> Requirements Today!</h6>

            <form className="popupform1_fields" onSubmit={handleSubmit}>
                <InputNormal type="text" label="Full Name" name="fullName" value={formData.fullName} onChange={handleNormalChange} required />
                <PhoneInput type="number" label="Phone" name="phone" value={formData.phone} onChange={handleNormalChange} required />
                <SelectNormal value={formData.propertyType} onChange={handlePropertyChange} label="Property Type" required />
                <InputNormal type="text" label="Preferred Location" name="location" value={formData.location} onChange={handleNormalChange} required />
                <div className="popupform1_row">
                    <InputDrop
                        label="Size of Plot"
                        name="plotSize"
                        value={formData.plotSize}
                        onChange={(newValue) => handleDropChange('plotSize', newValue)}
                        required
                        type="number"
                    />
                    <InputDrop
                        label={`Budget per ${formData.plotSize.unit === 'Cent' ? 'Cent' : 'Sq ft'}`} 
                        name="budget"
                        value={formData.budget}
                        onChange={(newValue) => handleDropChange('budget', newValue)}
                        required
                        type="number"
                    />
                </div>
                <TextArea label="Description" name="description" value={formData.description} onChange={handleNormalChange} />
                <div className="popupform1_btns">
                    <ButtonNormal onClick={onClose} text="Cancel" btn_color="btn_white" />
                    <ButtonNormal type="submit" text="Submit" btn_color="btn_black" />
                </div>
            </form>
        </div>
    );
}

export default PopupForm1;
