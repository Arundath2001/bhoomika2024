import React from "react";
import './MainHead.css';

function MainHead(props){
    return(
        <div className="mainhead">
            <h4>{props.maintext}</h4>
            <p>{props.subtext}</p>
        </div>
    );
}

export default MainHead;