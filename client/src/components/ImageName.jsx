import React from "react";
import './ImageName.css';

function ImageName({ img }) {
    const name = localStorage.getItem('userName') || 'Guest';
    const role = localStorage.getItem('userRole') || 'User';

    return (
        <div className="imagename">
            <img src={img} alt="Admin Photo" />
            <div className="imagename_data">
                <p className="imagename_name">{name}</p>
                <p className="imagename_role">{role}</p>
            </div>
        </div>
    );
}

export default ImageName;
