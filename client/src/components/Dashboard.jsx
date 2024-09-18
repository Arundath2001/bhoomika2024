import React, { useState } from "react";
import './Dashboard.css';
import SideNavbar from "./SideNavbar";
import Enquiry from "./Enquiry";
import SellingInfo from "./SellingInfo";
import City from "./City";
import Property from "./Property";
import Schedules from "./Schedules";
import TopNavbar from "./TopNavbar";

function Dashboard() {
    const [activeTab, setActiveTab] = useState("Enquiry");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [dataChanged, setDataChanged] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const refreshData = () => {
        setDataChanged(!dataChanged);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Enquiry":
                return <Enquiry setSelectedIds={setSelectedIds} dataChanged={dataChanged} searchQuery={searchQuery} />;
            case "Selling Info":
                return (
                    <SellingInfo setSelectedIds={setSelectedIds} dataChanged={dataChanged} searchQuery={searchQuery} />
                );
            case "City":
                return (
                    <City
                        isFormOpen={isFormOpen}
                        formMode={formMode}
                        setIsFormOpen={setIsFormOpen}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        dataChanged={dataChanged}
                        searchQuery={searchQuery}
                    />
                );
            case "Property":
                return (
                    <Property
                        isFormOpen={isFormOpen}
                        formMode={formMode}
                        setIsFormOpen={setIsFormOpen}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        dataChanged={dataChanged}
                        searchQuery={searchQuery}
                    />
                );
            case "Schedules":
                return <Schedules setSelectedIds={setSelectedIds} dataChanged={dataChanged} searchQuery={searchQuery}  />;
            default:
                return <Enquiry />;
        }
    };

    return (
        <div className="dashboard">
            <SideNavbar onTabChange={setActiveTab} />
            <div className="dashboard_cont">
                <TopNavbar
                    activeTab={activeTab}
                    setFormMode={setFormMode}
                    setIsFormOpen={setIsFormOpen}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    refreshData={refreshData}
                    onSearch={handleSearch} 
                />
                {renderContent()}
            </div>
        </div>
    );
}

export default Dashboard;
