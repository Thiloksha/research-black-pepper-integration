// server.js (UPDATED - replace your existing file)

require('dotenv').config();   // ← MUST be first line

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB Atlas
connectDB();

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);

// Basic Routes 
app.get('/', (req, res) => {
  res.send('🌿 Smart Black Pepper Guardian Backend Running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    database: global.dbConnected ? 'MongoDB Connected' : 'MongoDB Not Connected',
    storage: (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) ? 'Cloudinary Configured' : 'Cloudinary Not Configured',
    routes: [
      'GET  /api/soil-analysis',
      'GET  /api/soil-analysis/history',
      'GET  /api/soil-analysis/stats',
      'POST /api/predict-image',
      'GET  /api/predict-image/history',
      'POST /api/variety-predict',
      'GET  /api/variety-predict/history',
    ],
  });
});

// Feature Routes 
app.use('/api/soil-analysis', require('./routes/soilRoutes'));
app.use('/api/predict-image', require('./routes/imageRoutes'));
app.use('/api/variety-predict', require('./routes/varietyRoutes'));

// Mock Weather Route
app.get('/api/weather', (req, res) => {
  res.json({
    city: "Farm Location",
    weather: "light rain",
    temperature: 28.5,
    feels_like: 32.1,
    humidity: 78,
    wind: 4.2
  });
});

//  Global Error Handler 
const multer = require('multer');

app.use((err, req, res, next) => {
  console.error('Global error:', err.message);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'Upload error',
      details: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message,
    });
  }

  next();
});

// ── Start Server ─────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 Smart Black Pepper Guardian Backend`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Soil Analysis  → GET  /api/soil-analysis`);
  console.log(`📸 Disease Detect → POST /api/predict-image`);
  console.log(`🍃 Variety Detect → POST /api/variety-predict`);
});