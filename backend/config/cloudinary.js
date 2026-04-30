// config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Variety/Pepper Leaf Images 
const varietyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'black-pepper/variety-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' }
    ],
  },
});

// ── Storage for Disease Detection Images ────────────────────────
const diseaseStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'black-pepper/disease-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' }
    ],
  },
});

// ── Multer Upload Instances ──────────────────────────────────────
const uploadVarietyImage = multer({
  storage: varietyStorage,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

const uploadDiseaseImage = multer({
  storage: diseaseStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// ── Delete Image from Cloudinary ─────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error.message);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadVarietyImage,
  uploadDiseaseImage,
  deleteFromCloudinary,
};