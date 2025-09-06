const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contestEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContestEntry',
    required: true
  },
  voteType: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate votes
voteSchema.index({ user: 1, contestEntry: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);