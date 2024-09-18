import React from "react";
import './DetailsCard.css';

function DetailsCard(props){
    return(
        <div className="detailscard">
            <img src={props.img} alt="house" />
            <div className="detailscard_maintext">{props.maintext}</div>
            <div className="detailscard_subtext">{props.subtext}</div>
        </div>
    );
}

export default DetailsCard;