import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/trips`;

function AddTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    hotel: '',
    provider: 'sunweb',
    departureDate: '',
    returnDate: '',
    adults: 2,
    children: 0,
    currentPrice: '',
    url: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.post(API_URL, formData);
      navigate('/');
    } catch (err) {
      setError('Failed to add trip. Please check all fields.');
    }
  };

  return (
    <div>
      <h1 className="page-title">Add New Trip</h1>
      
      {error && <div className="error">{error}</div>}

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Destination *</label>
          <input
            type="text"
            name="destination"
            className="form-input"
            placeholder="e.g., Mallorca, Spain"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Hotel</label>
          <input
            type="text"
            name="hotel"
            className="form-input"
            placeholder="e.g., Hotel Playa Sol"
            value={formData.hotel}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Provider *</label>
          <select
            name="provider"
            className="form-select"
            value={formData.provider}
            onChange={handleChange}
            required
          >
            <option value="sunweb">Sunweb</option>
            <option value="tui">TUI</option>
            <option value="corendon">Corendon</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Departure Date *</label>
            <input
              type="date"
              name="departureDate"
              className="form-input"
              value={formData.departureDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Return Date *</label>
            <input
              type="date"
              name="returnDate"
              className="form-input"
              value={formData.returnDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Adults *</label>
            <input
              type="number"
              name="adults"
              className="form-input"
              min="1"
              value={formData.adults}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Children</label>
            <input
              type="number"
              name="children"
              className="form-input"
              min="0"
              value={formData.children}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Price (€) *</label>
          <input
            type="number"
            name="currentPrice"
            className="form-input"
            placeholder="e.g., 1299"
            step="0.01"
            value={formData.currentPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">URL</label>
          <input
            type="url"
            name="url"
            className="form-input"
            placeholder="https://www.sunweb.be/..."
            value={formData.url}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            className="form-textarea"
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            Add Trip
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTrip;