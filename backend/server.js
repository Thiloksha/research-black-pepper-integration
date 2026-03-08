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

// ---------------- Existing Config ----------------
const TS_CHANNEL = '3187265';
const TS_KEY = 'ISFWVJXZW7P5TMQ9';

// ---------------- Upload Config ----------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ---------------- Soil Analysis Route ----------------
app.get('/api/soil-analysis', async (req, res) => {
    try {
        console.log("Fetching live data from ThingSpeak...");
        const url = `https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_KEY}&results=1`;

        const response = await axios.get(url);
        const feeds = response.data.feeds;

        if (!feeds || feeds.length === 0) {
            return res.status(404).json({ error: "No data found on ThingSpeak channel." });
        }

        const latest = feeds[0];

        const sensorData = {
            Temperature: parseFloat(latest.field1 || 0),
            Moisture: parseFloat(latest.field2 || 0),
            Nitrogen: parseFloat(latest.field3 || 0),
            Phosphorus: parseFloat(latest.field4 || 0),
            Potassium: parseFloat(latest.field5 || 0),
            pH: parseFloat(latest.field6 || 0),
            Humidity: parseFloat(latest.field7 || 0)
        };

        console.log("Extracted Sensor Data:", sensorData);

        const pythonProcess = spawn('python', [
            path.join(__dirname, 'predict.py'),
            JSON.stringify(sensorData)
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
                    error: "AI Model Prediction Failed",
                    details: errorResult
                });
            }

            try {
                const aiResponse = JSON.parse(predictionResult);

                const finalPayload = {
                    timestamp: latest.created_at,
                    sensors: sensorData,
                    ai_analysis: aiResponse
                };

                console.log("Final Report Sent to Client.");
                res.json(finalPayload);
            } catch (parseError) {
                console.error("Failed to parse Python output:", predictionResult);
                res.status(500).json({ error: "Invalid prediction format returned." });
            }
        });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: "Failed to fetch from ThingSpeak or process data." });
    }
});

// ---------------- NEW Variety Prediction Route ----------------
app.post('/api/variety-predict', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded." });
        }

        const imagePath = req.file.path;
        console.log("Received image:", imagePath);

        const pythonProcess = spawn('python', [
            path.join(__dirname, 'predict_variety.py'),
            imagePath
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
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Failed to delete uploaded file:", err.message);
            });

            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                return res.status(500).json({
                    error: "Variety prediction failed",
                    details: errorResult
                });
            }

            try {
                // FIX: take only the last line (the actual JSON result)
                const lines = result.trim().split('\n');
                const lastLine = lines[lines.length - 1].trim();
                const parsed = JSON.parse(lastLine);
                return res.json(parsed);
            } catch (err) {
                console.error("Failed to parse Python output:", result);
                return res.status(500).json({
                    error: "Invalid response from Python script"
                });
            }
        });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: "Server failed during image prediction." });
    }
});

app.listen(PORT, () => {
    console.log(`\n🌱 Smart Black Pepper Guardian Backend running on http://localhost:${PORT}`);
    console.log(`📡 Soil API:    /api/soil-analysis`);
    console.log(`📷 Variety API: /api/variety-predict`);
});