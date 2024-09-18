import React, { useState, useEffect } from "react";
import './PropertiesPage.css';
import MainHead from "./MainHead";
import PropNav from "./PropNav";
import PropertyCard from "./PropertyCard";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AlertBox from "./AlertBox";

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("All Properties");
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage, setPropertiesPerPage] = useState(9);

  useEffect(() => {
    axios.get('http://localhost:5000/properties')
      .then(response => {
        setProperties(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError("Error fetching properties");
        setLoading(false);
      });

    const updatePropertiesPerPage = () => {
      if (window.innerWidth <= 768) {
        setPropertiesPerPage(10);
      } else {
        setPropertiesPerPage(9);
      }
    };

    updatePropertiesPerPage();
    window.addEventListener('resize', updatePropertiesPerPage);

    return () => window.removeEventListener('resize', updatePropertiesPerPage);
  }, []);

  if (loading) return <AlertBox text = 'Loading...' />;
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
    <div className="propertiespage">
      <div className="properties">
        <Navbar />
      <div className="propertiespage_cont">
      <MainHead 
        maintext="All Properties" 
        subtext="Explore a diverse selection of properties to find the perfect fit for your needs and budget." 
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
                commercialtype={property.commercialtype}
                rentaltype={property.rentaltype}
                numofrooms={property.numofrooms}
                fullname={property.fullname}
                locationdetails={property.locationdetails}
                plotsize={property.plotsize}
                budget={property.budget}
                imageurls={property.imageurls} 
                updateddate={property.updateddate}
                numofbedrooms={property.numofbedrooms}
                numoftoilets={property.numoftoilets}
                description={property.description}
              />
            ))
          ) : (
            <p>No properties available</p>
          )}
        </div>
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => paginate(currentPage - 1)}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z"/></svg></button>
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
            <button onClick={() => paginate(currentPage + 1)}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="M7 1L5.6 2.5L13 10l-7.4 7.5L7 19l9-9z"/></svg></button>
          )}
        </div>
      </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}

export default PropertiesPage;
