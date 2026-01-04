import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/trips`;

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceNotes, setPriceNotes] = useState('');

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      setTrip(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load trip details');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        navigate('/');
      } catch (err) {
        setError('Failed to delete trip');
      }
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/${id}/price-history`, {
        price: parseFloat(newPrice),
        notes: priceNotes || 'Manual price update'
      });
      setNewPrice('');
      setPriceNotes('');
      setShowPriceForm(false);
      fetchTrip(); // Refresh the trip data
    } catch (err) {
      setError('Failed to add price update');
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `€${price.toFixed(2)}`;
  };

  const calculateDuration = () => {
    if (!trip) return 0;
    const start = new Date(trip.departureDate);
    const end = new Date(trip.returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="loading">Loading trip details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!trip) {
    return <div className="error">Trip not found</div>;
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div>
          <h1 className="detail-title">{trip.destination}</h1>
          {trip.hotel && <div className="detail-subtitle">{trip.hotel}</div>}
        </div>
        <span className={`provider-badge provider-${trip.provider}`}>
          {trip.provider}
        </span>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Trip Information</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-item-label">Departure Date</div>
            <div className="detail-item-value">{formatDate(trip.departureDate)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Return Date</div>
            <div className="detail-item-value">{formatDate(trip.returnDate)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Duration</div>
            <div className="detail-item-value">{calculateDuration()} days</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Travelers</div>
            <div className="detail-item-value">
              {trip.adults} adult{trip.adults !== 1 ? 's' : ''}
              {trip.children > 0 && `, ${trip.children} child${trip.children !== 1 ? 'ren' : ''}`}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Current Price</h2>
        <div className="trip-price" style={{marginTop: '1rem'}}>
          {formatPrice(trip.currentPrice)}
        </div>
      </div>

      <div className="detail-section">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="detail-section-title">Price History</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPriceForm(!showPriceForm)}
          >
            {showPriceForm ? 'Cancel' : 'Update Price'}
          </button>
        </div>

        {showPriceForm && (
          <form onSubmit={handleAddPrice} style={{marginTop: '1rem', marginBottom: '2rem'}}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Price (€)</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Price drop!"
                  value={priceNotes}
                  onChange={(e) => setPriceNotes(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Add Price Update</button>
          </form>
        )}

        <ul className="price-history-list">
          {trip.priceHistory.map((history, index) => (
            <li key={index} className="price-history-item">
              <div>
                <div className="price-history-date">
                  {formatDateTime(history.recordedAt)}
                </div>
                {history.notes && (
                  <div className="price-history-notes">{history.notes}</div>
                )}
              </div>
              <div className="price-history-price">
                {formatPrice(history.price)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {trip.url && (
        <div className="detail-section">
          <h2 className="detail-section-title">Booking Link</h2>
          <a 
            href={trip.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            View on {trip.provider}
          </a>
        </div>
      )}

      {trip.notes && (
        <div className="detail-section">
          <h2 className="detail-section-title">Notes</h2>
          <p style={{color: '#2c3e50'}}>{trip.notes}</p>
        </div>
      )}

      <div className="btn-group">
        <button 
          className="btn btn-primary"
          onClick={() => navigate(`/edit/${trip._id}`)}
        >
          Edit Trip
        </button>
        <button 
          className="btn btn-danger"
          onClick={handleDelete}
        >
          Delete Trip
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Back to List
        </button>
      </div>
    </div>
  );
}

export default TripDetail;