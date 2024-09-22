import React from "react";
import './PropNav.css';

function PropNav({ selectedType, onSelect }) {
    const handleSelect = (item) => {
        onSelect(item);
    };

    const scrollLeft = () => {
        document.querySelector('.propnav-container').scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollRight = () => {
        document.querySelector('.propnav-container').scrollBy({ left: 200, behavior: 'smooth' });
    };

    return (
        <div className="propnav">
            <button className="propnav_btn left" onClick={scrollLeft}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m14 7l-5 5m0 0l5 5"/></svg></button>
            <div className="propnav-container">
                <div className="propnav_links">
                    <div
                        className={selectedType === "All Properties" ? "active" : ""}
                        onClick={() => handleSelect("All Properties")}
                    >
                        All Properties
                    </div>
                    <div
                        className={selectedType === "House" ? "active" : ""}
                        onClick={() => handleSelect("House")}
                    >
                        House
                    </div>
                    <div
                        className={selectedType === "Land" ? "active" : ""}
                        onClick={() => handleSelect("Land")}
                    >
                        Lands
                    </div>
                    <div
                        className={selectedType === "Commercial" ? "active" : ""}
                        onClick={() => handleSelect("Commercial")}
                    >
                        Commercial
                    </div>
                    <div
                        className={selectedType === "Villa" ? "active" : ""}
                        onClick={() => handleSelect("Villa")}
                    >
                        Villa
                    </div>
                                    
                    <div
                        className={selectedType === "Rental" ? "active" : ""}
                        onClick={() => handleSelect("Rental")}
                    >
                        Rental
                    </div>
                    <div
                        className={selectedType === "Industrial" ? "active" : ""}
                        onClick={() => handleSelect("Industrial")}
                    >
                        Industrial
                    </div>
                    <div
                        className={selectedType === "Farm Land" ? "active" : ""}
                        onClick={() => handleSelect("Farm Land")}
                    >
                        Farm Land
                    </div>
                </div>
            </div>
            <button className="propnav_btn right" onClick={scrollRight}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m10 17l5-5m0 0l-5-5"/></svg></button>
        </div>
    );
}

export default PropNav;
