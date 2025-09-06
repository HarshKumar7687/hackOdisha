const fs = require('fs');
const path = require('path');

// Clean up uploads directory periodically
function cleanupUploads() {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    return;
  }
  
  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stat = fs.statSync(filePath);
    
    if (now - stat.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up old file: ${file}`);
    }
  });
}

// Run cleanup every hour
setInterval(cleanupUploads, 60 * 60 * 1000);