import React from "react";
import './ButtonNormal.css';

function ButtonNormal({text , btn_color , onClick}){
    return(
        <div className="buttonnormal">
            <button onClick={onClick} className={`${btn_color}`}>{text}</button>
        </div>
    );
}

export default ButtonNormal;