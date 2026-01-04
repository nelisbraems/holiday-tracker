import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/trips';

function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(API_URL);
      setTrips(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load trips');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    return `€${price.toFixed(2)}`;
  };

  if (loading) {
    return <div className="loading">Loading trips...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏝️</div>
        <div className="empty-state-text">No trips saved yet</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/add')}
        >
          Add Your First Trip
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">My Vacation Trips</h1>
      <div className="trip-grid">
        {trips.map(trip => (
          <div 
            key={trip._id} 
            className="trip-card"
            onClick={() => navigate(`/trip/${trip._id}`)}
          >
            <div className="trip-destination">{trip.destination}</div>
            {trip.hotel && <div className="trip-hotel">{trip.hotel}</div>}
            
            <span className={`provider-badge provider-${trip.provider}`}>
              {trip.provider}
            </span>

            <div className="trip-info">
              <div className="trip-info-item">
                <span className="trip-info-label">Departure:</span>
                <span className="trip-info-value">{formatDate(trip.departureDate)}</span>
              </div>
              <div className="trip-info-item">
                <span className="trip-info-label">Return:</span>
                <span className="trip-info-value">{formatDate(trip.returnDate)}</span>
              </div>
              <div className="trip-info-item">
                <span className="trip-info-label">Travelers:</span>
                <span className="trip-info-value">
                  {trip.adults} adult{trip.adults !== 1 ? 's' : ''}
                  {trip.children > 0 && `, ${trip.children} child${trip.children !== 1 ? 'ren' : ''}`}
                </span>
              </div>
            </div>

            <div className="trip-price">{formatPrice(trip.currentPrice)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TripList;