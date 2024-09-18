import React from "react";
import './Avatar.css';
import customer1 from "../assets/customer1.jpg";
import customer2 from "../assets/customer2.jpg";
import customer3 from "../assets/customer3.jpg";
import customer4 from "../assets/customer4.jpg";
import customer5 from "../assets/customer5.jpg";

function Avatar(){
    return(
        <div className="avatar">
            <div className="avatar_customer">
                <img className="avatar_img" src={customer1} alt="customer 1" />
                <img className="avatar_img" src={customer2} alt="customer 1" />
                <img className="avatar_img" src={customer3} alt="customer 1" />
                <img className="avatar_img" src={customer4} alt="customer 1" />
                <img className="avatar_img" src={customer5} alt="customer 1" />
                <div className="avatar_img plus">+</div>
            </div>
            <div className="avatar_text">72+ Happy <br /> Customers</div>
        </div>
    );
}

export default Avatar;
