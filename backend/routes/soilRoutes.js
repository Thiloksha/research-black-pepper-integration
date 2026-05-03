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

// ── Rule-based AI assessment (runs in Node — no Python/model files needed) ──
function soilAIAssessment(d) {
  const issues = [];

  // Nitrogen
  if (d.Nitrogen < 100)       issues.push('Low Nitrogen');
  else if (d.Nitrogen > 280)  issues.push('Excess Nitrogen');

  // Phosphorus
  if (d.Phosphorus < 30)      issues.push('Low Phosphorus');
  else if (d.Phosphorus > 120) issues.push('Excess Phosphorus');

  // Potassium
  if (d.Potassium < 100)      issues.push('Low Potassium');
  else if (d.Potassium > 300) issues.push('Excess Potassium');

  // pH
  if (d.pH < 5.5)             issues.push('Acidic Soil');
  else if (d.pH > 7.0)        issues.push('Alkaline Soil');

  // Moisture / Humidity
  const moist = d.Moisture ?? d.Humidity ?? 60;
  if (moist < 35)             issues.push('Low Moisture');
  else if (moist > 80)        issues.push('Excess Moisture');

  // Temperature
  if (d.Temperature > 38)     issues.push('High Temperature');

  const isHealthy = issues.length === 0;
  const label = isHealthy ? 'Healthy' : issues[0];

  return {
    prediction: label,
    consensus:  label,
    status:     isHealthy ? 'Healthy' : 'Needs Attention',
    issues,
    votes: {
      'Rule-RF':  label,
      'Rule-XGB': label,
      'Rule-SVM': label,
    },
    method: 'rule-based',
  };
}

// ── GET /api/soil-analysis ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Arduino Channel 3315917
    // field1=Humidity, field2=Temperature, field3=Conductivity(EC),
    // field4=pH, field5=Nitrogen, field6=Phosphorus, field7=Potassium
    const TS_CHANNEL = process.env.TS_CHANNEL || "3315917";
    const TS_KEY = process.env.TS_KEY || "4V4GFLG68RNZH5JI";  // Read API Key

    console.log('📡 Fetching from ThingSpeak channel', TS_CHANNEL, '...');

    const url = `https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_KEY}&results=1`;
    const response = await axios.get(url, { timeout: 15000 });
    const feeds = response.data.feeds;

    if (!feeds || feeds.length === 0) {
      return res.status(404).json({ error: 'No data from ThingSpeak.' });
    }

    const latest = feeds[0];

    // Map fields exactly as defined in Arduino sketch
    const sensorData = {
      Humidity:     parseFloat(latest.field1 || 75),    // field1 → Humidity
      Temperature:  parseFloat(latest.field2 || 28),    // field2 → Temperature
      Conductivity: parseFloat(latest.field3 || 1.0),   // field3 → Conductivity (EC)
      pH:           parseFloat(latest.field4 || 6.5),   // field4 → pH
      Nitrogen:     parseFloat(latest.field5 || 150),   // field5 → Nitrogen
      Phosphorus:   parseFloat(latest.field6 || 40),    // field6 → Phosphorus
      Potassium:    parseFloat(latest.field7 || 200),   // field7 → Potassium
      Moisture:     parseFloat(latest.field1 || 75),    // derived from Humidity
    };

    // ── AI analysis (rule-based — no Python/model files required) ────
    const aiResult = soilAIAssessment(sensorData);
    console.log('🤖 AI verdict:', aiResult.prediction);

    // ── Save to MongoDB (optional) ───────────────────────────────────
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