import React, { useState } from "react";
import './TimeInput.css';

function TimeInput({ id, label, required, value, onChange, period, onPeriodChange }) {
    const handleTimeChange = (e) => {
        onChange(e.target.value);
    };

    const handlePeriodChange = (e) => {
        onPeriodChange(e.target.value);
    };

    return (
        <div className="timeinput">
            <label htmlFor={id}>{label} {required && "*"}</label>
            <div className="timeinput_field">
                <input
                    type="time"
                    value={value}
                    onChange={handleTimeChange}
                    className="timeinput_input"
                />
                <select value={period} onChange={handlePeriodChange} className="timeinput_select">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
}

export default TimeInput;
