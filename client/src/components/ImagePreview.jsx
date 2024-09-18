import React, { useState } from "react";
import './ImagePreview.css';

function ImagePreview({ previews, onRemove, width = '130px', height = '130px' }) {
    const [showPreviews, setShowPreviews] = useState(true); 

    return (
        <div className="imagepreview">
            {previews.length > 0 && (
                <button 
                    className="imagepreview_btn" 
                    onClick={() => setShowPreviews(!showPreviews)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024" fill="currentColor">
                        <path d={showPreviews ? "M8.2 751.4c0 8.6 3.4 17.401 10 24.001c13.2 13.2 34.8 13.2 48 0l451.8-451.8l445.2 445.2c13.2 13.2 34.8 13.2 48 0s13.2-34.8 0-48L542 251.401c-13.2-13.2-34.8-13.2-48 0l-475.8 475.8c-6.8 6.8-10 15.4-10 24.2z" : "M8.2 272.6c0-8.6 3.4-17.401 10-24.001c13.2-13.2 34.8-13.2 48 0l451.8 451.8l445.2-445.2c13.2-13.2 34.8-13.2 48 0s13.2 34.8 0 48L542 772.401c-13.2 13.2-34.8 13.2-48 0l-475.8-475.8c-6.8-6.8-10-15.4-10-24.2z"} />
                    </svg>
                </button>
            )}
            {showPreviews && (
                <div className="imagepreview_images">
                    {previews.map((src, index) => (
                        <div 
                            key={index} 
                            className="imagepreview_preview" 
                            style={{ width, height }}
                        >
                            <img src={src} alt={`preview ${index}`} />
                            <button className="imagepreview_removebtn" onClick={() => onRemove(index)}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" clip-rule="evenodd"/><path fill="currentColor" d="M11.854 4.854a.5.5 0 0 0-.707-.707L8 7.293L4.854 4.147a.5.5 0 1 0-.707.707L7.293 8l-3.146 3.146a.5.5 0 0 0 .707.708L8 8.707l3.147 3.147a.5.5 0 0 0 .707-.708L8.708 8z"/></svg></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ImagePreview;
