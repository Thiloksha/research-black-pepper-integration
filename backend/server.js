const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const prisma = require('./src/config/prisma');

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

const toPublicImageUrl = (filename) => {
  return `/uploads/${filename}`;
};

const toDecimalOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const cleaned =
    typeof value === 'string' ? value.replace('%', '').trim() : value;

  const num = Number(cleaned);

  return Number.isFinite(num) ? num : null;
};

const mapDetectionForClient = (detection) => {
  return {
    id: detection.id,
    image: detection.imageUrl,
    disease: detection.predictedDisease,
    confidence:
      detection.confidence !== null && detection.confidence !== undefined
        ? `${detection.confidence}%`
        : 'N/A',
    treatment: detection.treatment,
    description: detection.description,
    probabilities: Array.isArray(detection.probabilities)
      ? Object.fromEntries(
          detection.probabilities.map((p) => [
            p.diseaseName,
            Number(p.probability),
          ])
        )
      : {},
    lowConfidence: detection.lowConfidence,
    savedAt: detection.createdAt,
    rejectReason: detection.rejectReason,
    pepperScore: detection.pepperScore,
  };
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
      'GET /api/detections',
      'GET /api/detections/:id',
      'DELETE /api/detections/:id',
      'DELETE /api/detections',
    ],
  });
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

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

// ---------------- Disease Detection History Routes ----------------
app.get('/api/detections', async (req, res) => {
  try {
    const detections = await prisma.diseaseDetection.findMany({
      include: {
        probabilities: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(detections.map(mapDetectionForClient));
  } catch (error) {
    console.error('Fetch detections error:', error);
    return res.status(500).json({ error: 'Failed to fetch detections' });
  }
});

app.get('/api/detections/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const detection = await prisma.diseaseDetection.findUnique({
      where: { id },
      include: {
        probabilities: true,
      },
    });

    if (!detection) {
      return res.status(404).json({ error: 'Detection not found' });
    }

    return res.json(mapDetectionForClient(detection));
  } catch (error) {
    console.error('Fetch detection by id error:', error);
    return res.status(500).json({ error: 'Failed to fetch detection' });
  }
});

app.delete('/api/detections/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑 Delete single detection request received for ID:', id);

    const existing = await prisma.diseaseDetection.findUnique({
      where: { id },
    });

    if (!existing) {
      console.log('⚠ Detection not found:', id);
      return res.status(404).json({ error: 'Detection not found' });
    }

    await prisma.diseaseDetection.delete({
      where: { id },
    });

    console.log('✅ Detection deleted successfully:', id);

    return res.json({ message: 'Detection deleted successfully' });
  } catch (error) {
    console.error('❌ Delete detection error:', error);
    return res.status(500).json({ error: 'Failed to delete detection' });
  }
});

app.delete('/api/detections', async (req, res) => {
  try {
    console.log('🗑 Delete ALL detections request received');

    await prisma.detectionProbability.deleteMany();
    await prisma.diseaseDetection.deleteMany();

    console.log('✅ All detections deleted successfully');

    return res.json({ message: 'All detections deleted successfully' });
  } catch (error) {
    console.error('❌ Delete all detections error:', error);
    return res.status(500).json({ error: 'Failed to delete all detections' });
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
  async (req, res) => {
    try {
      console.log('Uploaded file object:', req.file);
      console.log('Request body:', req.body);

      if (!req.file) {
        return res.status(400).json({
          error: "No image uploaded. Use form-data with field name 'file'.",
        });
      }

      const imagePath = req.file.path;
      const imageUrl = toPublicImageUrl(req.file.filename);
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

      pythonProcess.on('close', async (code) => {
        console.log('Python process exit code:', code);

        if (code !== 0) {
          console.error(`predict_image.py exited with code ${code}`);
          console.error('Python stdout:', predictionResult);
          console.error('Python stderr:', errorResult);

          try {
            await prisma.diseaseDetection.create({
              data: {
                imageUrl,
                imageName: req.file.originalname,
                imageMimeType: req.file.mimetype,
                imageSizeBytes: req.file.size,
                rejectReason: 'Python prediction failed',
                rawResponse: {
                  stdout: predictionResult,
                  stderr: errorResult,
                },
              },
            });
          } catch (dbError) {
            console.error('Failed to save failed detection:', dbError);
          }

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

          const probabilityEntries = Object.entries(aiResponse.all_probabilities || {})
            .map(([diseaseName, probability]) => ({
              diseaseName,
              probability: toDecimalOrNull(probability),
            }))
            .filter((item) => item.probability !== null);

          const savedDetection = await prisma.diseaseDetection.create({
            data: {
              imageUrl,
              imageName: req.file.originalname,
              imageMimeType: req.file.mimetype,
              imageSizeBytes: req.file.size,
              predictedDisease: aiResponse.prediction || null,
              confidence: toDecimalOrNull(aiResponse.confidence),
              description: aiResponse.description || null,
              treatment: aiResponse.advice || null,
              lowConfidence: Boolean(aiResponse.low_confidence),
              pepperScore: toDecimalOrNull(aiResponse.pepper_score),
              rejectReason: aiResponse.reject_reason || null,
              rawResponse: aiResponse,
              probabilities: probabilityEntries.length
                ? {
                    create: probabilityEntries,
                  }
                : undefined,
            },
            include: {
              probabilities: true,
            },
          });

          return res.json({
            success: true,
            detectionId: savedDetection.id,
            image_name: req.file.filename,
            image_url: imageUrl,
            ai_analysis: aiResponse,
          });
        } catch (parseError) {
          console.error('Prediction save/parse error:', parseError);
          console.error('Raw Python output:', predictionResult);

          try {
            await prisma.diseaseDetection.create({
              data: {
                imageUrl,
                imageName: req.file.originalname,
                imageMimeType: req.file.mimetype,
                imageSizeBytes: req.file.size,
                rejectReason: 'Invalid image prediction format returned',
                rawResponse: {
                  raw_output: predictionResult,
                  stderr: errorResult,
                },
              },
            });
          } catch (dbError) {
            console.error('Failed to save parse failure detection:', dbError);
          }

          return res.status(500).json({
            error: 'Failed to save or parse prediction result.',
            details: parseError.message,
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
app.listen(PORT, '0.0.0.0', async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
  }

  console.log(`\n🌱 Smart Black Pepper Guardian Backend running on http://localhost:${PORT}`);
  console.log(`📡 Listening for requests at /api/soil-analysis`);
  console.log(`📸 Listening for requests at /api/predict-image`);
  console.log(`🍃 Listening for requests at /api/variety-predict`);
  console.log(`🗂 Listening for requests at /api/detections`);
});