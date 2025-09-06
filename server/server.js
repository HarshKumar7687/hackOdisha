const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Configure multer for temporary file uploads
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/temp/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname);
  }
});

const tempUpload = multer({ 
  storage: tempStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files with proper CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}));

// ML Service proxy endpoint
app.post('/api/ml/predict', tempUpload.single('file'), async (req, res) => {
  console.log('📨 Received ML prediction request');
  
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    let mlResponse;
    let filePath = req.file?.path;
    
    try {
      if (req.file) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        
        console.log('🔄 Calling your ML service...');
        mlResponse = await axios.post(
          `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/predict`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
            timeout: 15000 // 15 second timeout for ML processing
          }
        );
        
        // Clean up temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        // Check if ML service returned valid response
        if (mlResponse.data && mlResponse.data.success) {
          console.log('✅ Your ML model response received');
          
          return res.json({
            success: true,
            type: mlResponse.data.waste_category,
            confidence: mlResponse.data.confidence,
            coins: calculateCoinsFromCategory(mlResponse.data.waste_category),
            raw_prediction: mlResponse.data.original_class,
            isFallback: false
          });
        }
      }
    } catch (mlError) {
      console.error('❌ ML Service error:', mlError.message);
    }
    
    // If ML service fails, return error instead of fallback
    console.log('❌ ML service unavailable');
    
    // Clean up any temp files
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable',
      isFallback: false
    });
    
  } catch (error) {
    console.error('❌ Error in ML proxy:', error);
    
    // Clean up any temp files
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      isFallback: false
    });
  }
});

// Helper function to match your ML model's coin values
function calculateCoinsFromCategory(category) {
  const coinValues = {
    'bio-degradable': 15,
    'plastic': 25,
    'e-waste': 50,
    'hazardous': 40,
    'other': 10
  };
  return coinValues[category] || 10;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'waste-classification-api'
  });
});

// Debug endpoint to check uploads directory
app.get('/api/debug/uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.json({ 
        error: err.message, 
        path: uploadsPath,
        exists: fs.existsSync(uploadsPath)
      });
    }
    
    res.json({ 
      uploadsDirectory: uploadsPath,
      fileCount: files.length,
      files: files.slice(0, 10),
      backendUrl: process.env.BACKEND_URL || 'http://localhost:8000'
    });
  });
});

// Debug endpoint to test image access
app.get('/api/test-image', (req, res) => {
  const testImagePath = path.join(__dirname, 'uploads');
  
  fs.readdir(testImagePath, (err, files) => {
    if (err) {
      return res.status(500).json({ 
        error: err.message,
        message: 'Uploads directory not accessible',
        path: testImagePath
      });
    }
    
    // Try to access a file if one exists
    if (files.length > 0) {
      const testFile = files[0];
      const filePath = path.join(testImagePath, testFile);
      
      fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
          return res.json({
            accessible: false,
            error: `Cannot read file: ${testFile}`,
            files: files.slice(0, 5)
          });
        }
        
        res.json({
          accessible: true,
          testFile: testFile,
          fileCount: files.length,
          sampleFiles: files.slice(0, 5),
          uploadsUrl: `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/`
        });
      });
    } else {
      res.json({
        accessible: true,
        message: 'Uploads directory is empty',
        fileCount: 0
      });
    }
  });
});

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/contest', require('./routes/contest'));
app.use('/api/user', require('./routes/user'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:5001'}`);
  console.log(`🌐 Backend URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads served at: http://localhost:${PORT}/uploads/`);
});