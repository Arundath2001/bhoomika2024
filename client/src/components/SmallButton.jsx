import React from "react";
import './SmallButton.css';

function SmallButton({svgColor , svg , onClick}){
    return(
        <div onClick={onClick} className="smallbutton">
            <span className={`${svgColor}`}>{svg}</span>
        </div>
    );
}

export default SmallButton;