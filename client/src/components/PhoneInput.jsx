import React from "react";
import './PhoneInput.css';

function PhoneInput({id , type , label , name , value , onChange , required = false}){
    return(
        <div className="phoneinput">
            <label htmlFor={id}>{label} {required && "*"}</label>

            <div className="phoneinput_field">
                <select className="phoneinput_countrycode" defaultValue="+91">
                    <option value="+91">+91</option>
                </select>
                <input type={type} id={id} name={name} value={value} onChange={onChange} required={required} className="phoneinput_input" />
                </div>
        </div>
    );
}

export default PhoneInput;