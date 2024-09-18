import React from "react";
import './ReviewsText.css';

function ReviewsText(props){
    return(
        <div className="reviewstext">
            <p className="reviewtext_subpara">{props.textsub}</p>
            <p className="reviewtext_mainpara">{props.textmain}</p>
            <div className="reviewtext_star">
                <span class="star">{props.star}</span>
                <span class="star">{props.star}</span>
                <span class="star">{props.star}</span>
                <span class="star">{props.star}</span>
                <span class="star">{props.star}</span>
            </div>
        </div>
    );
}

export default ReviewsText;