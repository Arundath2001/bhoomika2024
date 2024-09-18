import React from "react";
import './InputNormal.css';

function InputNormal({ id, type, value, onChange, label, name, required = false }) {
    return (
        <div className="inputnormal">
            <label htmlFor={id}>
                {label} {required && "*"}
            </label>
            <input
                type={type}
                id={id}
                name={name} 
                value={value}
                onChange={onChange}
                required={required} 
            />
        </div>
    );
}

export default InputNormal;
