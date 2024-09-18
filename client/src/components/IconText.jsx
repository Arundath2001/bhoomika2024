import React from "react";
import './IconText.css';

function IconText(props){
    return(
        <div className="icontext">
            <span>{props.svg}</span>
            <p className={`icontext_text ${props.border}`}>{props.text}</p>
        </div>
    );
}

export default IconText;