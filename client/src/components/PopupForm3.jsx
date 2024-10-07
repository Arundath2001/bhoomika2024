import React, { useState, useEffect } from "react";
import './PopupForm3.css';
import DateInput from "./DateInput";
import InputNormal from "./InputNormal";
import PhoneInput from "./PhoneInput";
import ButtonNormal from "./ButtonNormal";
import TimeInput from "./TimeInput";
import axios from 'axios';
import LoadingScreen from "./LoadingScreen";
import AlertMessage from "./AlertMessage";

function PopupForm3({ onClose, propertyDetails }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ isVisible: false, message: '', isError: false });
    const [visitTimePeriod, setVisitTimePeriod] = useState('AM');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (phoneNumber.length !== 10) {
            setAlert({ isVisible: true, message: "Phone number must be exactly 10 digits.", isError: true });
            return;
        }
    
        setLoading(true);
    
        try {
            await axios.post('https://api.bhoomikarealestate.com/schedule-visit', {
                fullName,
                email,
                phoneNumber,
                visitDate,
                visitTime,
                visitTimePeriod, 
                propertyName: propertyDetails.propertyName,
                locationDetails: propertyDetails.locationDetails,
                description: propertyDetails.description,
                property_id: propertyDetails.property_id
            });
            
            setAlert({ isVisible: true, message: 'Visit scheduled successfully!', isError: false });
            setTimeout(() => {
                onClose(); 
            }, 2000);
        } catch (err) {
            console.error(err);
            setAlert({ isVisible: true, message: 'Error scheduling visit', isError: true });
        } finally {
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
        <div className="popupform3">
            <LoadingScreen isVisible={loading} text="Scheduling your visit..." />
            {alert.isVisible && <AlertMessage isVisible={alert.isVisible} message={alert.message} onClose={() => setAlert({ isVisible: false, message: '', isError: false })} isError={alert.isError} />}

            <h6>Schedule Your Visit</h6>
            <form className="popupform3_fields" onSubmit={handleSubmit}>
                <div className="popupform3_row1">
                    <InputNormal type="text" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    <InputNormal type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <PhoneInput type="number" label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                <div className="popupform3_row2">
                    <DateInput label="Visit Date" value={visitDate} onChange={setVisitDate} required />
                    <TimeInput 
    label="Visit Time" 
    value={visitTime} 
    onChange={setVisitTime} 
    period={visitTimePeriod} 
    onPeriodChange={setVisitTimePeriod} 
    required 
/>
                </div>

                <div className="propertyform_btns">
                    <ButtonNormal onClick={onClose} text="Cancel" btn_color="btn_white" />
                    <ButtonNormal type="submit" text="Submit" btn_color="btn_black" />
                </div>
            </form>
        </div>
    );
}

export default PopupForm3;
