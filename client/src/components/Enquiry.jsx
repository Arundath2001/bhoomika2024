import React, { useState, useEffect } from "react";
import './Enquiry.css';
import axios from 'axios';

function Enquiry({ setSelectedIds, dataChanged, searchQuery }) {
    const [enquiries, setEnquiries] = useState([]);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`;
    }

    const formatField = (field) => field ? field : "N/A";

    useEffect(() => {
        const fetchEnquiries = async () => {
            try {
                const response = await axios.get('http://93.127.167.205:5000/enquiries');
                console.log('Enquiries response:', response.data);
                setEnquiries(response.data);
            } catch (error) {
                console.error('Error fetching enquiries:', error);
            }
        };
    
        fetchEnquiries();
    }, [dataChanged]);

    const handleCheckboxChange = (id) => {
        setSelectedCheckboxes(prevState => {
            const newState = prevState.includes(id) 
                ? prevState.filter(checkboxId => checkboxId !== id) 
                : [...prevState, id];
            setSelectedIds(newState);
            return newState;
        });
    };

    const filteredEnquiries = enquiries.filter(enquiry => {
        const fullname = enquiry.fullname?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        return fullname.includes(query);
    });

    return (
        <div className="enquiry">
            <h1>Enquiry</h1>
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
                        <th>Number of Bed Rooms</th>
                        <th>Number of Bathsrooms</th>
                        <th>Location Details</th>
                        <th>Plot Size</th>
                        <th>Budget</th>
                        <th>Description</th>
                        <th>Submitted Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEnquiries.map(enquiry => (
                        <tr key={enquiry.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={() => handleCheckboxChange(enquiry.id)}
                                    checked={selectedCheckboxes.includes(enquiry.id)}
                                />
                            </td>
                            <td>{formatField(enquiry.fullname)}</td>
                            <td>{formatField(enquiry.phone)}</td>
                            <td>{formatField(enquiry.propertytype)}</td>
                            <td>{formatField(enquiry.commercialtype)}</td>
                            <td>{formatField(enquiry.rentaltype)}</td>
                            <td>{formatField(enquiry.numofbedrooms)}</td>
                            <td>{formatField(enquiry.numoftoilets)}</td>
                            <td>{formatField(enquiry.locationdetails)}</td>
                            <td>{formatField(enquiry.plotsize)}</td>
                            <td>{formatField(enquiry.budget)}</td>
                            <td>{formatField(enquiry.description)}</td>
                            <td>{formatDate(enquiry.submitteddate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            </div>
        </div>
    );
}

export default Enquiry;
