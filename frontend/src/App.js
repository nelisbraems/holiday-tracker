import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TripList from './components/TripList';
import AddTrip from './components/AddTrip';
import TripDetail from './components/TripDetail';
import EditTrip from './components/EditTrip';
import MapView from './components/MapView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🏖️ Holiday Tracker
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">My Trips</Link>
              </li>
              <li className="nav-item">
                <Link to="/map" className="nav-link">Map View</Link>
              </li>
              <li className="nav-item">
                <Link to="/add" className="nav-link">Add Trip</Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<TripList />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/add" element={<AddTrip />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/edit/:id" element={<EditTrip />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;