const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const TS_CHANNEL = '3187265';
const TS_KEY = 'ISFWVJXZW7P5TMQ9';

// Endpoint to fetch ThingSpeak data and run prediction
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

        // Map ThingSpeak fields to the Sensor format expected by the model
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

        // Call Python script for AI prediction using Hybrid Ensemble
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
                // Parse the JSON printed by the Python script
                const aiResponse = JSON.parse(predictionResult);

                // Construct final payload
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

app.listen(PORT, () => {
    console.log(`\n🌱 Smart Black Pepper Guardian Backend running on http://localhost:${PORT}`);
    console.log(`📡 Listening for requests at /api/soil-analysis (ThingSpeak -> AI)`);
});
