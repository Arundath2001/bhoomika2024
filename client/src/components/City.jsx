import React, { useEffect, useState } from "react";
import './City.css';
import CityForm from "./CityForm";
import axios from 'axios';

function City({ isFormOpen, formMode, setIsFormOpen, selectedIds, setSelectedIds, dataChanged, searchQuery }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axios.get('https://api.bhoomikarealestate.com/cities');
                console.log(response.data);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching cities", error);
            }
        };

        fetchCities();
    }, [isFormOpen, dataChanged]);

    const handleCheckboxChange = (city) => {
        setSelectedIds((prevIds) => {
            if (prevIds.includes(city.id)) {
                return prevIds.filter(id => id !== city.id);
            } else {
                return [...prevIds, city.id];
            }
        });
    };

    const filteredData = data.filter(item => {
        const cityname = item.cityname?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        return cityname.includes(query);
    });

    return (
        <div className="City">
            <h1>City</h1>

            {isFormOpen && (
                <div className="form_popup">
                    <CityForm 
                        setIsFormOpen={setIsFormOpen} 
                        mode={formMode} 
                        cityData={data.find(item => item.id === selectedIds[0])} 
                        setSelectedIds={setSelectedIds}
                    />
                </div>
            )}
            <div className="table_container">
            <div className="table_wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>City Name</th>
                        <th>Available No of Properties</th>
                        <th>Updated Date</th>
                        <th>Image / Video</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => handleCheckboxChange(item)}
                                />
                            </td>
                            <td>{item.cityname}</td>
                            <td>{item.availableproperties}</td>
                            <td>{new Date(item.updateddate).toLocaleDateString()}</td>
                            <img src={`https://api.bhoomikarealestate.com/${item.imageurl}`} alt="City" className="city-image" />
                            </tr>
                    ))}
                </tbody>
            </table>
            </div>
            </div>
        </div>
    );
}

export default City;
