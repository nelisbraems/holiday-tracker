const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create trip
router.post('/', async (req, res) => {
  const trip = new Trip({
    destination: req.body.destination,
    hotel: req.body.hotel,
    provider: req.body.provider,
    departureDate: req.body.departureDate,
    returnDate: req.body.returnDate,
    adults: req.body.adults,
    children: req.body.children,
    currentPrice: req.body.currentPrice,
    url: req.body.url,
    notes: req.body.notes,
    priceHistory: [{
      price: req.body.currentPrice,
      notes: 'Initial price'
    }]
  });

  try {
    const newTrip = await trip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update trip
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // If price changed, add to history
    if (req.body.currentPrice && req.body.currentPrice !== trip.currentPrice) {
      trip.priceHistory.push({
        price: req.body.currentPrice,
        notes: req.body.priceChangeNotes || 'Price updated'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'priceChangeNotes' && req.body[key] !== undefined) {
        trip[key] = req.body[key];
      }
    });

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    await trip.deleteOne();
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add price update to existing trip
router.post('/:id/price-history', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.priceHistory.push({
      price: req.body.price,
      notes: req.body.notes
    });
    
    trip.currentPrice = req.body.price;
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;