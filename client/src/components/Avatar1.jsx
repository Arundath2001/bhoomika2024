import React from "react";
import './Avatar1.css';
import post from "../assets/post.jpg";

function Avatar1(){
    return(
        <div className="avatar1">
            <img src={post} alt="post" />
            <div className="avatar1_text">10+ New <br /> Listings Everyday!</div>
        </div>
    );
}

export default Avatar1;