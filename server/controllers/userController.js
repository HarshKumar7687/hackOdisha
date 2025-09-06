const User = require('../models/User');
const Waste = require('../models/Waste');
const ContestEntry = require('../models/Contest');

// Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Get user dashboard data
const getDashboardData = async (req, res) => {
  try {
    // Get user and reset weekly progress if needed
    const user = await User.findById(req.user._id);
    
    // Reset weekly progress if it's a new week
    user.resetWeeklyProgressIfNeeded();
    await user.save();
    
    // Get recent waste uploads
    const recentUploads = await Waste.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Process image URLs for recent uploads
    const processedUploads = recentUploads.map(upload => {
      const uploadObj = { ...upload };
      
      // Convert relative image path to full URL
      if (uploadObj.image) {
        uploadObj.image = getFullImageUrl(uploadObj.image);
      }
      
      return uploadObj;
    });
    
    // Get user's contest entries
    const contestEntries = await ContestEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    // Process image URLs for contest entries
    const processedContestEntries = contestEntries.map(entry => {
      const entryObj = { ...entry };
      
      // Convert relative image paths to full URLs
      if (entryObj.images && Array.isArray(entryObj.images)) {
        entryObj.images = entryObj.images.map(img => getFullImageUrl(img));
      }
      
      return entryObj;
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        ecoCoins: user.ecoCoins || 0,
        totalWasteUploaded: user.totalWasteUploaded || 0,
        contestSubmissions: user.contestSubmissions || 0,
        rank: user.rank || 'Eco Beginner',
        joinDate: user.createdAt,
        weeklyGoal: user.weeklyGoal || 10,
        weeklyProgress: user.weeklyProgress || 0,
        role: user.role || 'user'
      },
      recentUploads: processedUploads,
      contestEntries: processedContestEntries,
      weeklyProgress: user.weeklyProgress || 0
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, weeklyGoal } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, weeklyGoal },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Test weekly reset
const testWeeklyReset = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Force reset for testing
    user.weeklyProgress = 0;
    user.lastWeeklyReset = new Date();
    await user.save();
    
    res.json({ 
      message: 'Weekly progress reset for testing',
      weeklyProgress: user.weeklyProgress,
      lastReset: user.lastWeeklyReset
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardData,
  updateProfile,
  testWeeklyReset
};