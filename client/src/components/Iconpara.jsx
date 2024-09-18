import React from "react";
import './Iconpara.css';

function Iconpara(props) {
    const linkType = props.mail ? 'mailto:' : props.tel ? 'tel:' : '';

    return (
        <div className={`iconpara ${props.addclass}`}>
            <img src={props.img} alt={props.text} />
            {
                linkType ? (
                    <a href={`${linkType}${props.mail || props.tel}`}>
                        {props.mail || props.tel}
                    </a>
                ) : (
                    <p className="iconpara_text">{props.text}</p>
                )
            }  
        </div>
    );
}

export default Iconpara;
