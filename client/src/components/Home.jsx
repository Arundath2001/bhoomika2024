import React, { useState, useEffect, useRef } from "react";
import './Home.css';
import ButtonMain from "./ButtonMain";
import house from "../assets/house.png";
import cart from "../assets/cart.png";
import enquiry from "../assets/enquiry.png";
import Avatar from "./Avatar";
import Avatar1 from "./Avatar1";
import ScrollDown from "./ScrollDown";
import Cities from "./Cities";
import Details from "./Details";
import BlackCard from "./BlackCard";
import Properties from "./Properties";
import Reviews from "./Reviews";
import Contact from "./Contact";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PropertyForm from "./PropertyForm"; 
import AlertBox from "./AlertBox";

function Home() {
    const [isPopupVisible1, SetPopupVisible1] = useState(false);
    const [isPopupVisible2, SetPopupVisible2] = useState(false);
    const [formUrl, setFormUrl] = useState(''); 
    const [heading , setHeading] = useState('');

    const propertiesRef = useRef(null);
    const citiesRef = useRef(null);
    const contactRef = useRef(null); 

    useEffect(() => {
        if (isPopupVisible1 || isPopupVisible2) {
            document.body.classList.add("noscroll");
        } else {
            document.body.classList.remove("noscroll");
        }
    }, [isPopupVisible1, isPopupVisible2]);

    const handleOpenPopup1 = () => {
        setFormUrl('https://api.bhoomikarealestate.com/selling-info'); 
        SetPopupVisible1(true);
        setHeading("Sell Your Property Fast: Get Started Here!");
    };

    const handleOpenPopup2 = () => {
        setFormUrl('https://api.bhoomikarealestate.com/enquiries'); 
        SetPopupVisible2(true);
        setHeading(
            <>
                Explore Land Options: Share Your<br />Requirements Today!
            </>
        );    
    };

    const handleClosePopup = () => {
        SetPopupVisible1(false);
        SetPopupVisible2(false);
    };

    const scrollToProperties = () => {
        if (propertiesRef.current) {
            const offset = 100;
            const propertiesTop = propertiesRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: propertiesTop - offset,
                behavior: "smooth"
            });
        }
    };

    const scrollToCities = () => {
        if (citiesRef.current) {
            const offset = 100;
            const citiesTop = citiesRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: citiesTop - offset,
                behavior: "smooth"
            });
        }
    };

    const scrollToContact = () => {
        if (contactRef.current) {
            const offset = 100; 
            const contactTop = contactRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: contactTop - offset,
                behavior: "smooth"
            });
        }
    };
    
    

    return (
        <div className="home">
            <Navbar scrollToContact={scrollToContact} />
            <div className="home_top">
                <div className="home_head">
                    <h2>Discover Your <br /> Dream Place</h2>
                    <p>Find the perfect property that meets all your needs and desires.</p>
                </div>
            
                <div className="home_btn">
                    <ButtonMain
                        bgColor="buttonmain_black"
                        textColor="buttonmain_whitetxt"
                        value="Browse Properties"
                        img={house}
                        onClick={scrollToProperties}
                    />
                    <ButtonMain
                        onClick={handleOpenPopup1}
                        bgColor="buttonmain_black"
                        textColor="buttonmain_whitetxt"
                        value="Sell Properties"
                        img={cart}
                    />
                    <ButtonMain
                        onClick={handleOpenPopup2}
                        bgColor="buttonmain_black"
                        textColor="buttonmain_whitetxt"
                        value="Enquiry"
                        img={enquiry}
                    />
                </div>

                {/* <Avatar />
                <Avatar1 /> */}

                <ScrollDown onClick={scrollToCities} /> 
            </div>

            <div className="home_data1" ref={citiesRef}>
                <Cities />
                <Details />
            </div>

            <BlackCard />

            <div ref={propertiesRef}>
                <Properties />
            </div>

            {/* <Reviews /> */}

            <div id="contact" ref={contactRef}>
                <Contact />
            </div>

            {( isPopupVisible1 || isPopupVisible2 ) && (
                <div className="home_popupform">
                    <PropertyForm 
                        mode="add"
                        setIsFormOpen={handleClosePopup} 
                        submitUrl={formUrl} 
                        setSelectedIds={() => {}}
                        showImageUpload={isPopupVisible1}
                        showPropertyName={isPopupVisible1}
                        heading={heading}
                        showContactMessage={true} 
                    />
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Home;
