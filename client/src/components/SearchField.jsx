import React from 'react';
import './SearchField.css';

function SearchField({ placeholder, onSearch }) {
    const handleInputChange = (event) => {
        onSearch(event.target.value);
    };

    return (
        <div className='searchfield'>
            <svg className='searchfield_icon' xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 16 16">
                <path fill="currentColor" d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0a5.5 5.5 0 0 1 11 0"/>
            </svg>
            <input type="text" placeholder={placeholder} onChange={handleInputChange} />
        </div>
    );
}

export default SearchField;
