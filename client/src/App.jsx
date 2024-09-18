import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Home from './components/Home';
import Login from "./components/Login";
import Dashboard from './components/Dashboard';
import PropertiesPage from './components/PropertiesPage';
import CityPages from './components/CityPages';
import AllCities from './components/AllCities';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className='app'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path='/properties' element={<PropertiesPage />} />
          <Route path='/city/:cityName' element={<CityPages />} />
          <Route path='/all-cities' element={<AllCities />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
