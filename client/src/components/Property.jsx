import React, { useState, useEffect } from "react";
import './Property.css';
import PropertyForm from "./PropertyForm";
import axios from 'axios';

function Property({ isFormOpen, formMode, setIsFormOpen, selectedIds, setSelectedIds, dataChanged, searchQuery }) {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchProperties();
    }, [dataChanged]);

    const fetchProperties = async () => {
        try {
            const response = await axios.get('https://api.bhoomikarealestate.com/properties');
            setProperties(response.data);
        } catch (error) {
            console.error("Error fetching properties", error);
        }
    };

    const handleFormSubmit = async (propertyDetails) => {
        console.log("Form submitted with data:", propertyDetails); 
    
        try {
            if (formMode === "edit") {
                if (!propertyDetails.id) {
                    console.error("Property ID is missing for update");
                    return;
                }
                await axios.put(`https://api.bhoomikarealestate.com/properties/${propertyDetails.id}`, propertyDetails);
                setProperties((prevProperties) =>
                    prevProperties.map((prop) =>
                        prop.id === propertyDetails.id ? { ...prop, ...propertyDetails } : prop
                    )
                );
                console.log("Property updated");
            } else {
                const response = await axios.post('https://api.bhoomikarealestate.com/properties', propertyDetails);
                setProperties((prevProperties) => [...prevProperties, response.data]);
                console.log("Property added");
            }
        } catch (error) {
            console.error(formMode === "edit" ? "Error updating property" : "Error adding property", error);
        } finally {
            setIsFormOpen(false);
            fetchProperties();
        }
    };
    
    
    
    const handleCheckboxChange = (id) => {
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((selectedId) => selectedId !== id)
                : [...prevSelectedIds, id]
        );
    };

    const filteredProperties = properties.filter(property => {
        const propertyName = property.propertyname?.toLowerCase() || '';
        const fullName = property.fullname?.toLowerCase() || '';
        const id = String(property.id).toLowerCase(); 
        const query = searchQuery.toLowerCase();
    
        return propertyName.includes(query) || fullName.includes(query) || id.includes(query);
    });
    

    const selectedProperty = properties.find(p => selectedIds.includes(p.id));

    return (
        <div className="Property">
            <h1>Property</h1>

            {isFormOpen && (
                <div className="form_popup">
                    <PropertyForm 
                        mode={formMode} 
                        setIsFormOpen={setIsFormOpen} 
                        propertyData={selectedProperty} 
                        onSubmit={handleFormSubmit} 
                        setSelectedIds={setSelectedIds} 
                        submitUrl="https://api.bhoomikarealestate.com/properties"
                        showImageUpload={true}
                        span="Add"
                        heading="a New Property"
                        setRequired={true}
                        showPropertyName={true}
                        showContactMessage={false}
                        setName={true}
                    />
                </div>
            )}

            {filteredProperties.length > 0 && (
                <div className="table_container">
                    <div className="table_wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Propert Id</th>
                                    <th>Property Type</th>
                                    <th>Property Holder Name</th>
                                    <th>Phone Number</th>
                                    <th>Rental Type</th>
                                    <th>Commercial Type</th>
                                    <th>Number of Bed Rooms</th>
                                    <th>Number of Villa Rooms</th>
                                    <th>Property Name</th>
                                    <th>Number of Rooms</th>
                                    <th>Number of Toilets</th>
                                    <th>Location Details</th>
                                    <th>Size of Plot</th>
                                    <th>Budget</th>
                                    <th className="table_description">Description</th> 
                                    <th>Images</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProperties.map((property) => (
                                    <tr key={property.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(property.id)}
                                                onChange={() => handleCheckboxChange(property.id)}
                                            />
                                        </td>
                                        <td>{property.id || 'N/A'}</td>
                                        <td>{property.propertytype || 'N/A'}</td>
                                        <td>{property.fullname || 'N/A'}</td>
                                        <td>{property.phonenumber || 'N/A'}</td>
                                        <td>{property.rentaltype || 'N/A'}</td>
                                        <td>{property.commercialtype || 'N/A'}</td>
                                        <td>{property.numofbedrooms || 'N/A'}</td>
                                        <td>{property.villa_rooms || 'N/A'}</td>
                                        <td>{property.propertyname || 'N/A'}</td>
                                        <td>{property.numofrooms !== null && property.numofrooms !== undefined ? property.numofrooms : 'N/A'}</td>
                                        <td>{property.numoftoilets !== null && property.numoftoilets !== undefined ? property.numoftoilets : 'N/A'}</td>
                                        <td>{property.locationdetails || 'N/A'}</td>
                                        <td>{property.plotsize || 'N/A'}</td>
                                        <td>{property.budget || 'N/A'}</td>
                                        <td className="table_description">{property.description || 'N/A'}</td> 
                                        <td className="table_images">
                                            {property.imageurls && property.imageurls.length > 0 ? (
                                                property.imageurls.map((url, index) => (
                                                    <img src={`https://api.bhoomikarealestate.com/${url}`} alt="City" className="city-image" />
                                                ))
                                            ) : (
                                                'No images'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Property;
