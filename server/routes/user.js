const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboardData, updateProfile, testWeeklyReset } = require('../controllers/userController');
const upload = require('../config/upload');
const User = require('../models/User');

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.put('/profile', protect, updateProfile);
router.post('/test-reset', protect, testWeeklyReset);

// Avatar upload endpoint
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user with new avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ 
      message: 'Avatar uploaded successfully', 
      avatar: user.avatar 
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;