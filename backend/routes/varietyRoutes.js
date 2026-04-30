// routes/varietyRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const { uploadVarietyImage, deleteFromCloudinary } = require('../config/cloudinary');
const { localUpload, deleteLocalFile } = require('../middleware/uploadMiddleware');
const VarietyPrediction = require('../models_db/VarietyPrediction');

// ── Helper: Run Python Script ────────────────────────────────────
const runPythonScript = (scriptPath, args) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args]);

    let result = '';
    let errorResult = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorResult += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log('Python exit code:', code);
      console.log('Python stdout:', result);

      if (code !== 0) {
        return reject(new Error(errorResult || 'Python script failed'));
      }

      try {
        const lines = result.trim().split('\n');
        const lastLine = lines[lines.length - 1].trim();
        resolve(JSON.parse(lastLine));
      } catch (err) {
        reject(new Error('Failed to parse Python output: ' + result));
      }
    });
  });
};

// ── POST /api/variety-predict ────────────────────────────────────
// Flow: Upload locally → Python processes → Upload to Cloudinary → Save to MongoDB
router.post('/', localUpload.single('image'), async (req, res) => {
  let localFilePath = null;
  let cloudinaryPublicId = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    localFilePath = req.file.path;
    console.log('📸 Image saved locally:', localFilePath);

    // ── Step 1: Run Python prediction ───────────────────────────
    const scriptPath = path.join(__dirname, '..', 'predict_variety.py');
    const predictionResult = await runPythonScript(scriptPath, [localFilePath]);

    console.log('🤖 Python prediction result:', predictionResult);

    // ── Step 2: Upload to Cloudinary ────────────────────────────
    const { cloudinary } = require('../config/cloudinary');

    const cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'black-pepper/variety-images',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' }
      ],
    });

    cloudinaryPublicId = cloudinaryResult.public_id;
    console.log('☁️ Uploaded to Cloudinary:', cloudinaryResult.secure_url);

    // ── Step 3: Delete local file ────────────────────────────────
    deleteLocalFile(localFilePath);
    localFilePath = null;

    // ── Step 4: Save to MongoDB ──────────────────────────────────
    const dbRecord = await VarietyPrediction.create({
      image: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        originalName: req.file.originalname || '',
      },
      prediction: {
        label: predictionResult.prediction?.label || '',
        confidence: predictionResult.prediction?.confidence || 0,
      },
      probabilities: predictionResult.probabilities || {},
      accepted: predictionResult.accepted !== false,
      deviceInfo: req.headers['user-agent'] || '',
    });

    console.log('💾 Saved to MongoDB:', dbRecord._id);

    // ── Step 5: Return response ──────────────────────────────────
    return res.status(200).json({
      success: true,
      recordId: dbRecord._id,
      image: {
        url: cloudinaryResult.secure_url,
      },
      accepted: predictionResult.accepted,
      prediction: predictionResult.prediction,
      probabilities: predictionResult.probabilities,
      savedAt: dbRecord.createdAt,
    });

  } catch (error) {
    console.error('❌ Variety prediction error:', error.message);

    // Cleanup on error
    if (localFilePath) deleteLocalFile(localFilePath);
    if (cloudinaryPublicId) {
      await deleteFromCloudinary(cloudinaryPublicId).catch(console.error);
    }

    return res.status(500).json({
      error: 'Variety prediction failed',
      details: error.message,
    });
  }
});

// ── GET /api/variety-predict/history ────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await VarietyPrediction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VarietyPrediction.countDocuments();

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: records,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ── GET /api/variety-predict/:id ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const record = await VarietyPrediction.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/variety-predict/:id ──────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const record = await VarietyPrediction.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete image from Cloudinary
    if (record.image?.publicId) {
      await deleteFromCloudinary(record.image.publicId);
    }

    // Delete from MongoDB
    await record.deleteOne();

    return res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;