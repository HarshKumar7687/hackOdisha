const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/avatars/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;