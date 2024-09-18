import React, { useState, useEffect } from "react";
import './Reviews.css';
import ReviewsText from "./ReviewsText";
import ReviewsCard from "./ReviewsCard";
import review from "../assets/review.png";
import review1 from "../assets/review1.png";

const reviewsData = [
    { reviewimage: review, maintext: "Cameron Williamson", subtext: "Designer", content: "I had a fantastic experience using Bhoomika Real Estate to find the perfect plot for my new home. The website is user-friendly and has a wide range of listings. The detailed descriptions and high-quality images made it easy to narrow down my options.Highly recommend for anyone looking for quality properties." },
    { reviewimage: review1, maintext: "Esther Howard", subtext: "Marketing", content: "Bhoomika Real Estate was instrumental in my search for a commercial property. Their extensive database allowed me to explore various options in my desired area, and the filtering tools made it simple to find what I needed. I couldn’t have asked for a better experience." }
];

function Reviews() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [deviceType, setDeviceType] = useState(getDeviceType());

    function getDeviceType() {
        const width = window.innerWidth;
        if (width <= 600) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    useEffect(() => {
        const handleResize = () => setDeviceType(getDeviceType());
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let interval;
        if (deviceType === 'mobile') {
            interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % reviewsData.length);
            }, deviceType === 'mobile' ? 3000 : 5000); 

            return () => clearInterval(interval);
        }
    }, [deviceType]);

    return (
        <div className="reviews">
            <div className="reviews_top">
                <h4>What our customers are <br /> saying us?</h4>
                <div className="reviews_topcont">
                    <ReviewsText textmain="10m+" textsub="Happy People" />
                    <ReviewsText star="&#9733;" textmain="4.88" textsub="Overall rating" />
                </div>
            </div>

            <div className="reviews_cards">
                {deviceType === 'mobile' ? (
                    <ReviewsCard
                        reviewimage={reviewsData[currentIndex].reviewimage}
                        maintext={reviewsData[currentIndex].maintext}
                        subtext={reviewsData[currentIndex].subtext}
                        content={reviewsData[currentIndex].content}
                    />
                ) : (
                    reviewsData.map((review, index) => (
                        <ReviewsCard
                            key={index}
                            reviewimage={review.reviewimage}
                            maintext={review.maintext}
                            subtext={review.subtext}
                            content={review.content}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Reviews;
