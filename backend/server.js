const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- Config ----------------
const TS_CHANNEL = '3187265';
const TS_KEY = 'ISFWVJXZW7P5TMQ9';

// ---------------- Upload Config ----------------
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = (file.originalname || 'image.jpg').replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('Incoming file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }

    cb(null, true);
  },
});

const deleteUploadedFile = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Failed to delete uploaded file:', err.message);
    } else {
      console.log('Uploaded file deleted:', filePath);
    }
  });
};

// ---------------- Basic Routes ----------------
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
      'POST /api/variety-predict',
    ],
  });
});

// ---------------- Soil Analysis Route ----------------
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
        const lines = predictionResult.trim().split('\n');
        const lastLine = lines[lines.length - 1].trim();
        const aiResponse = JSON.parse(lastLine);

        const finalPayload = {
          timestamp: latest.created_at,
          sensors: sensorData,
          ai_analysis: aiResponse,
        };

        console.log('Final Soil Report Sent to Client.');
        return res.json(finalPayload);
      } catch (parseError) {
        console.error('Failed to parse Python output:', predictionResult);
        return res.status(500).json({ error: 'Invalid prediction format returned.' });
      }
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch from ThingSpeak or process data.' });
  }
});

// ---------------- General Image Prediction Route ----------------
app.post(
  '/api/predict-image',
  (req, res, next) => {
    console.log('==== IMAGE UPLOAD REQUEST RECEIVED ====');
    next();
  },
  upload.single('file'),
  (req, res) => {
    try {
      console.log('Uploaded file object:', req.file);
      console.log('Request body:', req.body);

      if (!req.file) {
        return res.status(400).json({
          error: "No image uploaded. Use form-data with field name 'file'.",
        });
      }

      const imagePath = req.file.path;
      const pythonScript = path.join(__dirname, 'predict_image.py');

      console.log('Saved image path:', imagePath);
      console.log('Python script path:', pythonScript);

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
        console.log('Python process exit code:', code);

        if (code !== 0) {
          console.error(`predict_image.py exited with code ${code}`);
          console.error('Python stdout:', predictionResult);
          console.error('Python stderr:', errorResult);

          deleteUploadedFile(imagePath);

          return res.status(500).json({
            error: 'Image prediction failed',
            stdout: predictionResult,
            stderr: errorResult,
          });
        }

        try {
          const lines = predictionResult.trim().split('\n');
          const lastLine = lines[lines.length - 1].trim();
          const aiResponse = JSON.parse(lastLine);

          deleteUploadedFile(imagePath);

          return res.json({
            success: true,
            image_name: req.file.filename,
            ai_analysis: aiResponse,
          });
        } catch (parseError) {
          console.error('Failed to parse Python output:', predictionResult);

          deleteUploadedFile(imagePath);

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
  }
);

// ---------------- Variety Prediction Route ----------------
app.post('/api/variety-predict', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const imagePath = req.file.path;
    console.log('Received image:', imagePath);

    const pythonProcess = spawn('python', [
      path.join(__dirname, 'predict_variety.py'),
      imagePath,
    ]);

    let result = '';
    let errorResult = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorResult += data.toString();
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log('=== Python exit code:', code);
      console.log('=== Python stdout:', result);
      console.log('=== Python stderr:', errorResult);

      deleteUploadedFile(imagePath);

      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({
          error: 'Variety prediction failed',
          details: errorResult,
        });
      }

      try {
        const lines = result.trim().split('\n');
        const lastLine = lines[lines.length - 1].trim();
        const parsed = JSON.parse(lastLine);
        return res.json(parsed);
      } catch (err) {
        console.error('Failed to parse Python output:', result);
        return res.status(500).json({
          error: 'Invalid response from Python script',
        });
      }
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: 'Server failed during image prediction.' });
  }
});

// ---------------- Multer Error Handler ----------------
app.use((err, req, res, next) => {
  console.error('Multer/Route error:', err);

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

// ---------------- Start Server ----------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 Smart Black Pepper Guardian Backend running on http://localhost:${PORT}`);
  console.log(`📡 Listening for requests at /api/soil-analysis`);
  console.log(`📸 Listening for requests at /api/predict-image`);
  console.log(`🍃 Listening for requests at /api/variety-predict`);
});