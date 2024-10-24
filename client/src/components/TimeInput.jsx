import React, { useState, useEffect } from "react";
import './TimeInput.css';

function TimeInput({ id, label, required, value, onChange, period, onPeriodChange }) {
    const [time, setTime] = useState(value);

    useEffect(() => {
        if (value) {
            const [hours, minutes] = value.split(":");
            let hour = parseInt(hours, 10);
            const isPM = hour >= 12;
            const period = isPM ? "PM" : "AM";
            hour = hour % 12 || 12; 
            const formattedTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
            setTime(formattedTime);
            onPeriodChange(period);
        }
    }, [value, onPeriodChange]);

    const handleTimeChange = (e) => {
        let [hours, minutes] = e.target.value.split(":");
        hours = parseInt(hours, 10);

        if (period === "PM" && hours < 12) {
            hours += 12;
        } else if (period === "AM" && hours === 12) {
            hours = 0; 
        }

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        onChange(formattedTime); 
        setTime(e.target.value); 
    };

    const handlePeriodChange = (e) => {
        onPeriodChange(e.target.value);
        const newPeriod = e.target.value;
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours, 10);

        if (newPeriod === "PM" && hour < 12) {
            onChange(`${(hour + 12).toString().padStart(2, '0')}:${minutes}`);
        } else if (newPeriod === "AM" && hour === 12) {
            onChange(`00:${minutes}`); 
        }
    };

    return (
        <div className="timeinput">
            <label htmlFor={id}>
                {label} {required && "*"}
            </label>
            <div className="timeinput_field">
                <input
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    className="timeinput_input"
                    required={required}
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
