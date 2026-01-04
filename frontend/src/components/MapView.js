import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://localhost:3001/api/trips';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom markers by provider
const createCustomIcon = (provider) => {
  const colors = {
    sunweb: '#d63031',
    tui: '#0984e3',
    corendon: '#6c5ce7',
    other: '#2d3436'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${colors[provider] || colors.other};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      <div style="
        transform: rotate(45deg);
        font-size: 16px;
        text-align: center;
        line-height: 24px;
      ">🏖️</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

function MapView() {
  const [trips, setTrips] = useState([]);
  const [tripsWithCoords, setTripsWithCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(API_URL);
      setTrips(response.data);
      await geocodeTrips(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load trips');
      setLoading(false);
    }
  };

  const geocodeTrips = async (trips) => {
    setGeocoding(true);
    const tripsWithLocation = [];

    for (const trip of trips) {
      try {
        // Use Nominatim (OpenStreetMap) for free geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          tripsWithLocation.push({
            ...trip,
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          });
        }
        
        // Rate limiting - wait 1 second between requests (Nominatim requirement)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Failed to geocode ${trip.destination}`, err);
      }
    }

    setTripsWithCoords(tripsWithLocation);
    setGeocoding(false);
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
        <div className="empty-state-icon">🗺️</div>
        <div className="empty-state-text">No trips to display on map</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/add')}
        >
          Add Your First Trip
        </button>
      </div>
    );
  }

  if (geocoding) {
    return (
      <div className="loading">
        <div>Locating destinations on map...</div>
        <div style={{fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem'}}>
          This may take a moment
        </div>
      </div>
    );
  }

  if (tripsWithCoords.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗺️</div>
        <div className="empty-state-text">
          Could not locate any destinations on the map
        </div>
        <div style={{fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem'}}>
          Make sure your destinations include city and country names
        </div>
      </div>
    );
  }

  // Calculate center point of all trips
  const centerLat = tripsWithCoords.reduce((sum, trip) => sum + trip.lat, 0) / tripsWithCoords.length;
  const centerLon = tripsWithCoords.reduce((sum, trip) => sum + trip.lon, 0) / tripsWithCoords.length;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>Trip Map</h1>
        <div style={{fontSize: '0.9rem', color: '#7f8c8d'}}>
          Showing {tripsWithCoords.length} of {trips.length} trips
        </div>
      </div>

      <div style={{
        height: '70vh',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {tripsWithCoords.map((trip) => (
            <Marker
              key={trip._id}
              position={[trip.lat, trip.lon]}
              icon={createCustomIcon(trip.provider)}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                    {trip.destination}
                  </h3>
                  {trip.hotel && (
                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {trip.hotel}
                    </div>
                  )}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className={`provider-badge provider-${trip.provider}`}>
                      {trip.provider}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#2c3e50', marginBottom: '0.25rem' }}>
                    📅 {formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
                    👥 {trip.adults} adult{trip.adults !== 1 ? 's' : ''}
                    {trip.children > 0 && `, ${trip.children} child${trip.children !== 1 ? 'ren' : ''}`}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '0.5rem' }}>
                    {formatPrice(trip.currentPrice)}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.5rem' }}
                    onClick={() => navigate(`/trip/${trip._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Legend</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="provider-badge provider-sunweb">Sunweb</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="provider-badge provider-tui">TUI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="provider-badge provider-corendon">Corendon</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="provider-badge provider-other">Other</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;