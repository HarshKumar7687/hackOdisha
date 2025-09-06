const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['bio-degradable', 'plastic', 'e-waste', 'hazardous', 'other'],
    required: true
  },
  mlPrediction: {
    type: {
      type: String,
      enum: ['bio-degradable', 'plastic', 'e-waste', 'hazardous', 'other']
    },
    confidence: Number
  },
  coins: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Waste', wasteSchema);