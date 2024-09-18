import React, { useRef } from "react";
import './InputUpload.css';

function InputUpload({ label, required = false, onChange }) {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="inputupload">
            <label>
                {label} {required && "*"}
            </label>
            <button 
                type="button" 
                onClick={handleButtonClick}
            >
                Choose Files
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={onChange} 
                className="hidden-upload-input"
                multiple
                name="files"
            />
        </div>
    );
}

export default InputUpload;
