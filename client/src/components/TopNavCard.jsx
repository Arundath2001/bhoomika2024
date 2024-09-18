import React from "react";
import './TopNavCard.css';

function TopNavCard({ text, count }) {
    return (
        <div className="topnavcard">
            <p className="topnavcard_text">{text}</p>
            <p className="topnavcard_count">{count}</p>
        </div>
    );
}

export default TopNavCard;
