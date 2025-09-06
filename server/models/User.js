const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  ecoCoins: {
    type: Number,
    default: 0
  },
  totalWasteUploaded: {
    type: Number,
    default: 0
  },
  contestSubmissions: {
    type: Number,
    default: 0
  },
  weeklyProgress: {
    type: Number,
    default: 0
  },
  weeklyGoal: {
    type: Number,
    default: 10
  },
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  rank: {
    type: String,
    default: 'Eco Beginner'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bio: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Reset weekly progress every Monday
userSchema.methods.resetWeeklyProgressIfNeeded = function() {
  const now = new Date();
  const lastReset = new Date(this.lastWeeklyReset);
  
  console.log('Checking weekly reset:');
  console.log('Now:', now);
  console.log('Last reset:', lastReset);
  console.log('Current weekly progress:', this.weeklyProgress);
  
  // Check if it's a new week (Monday)
  const isNewWeek = now.getDay() === 1 && 
                   (now - lastReset) > (7 * 24 * 60 * 60 * 1000);
  
  console.log('Is new week?', isNewWeek);
  
  if (isNewWeek) {
    console.log('Resetting weekly progress to 0');
    this.weeklyProgress = 0;
    this.lastWeeklyReset = now;
  }
};

module.exports = mongoose.model('User', userSchema);