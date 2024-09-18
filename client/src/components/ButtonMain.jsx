import React from "react";
import './ButtonMain.css';

function ButtonMain(props){
    return(
        <div onClick={props.onClick} className={`buttonmain ${props.bgColor}`}>
            <p className={`buttonmain_para ${props.textColor}`}>{props.value}</p> 
            {props.svg ? ( <span className="buttonmain_svg">{props.svg}</span>) : (<img src={props.img} />) }
        </div>
    );
}

export default ButtonMain;