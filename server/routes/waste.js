const express = require('express');
const { protect } = require('../middleware/auth');
const Waste = require('../models/Waste');
const User = require('../models/User');
const upload = require('../middleware/upload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();

// Get all waste submissions for user
router.get('/', protect, async (req, res) => {
  try {
    const wastes = await Waste.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Process images to include full URLs for frontend
    const processedWastes = wastes.map(waste => {
      const wasteObj = waste.toObject();
      
      // Convert relative path to absolute URL for frontend
      if (wasteObj.image && !wasteObj.image.startsWith('http')) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        wasteObj.image = `${baseUrl}${wasteObj.image.startsWith('/') ? '' : '/'}${wasteObj.image}`;
      }
      
      return wasteObj;
    });
    
    res.json(processedWastes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create waste submission with ML integration
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('File upload received:', req.file);
    console.log('Request body:', req.body);
    
    const { location, manualWasteType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }
    
    let wasteType = manualWasteType;
    let mlPrediction = null;
    let coins = 10;
    
    // If no manual waste type selected, use ML prediction
    if (!manualWasteType) {
      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        
        const mlResponse = await axios.post(
          `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/predict`,
          formData,
          {
            headers: { ...formData.getHeaders() },
            timeout: 10000
          }
        );
        
        if (mlResponse.data.success) {
          mlPrediction = {
            type: mlResponse.data.type,
            confidence: mlResponse.data.confidence
          };
          
          wasteType = mlResponse.data.type;
          coins = mlResponse.data.coins || 10;
        } else {
          wasteType = 'other';
          coins = 10;
        }
      } catch (mlError) {
        console.error('ML Service error:', mlError.message);
        wasteType = 'other';
        coins = 10;
      }
    } else {
      const coinValues = {
        'bio-degradable': 15,
        'plastic': 25,
        'e-waste': 50,
        'hazardous': 40,
        'other': 10
      };
      coins = coinValues[manualWasteType] || 10;
    }
    
    // Store relative path only
    const imagePath = `/uploads/${req.file.filename}`;
    
    const waste = await Waste.create({
      user: req.user._id,
      image: imagePath,
      location,
      type: wasteType,
      mlPrediction,
      coins,
      status: 'pending'
    });
    
    // Update user's stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { weeklyProgress: 1, totalWasteUploaded: 1 }
    });
    
    // Debug: Check updated user stats
    const updatedUser = await User.findById(req.user._id);
    console.log('User after update - Weekly progress:', updatedUser.weeklyProgress);
    console.log('User after update - Total waste:', updatedUser.totalWasteUploaded);
    
    // Send response with full URL
    const wasteResponse = waste.toObject();
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    wasteResponse.image = `${baseUrl}${imagePath}`;
    
    res.status(201).json(wasteResponse);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error creating waste submission:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get waste by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);
    
    if (waste) {
      const wasteObj = waste.toObject();
      
      if (wasteObj.image && !wasteObj.image.startsWith('http')) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        wasteObj.image = `${baseUrl}${wasteObj.image.startsWith('/') ? '' : '/'}${wasteObj.image}`;
      }
      
      res.json(wasteObj);
    } else {
      res.status(404).json({ message: 'Waste not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;