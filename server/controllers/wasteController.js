const Waste = require('../models/Waste');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Get all waste submissions for user
const getWasteSubmissions = async (req, res) => {
  try {
    const wastes = await Waste.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    // Process images to ensure proper URLs
    const processedWastes = wastes.map(waste => {
      const wasteObj = waste.toObject();
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
};

// Create waste submission
const createWasteSubmission = async (req, res) => {
  try {
    const { location, manualWasteType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }
    
    let wasteType = manualWasteType;
    let mlPrediction = null;
    let coins = 10; // Default coins
    
    // If no manual waste type selected, use ML prediction
    if (!manualWasteType) {
      try {
        // Create form data with the image file
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        
        // Call our ML proxy endpoint in Node.js
        const mlResponse = await axios.post(
          `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/ml/predict`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
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
          console.log('ML service returned failure, using default');
          wasteType = 'other';
          coins = 10;
        }
      } catch (mlError) {
        console.error('ML Service error:', mlError.message);
        // If ML service fails, use default values
        wasteType = 'other';
        coins = 10;
      }
    } else {
      // Use manual waste type and assign coins accordingly
      const coinValues = {
        'bio-degradable': 15,
        'plastic': 25,
        'e-waste': 50,
        'hazardous': 40,
        'other': 10
      };
      coins = coinValues[manualWasteType] || 10;
    }
    
     // Use relative path for image URL (frontend will handle full URL)
      const imageUrl = `/uploads/${req.file.filename}`;
 
    const waste = await Waste.create({
      user: req.user._id,
      image: imageUrl,
      location,
      type: wasteType,
      mlPrediction,
      coins,
      status: 'pending'
    });
    
    // Update user's stats (but don't add coins until approved by admin)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { weeklyProgress: 1, totalWasteUploaded: 1 }
    });
    
    res.status(201).json(waste);
  } catch (error) {
    // Clean up the temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get waste by ID
const getWasteById = async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id).populate('user', 'name email');
    
    if (waste) {
      // Process image URL
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
};

module.exports = {
  getWasteSubmissions,
  createWasteSubmission,
  getWasteById
};