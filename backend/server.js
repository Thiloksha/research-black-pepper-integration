const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

const TS_CHANNEL = '3187265';
const TS_KEY = 'ISFWVJXZW7P5TMQ9';

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

app.get('/', (req, res) => {
  res.send('Smart Black Pepper Guardian Backend Running 🚀');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    routes: [
      'GET /api/soil-analysis',
      'POST /api/predict-image',
    ],
  });
});

app.get('/api/soil-analysis', async (req, res) => {
  try {
    console.log('Fetching live data from ThingSpeak...');
    const url = `https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_KEY}&results=1`;

    const response = await axios.get(url);
    const feeds = response.data.feeds;

    if (!feeds || feeds.length === 0) {
      return res.status(404).json({ error: 'No data found on ThingSpeak channel.' });
    }

    const latest = feeds[0];

    const sensorData = {
      Temperature: parseFloat(latest.field1 || 0),
      Moisture: parseFloat(latest.field2 || 0),
      Nitrogen: parseFloat(latest.field3 || 0),
      Phosphorus: parseFloat(latest.field4 || 0),
      Potassium: parseFloat(latest.field5 || 0),
      pH: parseFloat(latest.field6 || 0),
      Humidity: parseFloat(latest.field7 || 0),
    };

    console.log('Extracted Sensor Data:', sensorData);

    const pythonProcess = spawn('python', [
      path.join(__dirname, 'predict.py'),
      JSON.stringify(sensorData),
    ]);

    let predictionResult = '';
    let errorResult = '';

    pythonProcess.stdout.on('data', (data) => {
      predictionResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorResult += data.toString();
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({
          error: 'AI Model Prediction Failed',
          details: errorResult,
        });
      }

      try {
        const aiResponse = JSON.parse(predictionResult);

        const finalPayload = {
          timestamp: latest.created_at,
          sensors: sensorData,
          ai_analysis: aiResponse,
        };

        console.log('Final Soil Report Sent to Client.');
        res.json(finalPayload);
      } catch (parseError) {
        console.error('Failed to parse Python output:', predictionResult);
        res.status(500).json({ error: 'Invalid prediction format returned.' });
      }
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from ThingSpeak or process data.' });
  }
});

app.post('/api/predict-image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded. Use form-data with field name 'file'.",
      });
    }

    const imagePath = req.file.path;
    const pythonScript = path.join(__dirname, 'predict_image.py');

    const pythonProcess = spawn('python', [pythonScript, imagePath]);

    let predictionResult = '';
    let errorResult = '';

    pythonProcess.stdout.on('data', (data) => {
      predictionResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorResult += data.toString();
      console.error(`Image Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`predict_image.py exited with code ${code}`);
        console.error('Python stdout:', predictionResult);
        console.error('Python stderr:', errorResult);

        return res.status(500).json({
          error: 'Image prediction failed',
          stdout: predictionResult,
          stderr: errorResult,
        });
      }

      try {
        const aiResponse = JSON.parse(predictionResult);

        return res.json({
          success: true,
          image_name: req.file.filename,
          ai_analysis: aiResponse,
        });
      } catch (parseError) {
        console.error('Failed to parse Python output:', predictionResult);
        return res.status(500).json({
          error: 'Invalid image prediction format returned.',
          raw_output: predictionResult,
          stderr: errorResult,
        });
      }
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({
      error: 'Failed to process uploaded image.',
      details: error.message,
    });
  }
});

// Multer Error Handler
app.use((err, req, res, next) => {
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

app.listen(PORT, () => {
  console.log(`\n🌱 Smart Black Pepper Guardian Backend running on http://localhost:${PORT}`);
  console.log(`📡 Listening for requests at /api/soil-analysis (ThingSpeak -> AI)`);
  console.log(`📸 Listening for requests at /api/predict-image (Image -> AI)`);
});