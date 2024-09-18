import React from 'react';
import './LoadingScreen.css';

function LoadingScreen({ isVisible, text }) {
    if (!isVisible) return null;

    return (
        <div className="loadingscreen">
            <div className="loadingscreen_spinner"></div>
            <p>{text || 'Loading...'}</p>
        </div>
    );
}

export default LoadingScreen;
