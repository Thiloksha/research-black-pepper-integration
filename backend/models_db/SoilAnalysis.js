// models_db/SoilAnalysis.js

const mongoose = require('mongoose');

const soilAnalysisSchema = new mongoose.Schema(
  {
    // Raw sensor values from ThingSpeak
    sensors: {
      Temperature: { type: Number, default: 0 },
      Moisture: { type: Number, default: 0 },
      Nitrogen: { type: Number, default: 0 },
      Phosphorus: { type: Number, default: 0 },
      Potassium: { type: Number, default: 0 },
      pH: { type: Number, default: 0 },
      Humidity: { type: Number, default: 0 },
    },

    // AI result from predict.py
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ThingSpeak timestamp
    thingSpeakTimestamp: {
      type: String,
      default: '',
    },

    // Device or location info
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SoilAnalysis', soilAnalysisSchema);