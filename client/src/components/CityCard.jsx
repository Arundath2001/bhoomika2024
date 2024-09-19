import React from "react";
import { useNavigate } from "react-router-dom";
import './CityCard.css';

function CityCard({ city }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/city/${city.cityname}`);
    };

    return (
        <div className="citycard" onClick={handleClick}>
            <img src={`https://api.bhoomikarealestate.com/${city.imageurl}`} alt={city.cityname} />
            <div className="citycard_details">
                <h5>{city.cityname}</h5>
                <p>{city.availableproperties} Properties</p>
            </div>
        </div>
    );
}

export default CityCard;
