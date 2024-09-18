import React from "react";
import './AlertBox.css';
import logo from "../assets/mainlogo.png";

function AlertBox({ text,showContactMessage }) {
    return (
        <div className="alertbox">
            <div className="alertbox_main">
            <img src={logo} alt="logo" />
            <div className="alertbox_cont">
                {(text === 'Submitting form...'|| text === 'Loading...' ) ? (
                    <div className="alertbox_loading">
                        <div className="alertbox_spinner"></div> 
                        <p className="alertbox_loadtext">Loading...</p>
                    </div>
                ) : (
                    <div className="alertbox_text">
                        <p className="alertbox_maintext">{text || 'Thank you for your message!'}</p>
                    {
                        showContactMessage && (<p className="alertbox_subtext">The Bhoomika team will contact you soon.</p>)
                    }
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}

export default AlertBox;
