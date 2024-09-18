import React from "react";
import './FormLine.css';

function FormLine({color}){
    return(
        <div className={`formline ${color}`}></div>
    );
}

export default FormLine;