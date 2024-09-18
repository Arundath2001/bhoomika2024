import React from "react";
import './IconButton.css';

function IconButton({img , text , isSelected , onClick}){
    return(
        <div onClick={onClick} className={`iconbutton ${isSelected ? 'selected' : ''}`}>
            <img src={img} alt="icon" />
            <p className="iconbutton_text">{text}</p>
        </div>
    );
}

export default IconButton;