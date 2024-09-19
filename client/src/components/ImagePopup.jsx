import React from 'react';
import './ImagePopup.css';

const ImagePopup = ({ images, currentImageIndex, onClose, onPrevious, onNext }) => {
  if (!images || images.length === 0) return null;

  const baseURL = 'http://localhost:5000/';

  return (
    <div className="imagepopup">
      <button className="imagepopup_closebtn" onClick={onClose}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/></svg></button>
      <button className="imagepopup_arrowbtn left_arrow" onClick={onPrevious}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="white" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.042-.018a.75.75 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06"/></svg>
      </button>
      <img 
        src={`${baseURL}${images[currentImageIndex]}`} 
        alt={`Image ${currentImageIndex + 1}`} 
        className="full-image" 
      />      
      <button className="imagepopup_arrowbtn right_arrow" onClick={onNext}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="white" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.042-.018a.75.75 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06"/></svg>
      </button>
    </div>
  );
};

export default ImagePopup;
