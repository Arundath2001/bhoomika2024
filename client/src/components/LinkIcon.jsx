import React from "react";
import './LinkIcon.css';
import { Link } from "react-router-dom";


function LinkIcon(props){
    return(
        <div className={`linkicon ${props.textColor}`}>
            {props.svg1}
            <Link to={props.link}>{props.text}</Link>
            {props.svg2}
        </div>
    );
}

export default LinkIcon;