import React from "react";
import './InputDrop.css';

function InputDrop({ id, type, label, name, value, onChange, required = false }) {
    const { input, unit } = value;

    const handleInputChange = (e) => {
        onChange({ ...value, input: e.target.value });
    };

    const handleSelectChange = (e) => {
        onChange({ ...value, unit: e.target.value });
    };

    return (
        <div className="inputdrop">
            <label htmlFor={id}>{label} {required && "*"}</label>
            <div className="inputdrop_field">
                <input
                    className="inputdrop_input"
                    name={`${name}-input`}
                    value={input}
                    onChange={handleInputChange}
                    type={type}
                />
                <select
                    className="inputdrop_select"
                    name={`${name}-select`}
                    value={unit}
                    onChange={handleSelectChange}
                >
                    {label === "Size of Plot" ? (
                        <>
                            <option value="Cent">Cent</option>
                            <option value="sq ft">sq ft</option>
                            <option value="sq ft">Acres</option>
                        </>
                    ) : (
                        <>
                            <option value="Lakhs">Lakhs</option>
                            <option value="Thousands">Thousands</option>
                            <option value="Crores">Crores</option>
                        </>
                    )}
                </select>
            </div>
        </div>
    );
}

export default InputDrop;
