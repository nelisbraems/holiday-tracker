const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true
  },
  hotel: String,
  provider: {
    type: String,
    enum: ['sunweb', 'tui', 'corendon', 'other'],
    required: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  adults: {
    type: Number,
    default: 2
  },
  children: {
    type: Number,
    default: 0
  },
  currentPrice: {
    type: Number,
    required: true
  },
  url: String,
  priceHistory: [priceHistorySchema],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);