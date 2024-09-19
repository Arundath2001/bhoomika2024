import React, { useState, useEffect } from "react";
import './TopNavbar.css';
import TopNavCard from "./TopNavCard";
import SmallButton from "./SmallButton";
import SearchField from "./SearchField";
import DeletePopup from "./DeletePopup"; 
import AlertMessage from "./AlertMessage"; 
import LoadingScreen from "./LoadingScreen";
import axios from 'axios';

function TopNavbar({ activeTab, setFormMode, setIsFormOpen, selectedIds, setSelectedIds, refreshData, onSearch }) {
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
    const [tabData, setTabData] = useState({ text: "Total Number", count: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ isVisible: false, message: '', isError: false }); 

    const tabLabels = {
        "Enquiry": "Total Number of Enquiries",
        "Selling Info": "Total Sell Requests",
        "City": "Current No of Cities",
        "Property": "Total No of Properties",
        "Schedules": "Total No of Schedules",
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let count = 0;
                let apiEndpoint = '';

                switch (activeTab) {
                    case "Enquiry":
                        apiEndpoint = 'http://localhost:5000/enquiries/count'; 
                        break;
                    case "Selling Info":
                        apiEndpoint = 'http://localhost:5000/selling-info/count'; 
                        break;
                    case "City":
                        apiEndpoint = 'http://localhost:5000/cities/count'; 
                        break;
                    case "Property":
                        apiEndpoint = 'http://localhost:5000/properties/count'; 
                        break;
                    case "Schedules":
                        apiEndpoint = 'http://localhost:5000/schedules/count'; 
                        break;
                    default:
                        throw new Error(`Unknown tab: ${activeTab}`);
                }

                const response = await axios.get(apiEndpoint);
                count = response.data.count; 
                setTabData({ text: tabLabels[activeTab] || "Total Number", count });
                setAlertMessage({ isVisible: true, message: 'Data fetched successfully!', isError: false });
            } catch (error) {
                console.error(`Error fetching count for ${activeTab}`, error);
                setAlertMessage({ isVisible: true, message: `Failed to fetch data for ${activeTab}. Please try again.`, isError: true });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    useEffect(() => {
        onSearch(searchQuery);
    }, [searchQuery, onSearch]);

    const handleAddClick = () => {
        setFormMode("add");
        setIsFormOpen(true);
    };

    const handleEditClick = () => {
        if (selectedIds.length !== 1) {
            setAlertMessage({ isVisible: true, message: "Please select exactly one item for editing.", isError: true });
            return;
        }
        setFormMode("edit");
        setIsFormOpen(true);
    };

    const handleDeleteClick = () => {
        if (selectedIds.length === 0) {
            setAlertMessage({ isVisible: true, message: "No items selected for deletion.", isError: true });
            return;
        }
        setIsDeletePopupVisible(true); 
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            let apiEndpoint = '';
    
            switch (activeTab) {
                case "City":
                    apiEndpoint = 'http://localhost:5000/cities';
                    break;
                case "Property":
                    apiEndpoint = 'http://localhost:5000/properties';
                    break;
                case "Selling Info":
                    apiEndpoint = 'http://localhost:5000/selling-info';
                    break;
                case "Schedules":
                    apiEndpoint = 'http://localhost:5000/schedules';
                    break;
                case "Enquiry":
                    apiEndpoint = 'http://localhost:5000/enquiry';
                    break;
                default:
                    throw new Error(`Unknown tab: ${activeTab}`);
            }
    
            await axios.delete(apiEndpoint, { data: { ids: selectedIds } });
            setSelectedIds([]); 
            setIsDeletePopupVisible(false); 
            setAlertMessage({ isVisible: true, message: `${activeTab} items deleted successfully.`, isError: false });
            
            refreshData();
            
        } catch (error) {
            console.error(`Error deleting ${activeTab} items`, error);
            setAlertMessage({ isVisible: true, message: `Failed to delete ${activeTab} items. Please try again.`, isError: true });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCancelDelete = () => {
        setIsDeletePopupVisible(false); 
    };

    return (
        <div className="topnavbar">
            <div className="topnavabr_left">
                <TopNavCard text={tabData.text} count={tabData.count} />
            </div>
            <div className="topnavbar_fields">
                <SearchField 
                    placeholder="Search by Name" 
                    onSearch={setSearchQuery} 
                />
                <div className="topnavbar_btns">
                    {(activeTab === "City" || activeTab === "Property") && (
                        <>
                            <SmallButton onClick={handleAddClick} svgColor="smallbutton_black" svg={<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16"/><path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4z"/></g></svg>} />
                            <SmallButton onClick={handleEditClick} svgColor="smallbutton_black" svg={<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.414 15.89L16.556 5.748l-1.414-1.414L5 14.476v1.414zm.829 2H3v-4.243L14.435 2.212a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414zM3 19.89h18v2H3z"/></svg>} />
                        </>
                    )}
                    <SmallButton onClick={handleDeleteClick} svgColor="smallbutton_red" svg={<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 48 48"><path fill="currentColor" d="M20 10.5v.5h8v-.5a4 4 0 0 0-8 0m-2.5.5v-.5a6.5 6.5 0 1 1 13 0v.5h11.25a1.25 1.25 0 1 1 0 2.5h-2.917l-2 23.856A7.25 7.25 0 0 1 29.608 44H18.392a7.25 7.25 0 0 1-7.224-6.644l-2-23.856H6.25a1.25 1.25 0 1 1 0-2.5zm-3.841 26.147a4.75 4.75 0 0 0 4.733 4.353h11.216a4.75 4.75 0 0 0 4.734-4.353L36.324 13.5H11.676zM21.5 20.25a1.25 1.25 0 1 0-2.5 0v14.5a1.25 1.25 0 1 0 2.5 0zM27.75 19c.69 0 1.25.56 1.25 1.25v14.5a1.25 1.25 0 1 1-2.5 0v-14.5c0-.69.56-1.25 1.25-1.25"/></svg>} />
                </div>
            </div>

            {isDeletePopupVisible && (
                <div className="home_popupform">
                    <DeletePopup onCancel={handleCancelDelete} onDelete={handleConfirmDelete} />
                </div>    
            )}

            <AlertMessage 
                isVisible={alertMessage.isVisible} 
                message={alertMessage.message} 
                isError={alertMessage.isError}
                onClose={() => setAlertMessage({ ...alertMessage, isVisible: false })}
            />

            <LoadingScreen isVisible={isLoading} />
        </div>
    );
}

export default TopNavbar;
