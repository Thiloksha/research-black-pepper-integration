// middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Local storage (for Python processing) ───────────────────────
const localStoragePath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localStoragePath);
  },
  filename: (req, file, cb) => {
    const safeName = (file.originalname || 'image.jpg').replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const localUpload = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// ── Delete local file helper ─────────────────────────────────────
const deleteLocalFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Failed to delete local file:', err.message);
    } else {
      console.log('Local file deleted:', filePath);
    }
  });
};

module.exports = { localUpload, deleteLocalFile };