import React from "react";
import './ReviewsCard.css';
import quotes from "../assets/quotes.png";

function ReviewsCard({maintext , subtext , content , reviewimage}){
    return(
        <div className="reviewscard">
            <div className="reviewscard_top">
                <img className="reviewscard_img1" src={reviewimage} alt="review_img" />
                <div className="reviewcard_toptext">
                    <p className="toptext_main">{maintext}</p>
                    <p className="toptext_sub">{subtext}</p>
                </div>
                <img className="reviewscard_img2" src={quotes} alt="quotes" />
            </div>

            <div className="reviewscard_bottom">
                <p className="bottom_text">
                    {content}
                </p>
            </div>
        </div>
    );
}

export default ReviewsCard;