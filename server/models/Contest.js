const mongoose = require('mongoose');

const contestEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Upcycling', 'Art', 'Composting', 'Other']
  },
  votes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  winner: {
    type: Boolean,
    default: false
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
contestEntrySchema.index({ user: 1, createdAt: -1 });
contestEntrySchema.index({ status: 1, createdAt: -1 });
contestEntrySchema.index({ category: 1, votes: -1 });

module.exports = mongoose.model('ContestEntry', contestEntrySchema);