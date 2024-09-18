import React, { useState, useEffect } from "react";
import './Properties.css';
import MainHead from "./MainHead";
import PropNav from "./PropNav";
import PropertyCard from "./PropertyCard";
import axios from "axios";
import LinkIcon from "./LinkIcon";
import LoadingScreen from './LoadingScreen';
import AlertBox from './AlertBox';


function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("All Properties");

  useEffect(() => {
    axios.get('http://93.127.167.205:5000/properties')
      .then(response => {
        setProperties(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError("Error fetching properties");
        setLoading(false);
      });      
  }, []);

  if (loading) return <AlertBox text = 'Loading...' />;

  if (error) return <p>{error}</p>;

  const filteredProperties = selectedType === "All Properties"
    ? properties
    : properties.filter(property => property.propertytype === selectedType);

  const propertiesToDisplay = filteredProperties.slice(0, 6);

  return (
    <div className="properties">
      <MainHead 
        maintext="Available Properties" 
        subtext="Explore a diverse selection of properties to find the perfect fit for your needs and budget." 
      />
      <PropNav selectedType={selectedType} onSelect={setSelectedType} />
      <div className="properties_cont">
        <div className="properties_cards">
          {propertiesToDisplay.length > 0 ? (
            propertiesToDisplay.map(property => (
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
        <LinkIcon link="/properties" text="View More" svg2={<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="m220.24 132.24l-72 72a6 6 0 0 1-8.48-8.48L201.51 134H40a6 6 0 0 1 0-12h161.51l-61.75-61.76a6 6 0 0 1 8.48-8.48l72 72a6 6 0 0 1 0 8.48"/></svg>} />
      </div>
    </div>
  );
}

export default Properties;
