import React, { useState, useEffect } from "react";
import { saveAs } from 'file-saver';
import './SellingInfo.css';

function SellingInfo({ setSelectedIds, dataChanged, searchQuery }) {
    const [sellingInfo, setSellingInfo] = useState([]);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

    useEffect(() => {
        const fetchSellingInfo = async () => {
            try {
                const response = await fetch('https://api.bhoomikarealestate.com/selling-info');
                const data = await response.json();
                setSellingInfo(data);
            } catch (error) {
                console.error('Error fetching selling info:', error);
            }
        };

        fetchSellingInfo();
    }, [dataChanged]);

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`;
    }

    const handleCheckboxChange = (id) => {
        setSelectedCheckboxes(prevState => {
            const newState = prevState.includes(id)
                ? prevState.filter(checkboxId => checkboxId !== id)
                : [...prevState, id];
            setSelectedIds(newState);
            return newState;
        });
    };

    const safeParseImageUrls = (imageUrls) => {
        try {
            return Array.isArray(imageUrls) ? imageUrls : JSON.parse(imageUrls || '[]');
        } catch (e) {
            console.error('Error parsing image URLs:', e);
            return [];
        }
    };

    const handleEmptyField = (field) => {
        return field ? field : 'N/A';
    };

    const filteredSellingInfo = sellingInfo.filter(info => {
        const fullname = info.fullname?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        return fullname.includes(query);
    });

    const downloadAllImages = (urls) => {
        urls.forEach(url => {
            const normalizedUrl = url.replace(/\\/g, '/');
            const downloadUrl = `https://api.bhoomikarealestate.com/${normalizedUrl}`;
        
            fetch(downloadUrl)
                .then(response => response.blob())
                .then(blob => {
                    const pngBlob = new Blob([blob], { type: 'image/png' });
                    saveAs(pngBlob, normalizedUrl.split('/').pop());
                })
                .catch(error => console.error('Error downloading image:', error));
        });
    };
    
    

    return (
        <div className="sellinginfo">
            <h1>Selling Info</h1>
            <div className="table_container">
                <div className="table_wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Full Name</th>
                                <th>Phone</th>
                                <th>Property Type</th>
                                <th>Commercial Type</th>
                                <th>Rental Type</th>
                                <th>Property Name</th>
                                <th>Number of Bed Rooms</th>
                                <th>Number of Rooms</th>
                                <th>Number of Villa Rooms</th>
                                <th>Number of Toilets</th>
                                <th>Location Details</th>
                                <th>Plot Size</th>
                                <th>Budget</th>
                                <th>Updated Date</th>
                                <th>Description</th> 
                                <th>Images</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSellingInfo.map((info) => {
                                const imageUrls = safeParseImageUrls(info.imageurls);
                                return (
                                    <tr key={info.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(info.id)}
                                                checked={selectedCheckboxes.includes(info.id)}
                                            />
                                        </td>
                                        <td>{handleEmptyField(info.fullname)}</td>
                                        <td>{handleEmptyField(info.phone)}</td>
                                        <td>{handleEmptyField(info.propertytype)}</td>
                                        <td>{handleEmptyField(info.commercialtype)}</td>
                                        <td>{handleEmptyField(info.rentaltype)}</td>
                                        <td>{handleEmptyField(info.propertyname)}</td>
                                        <td>{handleEmptyField(info.numofbedrooms)}</td>
                                        <td>{handleEmptyField(info.numofrooms)}</td>
                                        <td>{handleEmptyField(info.villa_rooms)}</td>
                                        <td>{handleEmptyField(info.numoftoilets)}</td>
                                        <td>{handleEmptyField(info.locationdetails)}</td>
                                        <td>{handleEmptyField(info.plotsize)}</td>
                                        <td>{handleEmptyField(info.budget)}</td>
                                        <td>{formatDate(info.updateddate)}</td>
                                        <td>{handleEmptyField(info.description)}</td> 
                                        <td className="table_images">
                                            {imageUrls.length > 0 ? (
                                                <div className="image-gallery">
                                                    <div className="image-container">
                                                        {imageUrls.map((url, index) => (
                                                            <img
                                                                key={index}
                                                                src={`https://api.bhoomikarealestate.com/${url}`}
                                                                alt={`Property ${index}`}
                                                                className="table_image"
                                                            />
                                                        ))}
                                                        <button
                                                            onClick={() => downloadAllImages(imageUrls)}
                                                            className="download_button"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                'No images'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SellingInfo;
