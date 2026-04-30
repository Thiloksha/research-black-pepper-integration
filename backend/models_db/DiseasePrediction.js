// models_db/DiseasePrediction.js

const mongoose = require('mongoose');

const diseasePredictionSchema = new mongoose.Schema(
  {
    // Image info stored in Cloudinary
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        default: '',
      },
    },

    // Python AI result
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,  // flexible - stores any JSON
      default: {},
    },

    // Was it accepted
    accepted: {
      type: Boolean,
      default: true,
    },

    // Stage results if you use multi-stage model
    stageA: {
      label: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
    },

    // Device/user info
    deviceInfo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DiseasePrediction', diseasePredictionSchema);