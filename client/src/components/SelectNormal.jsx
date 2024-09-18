import React from "react";
import './SelectNormal.css';

function SelectNormal({ id, label, required = false, onChange, options = [], defaultOption = "Select" }) {
    return (
        <div className="selectnormal">
            <label htmlFor={id}>{label} {required && "*"}</label>
            <select onChange={onChange} className="selectnormal_select" defaultValue={defaultOption}>
                <option disabled>{defaultOption}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectNormal;
