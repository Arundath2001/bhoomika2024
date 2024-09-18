import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import axios from "axios";
import MainHead from "./MainHead";
import './CityPages.css';
import Navbar from "./Navbar";
import PropNav from "./PropNav";
import Footer from "./Footer";
import AlertBox from "./AlertBox";

function CityPages() {
    const { cityName } = useParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 9;
    const [selectedType, setSelectedType] = useState("All Properties");


    useEffect(() => {
        axios.get(`http://localhost:5000/properties/city/${cityName}`)
            .then(response => {
                setProperties(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError("Error fetching properties");
                setLoading(false);
            });
    }, [cityName]);

    if (loading) return <AlertBox text="Loading..." />;
    if (error) return <p>{error}</p>;

    const filteredProperties = selectedType === "All Properties"
    ? properties
    : properties.filter(property => property.propertytype === selectedType);

    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 2) {
                pageNumbers.push(1, 2, 3);
            } else if (currentPage >= totalPages - 1) {
                pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
            }
        }
        return pageNumbers;
    };

    return (
        <div className="citypages">
            <div className="properties">
        <Navbar />
      <div className="propertiespage_cont">
      <MainHead
                maintext={`Properties in ${cityName}`}
                subtext={`Explore properties available in ${cityName}.`}
            />
      <PropNav selectedType={selectedType} onSelect={setSelectedType} />
      <div className="properties_cont">
        <div className="properties_cards">
          {currentProperties.length > 0 ? (
            currentProperties.map(property => (
              <PropertyCard
                key={property.id}
                propertyname={property.propertyname}
                propertyType={property.propertytype}
                fullname={property.fullname}
                locationdetails={property.locationdetails}
                plotsize={property.plotsize}
                budget={property.budget}
                imageurls={property.imageurls} 
                updateddate={property.updateddate}
                numofrooms={property.numofrooms}
                numoftoilets={property.numoftoilets}
              />
            ))
          ) : (
            <p>No properties available</p>
          )}
        </div>
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => paginate(currentPage - 1)}>&lt;</button>
          )}
          {getPageNumbers().map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={number === currentPage ? "active" : ""}
            >
              {number}
            </button>
          ))}
          {currentPage < totalPages && (
            <button onClick={() => paginate(currentPage + 1)}>&gt;</button>
          )}
        </div>
      </div>
      </div>
    </div>
    <Footer />
        </div>
    );
}

export default CityPages;
