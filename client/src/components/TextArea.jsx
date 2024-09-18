import React from "react";
import './TextArea.css';

function TextArea({ id, label, value, onChange, name, required = false }) {
    return (
        <div className="textarea">
            <label htmlFor={id}>{label} {required && "*"}</label>
            <textarea
                id={id}
                name={name}
                value={value} 
                onChange={onChange} 
            />
        </div>
    );
}

export default TextArea;
