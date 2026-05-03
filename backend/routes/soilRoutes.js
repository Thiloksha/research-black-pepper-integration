// routes/soilRoutes.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const { spawn } = require('child_process');
const SoilAnalysis = require('../models_db/SoilAnalysis');

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

// ── GET /api/soil-analysis ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const TS_CHANNEL = process.env.TS_CHANNEL || "3187265";
    const TS_KEY = process.env.TS_KEY || "ISFWVJXZW7P5TMQ9";

    console.log('📡 Fetching from ThingSpeak...');

    const url = `https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_KEY}&results=1`;
    const response = await axios.get(url);
    const feeds = response.data.feeds;

    if (!feeds || feeds.length === 0) {
      return res.status(404).json({ error: 'No data from ThingSpeak.' });
    }

    const latest = feeds[0];

    const sensorData = {
      Temperature: parseFloat(latest.field1 || 28),
      Moisture: parseFloat(latest.field2 || 60),
      Nitrogen: parseFloat(latest.field3 || 150),
      Phosphorus: parseFloat(latest.field4 || 40),
      Potassium: parseFloat(latest.field5 || 200),
      pH: parseFloat(latest.field6 || 6.5),
      Humidity: parseFloat(latest.field7 || 75),
    };

    // ── Run Python predict.py ────────────────────────────────────
    const scriptPath = path.join(__dirname, '..', 'predict.py');
    const aiResult = await runPythonScript(scriptPath, [JSON.stringify(sensorData)]);

    // ── Save to MongoDB ──────────────────────────────────────────
    let dbRecord = { _id: 'mock_id', createdAt: new Date() };
    try {
      dbRecord = await SoilAnalysis.create({
        sensors: sensorData,
        aiAnalysis: aiResult,
        thingSpeakTimestamp: latest.created_at,
      });
      console.log('💾 Soil analysis saved:', dbRecord._id);
    } catch (e) {
      console.log('⚠️ Skipping DB save (MongoDB not connected or error)');
    }

    return res.json({
      success: true,
      recordId: dbRecord._id,
      timestamp: latest.created_at,
      sensors: sensorData,
      ai_analysis: aiResult,
      savedAt: dbRecord.createdAt,
    });

  } catch (error) {
    console.error('❌ Soil analysis error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ── GET /api/soil-analysis/history ──────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await SoilAnalysis.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SoilAnalysis.countDocuments();

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

// ── GET /api/soil-analysis/stats ────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total = await SoilAnalysis.countDocuments();

    const latest = await SoilAnalysis.findOne().sort({ createdAt: -1 });

    const avgStats = await SoilAnalysis.aggregate([
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$sensors.Temperature' },
          avgMoisture: { $avg: '$sensors.Moisture' },
          avgPH: { $avg: '$sensors.pH' },
          avgNitrogen: { $avg: '$sensors.Nitrogen' },
        },
      },
    ]);

    return res.json({
      success: true,
      total,
      latestReading: latest?.sensors || {},
      averages: avgStats[0] || {},
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;