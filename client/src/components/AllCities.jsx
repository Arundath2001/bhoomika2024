import React, { useState, useEffect } from "react";
import './AllCities.css';
import MainHead from "./MainHead";
import CityCard from "./CityCard";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AlertBox from "./AlertBox";

function AllCities() {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const citiesPerPage = 12;

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('https://api.bhoomikarealestate.com/cities');
                if (response.ok) {
                    const data = await response.json();
                    setCities(data);
                } else {
                    console.error('Failed to fetch cities');
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
                setError("Error fetching cities");
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    if (loading) return <AlertBox text='Loading...' />;
    if (error) return <p>{error}</p>;

    const indexOfLastCity = currentPage * citiesPerPage;
    const indexOfFirstCity = indexOfLastCity - citiesPerPage;
    const currentCities = cities.slice(indexOfFirstCity, indexOfLastCity);

    const totalPages = Math.ceil(cities.length / citiesPerPage);

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
        <div className="allcities">
            <div className="allcities_cont">
            <Navbar />
            <div className="cities">
                <MainHead 
                    maintext="Discover Your Dream Property in These Cities" 
                    subtext="Uncover Hidden Gems in Prime Locations" 
                />
                <div className="cities_cont">
                    <div className="allcities_cards">
                        {currentCities.length > 0 ? (
                            currentCities.map(city => (
                                <CityCard key={city.id} city={city} />
                            ))
                        ) : (
                            <p>No cities available</p>
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

export default AllCities;
