import React, { useState } from "react";
import './SideNavbar.css';
import adminlogo from "../assets/adminlogo.png";
import IconButton from "./IconButton";
import enquiry from "../assets/enquiry.png";
import cart from "../assets/cart.png";
import city from "../assets/city.png";
import house from "../assets/house.png";
import datewhite from "../assets/datewhite.png";
import ImageName from "./ImageName";
import admin from "../assets/Admin.png";
import logout from "../assets/logout.png";
import { useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage"; 

function SideNavbar({ onTabChange }) {
    const [selectedTab, setSelectedTab] = useState("Enquiry");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const navigate = useNavigate();

    const handleTabClick = (btn) => {
        setSelectedTab(btn);
        onTabChange(btn);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setAlertMessage("Logout successful"); 
        setShowAlert(true);
        setTimeout(() => {
            navigate('/login'); 
        }, 2000); 
    };

    return (
        <div className="sidenavbar">
            <img className="sidenavbar_img" src={adminlogo} alt="admin logo" />

            <div className="sidenavbar_btns">
                <IconButton onClick={() => handleTabClick("Enquiry")} isSelected={selectedTab === "Enquiry"} text="Enquiry" img={enquiry} />
                <IconButton onClick={() => handleTabClick("Selling Info")} isSelected={selectedTab === "Selling Info"} text="Selling Info" img={cart} />
                <IconButton onClick={() => handleTabClick("City")} isSelected={selectedTab === "City"} text="City" img={city} />
                <IconButton onClick={() => handleTabClick("Property")} isSelected={selectedTab === "Property"} text="Properties" img={house} />
                <IconButton onClick={() => handleTabClick("Schedules")} isSelected={selectedTab === "Schedules"} text="Schedules" img={datewhite} />
            </div>

            <div className="sidenavbar_bottom">
                <ImageName img={admin} name="Dilna" role="Admin" />
                <IconButton text="Logout" img={logout} onClick={handleLogout} />
            </div>

            <AlertMessage
                isVisible={showAlert}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                isError={false}
            />
        </div>
    );
}

export default SideNavbar;
