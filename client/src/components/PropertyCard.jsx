import React, { useState, useEffect, useCallback } from 'react';
import './PropertyCard.css';
import propeg from "../assets/propeg.jpg";
import IconText from './IconText';
import ButtonMain from './ButtonMain';
import arrow from "../assets/arrow.png";
import date from "../assets/date.png";
import PopupForm3 from './PopupForm3';
import ImagePopup from './ImagePopup';

const PropertyCard = ({ 
  propertyname, imageurls, numofbedrooms, plotsize, locationdetails, propertyType, name, location, ratePerCent, price, beds, baths, numoftoilets, budget, description, rentaltype, commercialtype, numofrooms, villarooms, id 
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isImagePopupVisible, setIsImagePopupVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [slicedLocationDetails, setSlicedLocationDetails] = useState('');

  const imageurl = imageurls && imageurls.length > 0 ? imageurls[0] : propeg;

  const isVillaOrHouse = propertyType === 'Villa' || propertyType === 'House';
  const isCommercialOrRental = propertyType === 'Commercial' || propertyType === 'Rental';

  useEffect(() => {
    if (isPopupVisible || isImagePopupVisible) {
      document.body.classList.add("noscroll");
    } else {
      document.body.classList.remove("noscroll");
    }
  }, [isPopupVisible, isImagePopupVisible]);

  useEffect(() => {
    const handleResize = () => {
      const maxLength = window.innerWidth < 600 ? 10 : 25;
      setSlicedLocationDetails(locationdetails.length <= maxLength ? locationdetails : `${locationdetails.substring(0, maxLength)}...`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [locationdetails]);

  const displayName = () => {
    if (propertyType === 'Land') return 'Land for Sale';
    if (propertyType === 'Commercial') return 'Property for Sale';
    if (propertyType === 'Farm Land') return 'Farm Land for Sale';
    if (propertyType === 'Rental') return 'Rental Property';
    if (propertyType === 'Industrial') return 'Industrial Property';
    return propertyname;
  };

  const handleOpenPopup = () => setIsPopupVisible(true);
  const handleClosePopup = () => setIsPopupVisible(false);

  const handleOpenImagePopup = () => setIsImagePopupVisible(true);
  const handleCloseImagePopup = () => {
    setIsImagePopupVisible(false);
    setCurrentImageIndex(0);
  };

  const showNextImage = () => setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageurls.length);
  const showPreviousImage = () => setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageurls.length) % imageurls.length);

  const toggleDescription = () => setIsDescriptionVisible(prev => !prev);

  const getRateLabel = () => {
    if(propertyType == 'Land' || propertyType == 'Farm'){
      if (plotsize.toLowerCase().includes('sq')) return 'Rate per sq ft';
    
      if (plotsize.toLowerCase().includes('acre')) return 'Rate per cent';
      
      if (plotsize.toLowerCase().includes('cent')) return 'Rate per cent';
      
    }    
    return 'Rate';
  };

  return (
    <div className='propertycard'>
      <div className='propertycard_cont'>
        <div className='propertycard_top'>
          <img className='propertycard_img' src={`https://api.bhoomikarealestate.com/${imageurl}`} alt={propertyname} />
          <div className='propertycard_topdata'>
            <div className={`propertycard_data1 ${propertyType}`}>{propertyType}</div>
            <div className='propertycard_data2'>
              <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="16px" viewBox="0 0 50 50">
                <g fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="white" stroke-width="2" d="M18.146 20.833L6.25 32.771v6.812a2.084 2.084 0 0 0 2.083 2.084h8.938l10.833-10.834zM33.938 25L17.27 41.667h24.396a2.083 2.083 0 0 0 2.083-2.084v-4.77z"/>
                  <path stroke="white" stroke-width="3" d="M29 17.27h-.208"/>
                  <path stroke="white" stroke-width="2" d="M41.667 8.333H8.333c-1.15 0-2.083.933-2.083 2.084v29.166c0 1.15.933 2.084 2.083 2.084h33.334c1.15 0 2.083-.933 2.083-2.084V10.417a2.084 2.084 0 0 0-2.083-2.084"/>
                </g>
              </svg>
              <p className='propertycard_toptext'>+4</p>
            </div>
          </div>
          <div className='propertycard_btns'>
        <ButtonMain onClick={handleOpenImagePopup} value="View Images" img={arrow} bgColor="buttonmain_white" textColor="buttonmain_blacktxt" />
        <ButtonMain onClick={handleOpenPopup} value="Schedule Visit" img={date} bgColor="buttonmain_white" textColor="buttonmain_blacktxt" />
      </div>
        </div>

        <div className='propertycard_down'>
          <div className='propertycard_details1'>
            <p className='propertycard_name'>{displayName()}</p>
            <p className='propertycard_cent'>{plotsize}</p>
          </div>

          <div className='propertycard_details4'>
            {isCommercialOrRental && (
              <>
                
                {
                  rentaltype ? (<IconText border={ numofrooms > 0 ? "icontext_border" : undefined } text={`${rentaltype}`} svg={
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M240 208h-16V96a16 16 0 0 0-16-16h-64V32a16 16 0 0 0-24.88-13.32L39.12 72A16 16 0 0 0 32 85.34V208H16a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16M208 96v112h-64V96ZM48 85.34L128 32v176H48ZM112 112v16a8 8 0 0 1-16 0v-16a8 8 0 1 1 16 0m-32 0v16a8 8 0 0 1-16 0v-16a8 8 0 1 1 16 0m0 56v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0m32 0v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0"/></svg>
                  } />) : (<IconText border={ numofrooms > 0 ? "icontext_border" : undefined } text={`${commercialtype}`} svg={
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M240 208h-16V96a16 16 0 0 0-16-16h-64V32a16 16 0 0 0-24.88-13.32L39.12 72A16 16 0 0 0 32 85.34V208H16a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16M208 96v112h-64V96ZM48 85.34L128 32v176H48ZM112 112v16a8 8 0 0 1-16 0v-16a8 8 0 1 1 16 0m-32 0v16a8 8 0 0 1-16 0v-16a8 8 0 1 1 16 0m0 56v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0m32 0v16a8 8 0 0 1-16 0v-16a8 8 0 0 1 16 0"/></svg>
                  } />)
                }

                {
                  (numofrooms > 0) && (
                    <IconText text={`${numofrooms} Rooms`} svg={
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="currentColor"><path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1s.5.448.5 1s-.224 1-.5 1"/><path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117M11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5M4 1.934V15h6V1.077z"/></g></svg>                } />
                  )
                }
              </>
            )}
          </div>

          <div className='propertycard_details2'>
            <IconText text={slicedLocationDetails} svg={
              <svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 48 48">
                <path fill="black" d="M24.005 15.5a6 6 0 1 0 0 12a6 6 0 0 0 0-12m-3.5 6a3.5 3.5 0 1 1 7 0a3.5 3.5 0 0 1-7 0M37 32L26.912 42.71a4 4 0 0 1-5.824 0L11 32h.038l-.017-.02l-.021-.025A16.92 16.92 0 0 1 7 21c0-9.389 7.611-17 17-17s17 7.611 17 17a16.92 16.92 0 0 1-4 10.955l-.021.025l-.017.02zm-1.943-1.619A14.43 14.43 0 0 0 38.5 21c0-8.008-6.492-14.5-14.5-14.5S9.5 12.992 9.5 21a14.43 14.43 0 0 0 3.443 9.381l.308.363l9.657 10.251a1.5 1.5 0 0 0 2.184 0l9.657-10.251z"/>
              </svg>
            } />
            <p
              onClick={toggleDescription}
              className={isDescriptionVisible ? 'expand' : 'normal'}
              style={{ cursor: 'pointer' }}
            >
              {isDescriptionVisible ? '' : "View More"}
            </p>
          </div>

          <div className='propertycard_details3'>
            <IconText text={getRateLabel()} svg={
              <svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 48 48">
                <g fill="black" fill-rule="evenodd" clip-rule="evenodd">
                  <path d="M28.772 24.667A4 4 0 0 0 25 22v-1h-2v1a4 4 0 1 0 0 8v4c-.87 0-1.611-.555-1.887-1.333a1 1 0 1 0-1.885.666A4 4 0 0 0 23 36v1h2v-1a4 4 0 0 0 0-8v-4a2 2 0 0 1 1.886 1.333a1 1 0 1 0 1.886-.666M23 24a2 2 0 1 0 0 4zm2 10a2 2 0 1 0 0-4z"/>
                  <path d="M13.153 8.621C15.607 7.42 19.633 6 24.039 6c4.314 0 8.234 1.361 10.675 2.546l.138.067c.736.364 1.33.708 1.748.987L32.906 15C41.422 23.706 48 41.997 24.039 41.997S6.479 24.038 15.069 15l-3.67-5.4c.283-.185.642-.4 1.07-.628q.318-.171.684-.35m17.379 6.307l2.957-4.323c-2.75.198-6.022.844-9.172 1.756c-2.25.65-4.75.551-7.065.124a25 25 0 0 1-1.737-.386l1.92 2.827c4.115 1.465 8.981 1.465 13.097.002M16.28 16.63c4.815 1.86 10.602 1.86 15.417-.002a29.3 29.3 0 0 1 4.988 7.143c1.352 2.758 2.088 5.515 1.968 7.891c-.116 2.293-1.018 4.252-3.078 5.708c-2.147 1.517-5.758 2.627-11.537 2.627c-5.785 0-9.413-1.091-11.58-2.591c-2.075-1.437-2.986-3.37-3.115-5.632c-.135-2.35.585-5.093 1.932-7.87c1.285-2.648 3.078-5.197 5.005-7.274m-1.15-6.714c.8.238 1.636.445 2.484.602c2.15.396 4.306.454 6.146-.079a54 54 0 0 1 6.53-1.471C28.45 8.414 26.298 8 24.038 8c-3.445 0-6.658.961-8.908 1.916"/>
                </g>
              </svg>
            } />
            <p className='propertycard_money'>{budget}</p>
          </div>

          <div className='propertycard_details4'>
            {isVillaOrHouse && (
              <>
              {propertyType === 'Villa' && (
        <IconText text={`${villarooms} BHK`} svg={
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="currentColor"><path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1s.5.448.5 1s-.224 1-.5 1"/><path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117M11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5M4 1.934V15h6V1.077z"/></g></svg>
        } />
      )}
                 {propertyType === 'House' && (
        <>
          <IconText border={"icontext_border"} text={`${numofbedrooms} Beds`} svg={
            <svg xmlns="http://www.w3.org/2000/svg" width="614.41" height="384" viewBox="0 0 2048 1280">
              <path fill="black" d="M256 768h1728q26 0 45 19t19 45v448h-256v-256H256v256H0V64q0-26 19-45T64 0h128q26 0 45 19t19 45zm576-320q0-106-75-181t-181-75t-181 75t-75 181t75 181t181 75t181-75t75-181m1216 256v-64q0-159-112.5-271.5T1664 256H960q-26 0-45 19t-19 45v384z"/>
            </svg>
          } />
          <IconText text={`${numoftoilets} Baths`} svg={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="currentColor" d="M32 384a95.4 95.4 0 0 0 32 71.09V496a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-16h256v16a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-40.91A95.4 95.4 0 0 0 480 384v-48H32Zm464-128H80V69.25a21.26 21.26 0 0 1 36.28-15l19.27 19.26c-13.13 29.88-7.61 59.11 8.62 79.73l-.17.17a16 16 0 0 0 0 22.59l11.31 11.31a16 16 0 0 0 22.63 0L283.31 81.94a16 16 0 0 0 0-22.63L272 48a16 16 0 0 0-22.62 0l-.17.17c-20.62-16.23-49.83-21.75-79.73-8.62l-19.26-19.27A69.25 69.25 0 0 0 32 69.25V256H16a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h480a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16"/></svg>
          } />
        </>
      )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className='propertycard_btns'>
        <ButtonMain onClick={handleOpenImagePopup} value="View Images" img={arrow} bgColor="buttonmain_white" textColor="buttonmain_blacktxt" />
        <ButtonMain onClick={handleOpenPopup} value="Schedule Visit" img={date} bgColor="buttonmain_white" textColor="buttonmain_blacktxt" />
      </div>

      {isPopupVisible && (
        <div className='home_popupform'>
          <PopupForm3
            onClose={handleClosePopup}
            propertyDetails={{
              propertyName: displayName(),
              locationDetails: locationdetails,
              description:description,
              property_id:id
            }}
          />
        </div>
      )}
      {isImagePopupVisible && (
        <ImagePopup
          images={imageurls}
          currentImageIndex={currentImageIndex}
          onClose={handleCloseImagePopup}
          onPrevious={showPreviousImage}
          onNext={showNextImage}
        />
      )}

      {isDescriptionVisible && (
        <div className='description_popup'>
          <button onClick={toggleDescription}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M7 9a1 1 0 0 0-.707 1.707l5 5a1 1 0 0 0 1.414 0l5-5A1 1 0 0 0 17 9z" clip-rule="evenodd"/></svg></button>
          <p className='description_popuploc'>Location:</p> 
          <p className='description_popupdet'>{locationdetails}</p><br />
          <p className='description_popupdet'>{description}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
