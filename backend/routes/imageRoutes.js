// routes/imageRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { localUpload, deleteLocalFile } = require('../middleware/uploadMiddleware');
const DiseasePrediction = require('../models_db/DiseasePrediction');

const runPythonScript = (scriptPath, args) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args]);

    let result = '';
    let errorResult = '';

    pythonProcess.stdout.on('data', (data) => { result += data.toString(); });
    pythonProcess.stderr.on('data', (data) => {
      errorResult += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) return reject(new Error(errorResult || 'Python failed'));
      try {
        const lines = result.trim().split('\n');
        const lastLine = lines[lines.length - 1].trim();
        resolve(JSON.parse(lastLine));
      } catch (err) {
        reject(new Error('Failed to parse Python output'));
      }
    });
  });
};

// ── POST /api/predict-image ──────────────────────────────────────
router.post('/', localUpload.single('file'), async (req, res) => {
  let localFilePath = null;
  let cloudinaryPublicId = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    localFilePath = req.file.path;
    console.log('📸 Disease image saved locally:', localFilePath);

    // ── Step 1: Run Python ───────────────────────────────────────
    const scriptPath = path.join(__dirname, '..', 'predict_image.py');
    const aiResult = await runPythonScript(scriptPath, [localFilePath]);

    // ── Step 2: Upload to Cloudinary ────────────────────────────
    const { cloudinary } = require('../config/cloudinary');

    const cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'black-pepper/disease-images',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' }
      ],
    });

    cloudinaryPublicId = cloudinaryResult.public_id;

    // ── Step 3: Delete local file ────────────────────────────────
    deleteLocalFile(localFilePath);
    localFilePath = null;

    // ── Step 4: Save to MongoDB ──────────────────────────────────
    const dbRecord = await DiseasePrediction.create({
      image: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        originalName: req.file.originalname || '',
      },
      aiAnalysis: aiResult,
      accepted: aiResult.accepted !== false,
      stageA: aiResult.stageA || {},
      deviceInfo: req.headers['user-agent'] || '',
    });

    console.log('💾 Disease prediction saved:', dbRecord._id);

    return res.json({
      success: true,
      recordId: dbRecord._id,
      image: { url: cloudinaryResult.secure_url },
      ai_analysis: aiResult,
      savedAt: dbRecord.createdAt,
    });

  } catch (error) {
    console.error('❌ Disease prediction error:', error.message);

    if (localFilePath) deleteLocalFile(localFilePath);
    if (cloudinaryPublicId) {
      await deleteFromCloudinary(cloudinaryPublicId).catch(console.error);
    }

    return res.status(500).json({
      error: 'Image prediction failed',
      details: error.message,
    });
  }
});

// ── GET /api/predict-image/history ──────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await DiseasePrediction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DiseasePrediction.countDocuments();

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

// ── DELETE /api/predict-image/:id ────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const record = await DiseasePrediction.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (record.image?.publicId) {
      await deleteFromCloudinary(record.image.publicId);
    }

    await record.deleteOne();

    return res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;