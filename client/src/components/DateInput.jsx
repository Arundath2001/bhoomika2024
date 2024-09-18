import React, { useState } from "react";
import './DateInput.css';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import date from "../assets/date.png";

function DateInput({ label, id, required = false, onChange }) {
    const [startDate, setStartDate] = useState(null);

    const handleDateChange = (date) => {
        setStartDate(date);
        if (onChange) onChange(date ? date.toISOString().split('T')[0] : '');
    };

    return (
        <div className="dateinput">
            <label htmlFor={id}>{label} {required && "*"}</label>
            <div className="dateinput_field">
                <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={startDate}
                    onChange={handleDateChange}
                    id={id}
                    className="dateinput_date"
                />
                <img src={date} alt="date_img" />
            </div>
        </div>
    );
}

export default DateInput;
