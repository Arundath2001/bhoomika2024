import React, { useState, useEffect } from 'react';
import './AlertMessage.css';

function AlertMessage({ isVisible, message, onClose, isError }) {
    const [visible, setVisible] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setVisible(true);
    
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, 3000);
    
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [isVisible, onClose]);
    
    if (!visible) return null;
    
    return (
        <div className={`successmessage ${isError ? 'error' : 'success'}`}>
            <div className="message-content">
                {isError ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M11.001 10h2v5h-2zM11 16h2v2h-2z"/><path fill="currentColor" d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.99 1.99 0 0 0 .054 1.968A1.98 1.98 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.99 1.99 0 0 0 .054-1.968zM4.661 19L12 5.137L19.344 19z"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896m-55.808 536.384l-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.27 38.27 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"/></svg>
                )}
                <p>{message}</p>
                <button className="close-button" onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/></svg>
                </button>
            </div>
        </div>
    );
}

export default AlertMessage;
