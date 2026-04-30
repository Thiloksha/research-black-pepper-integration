const mongoose = require('mongoose');

const varietyPredictionSchema = new mongoose.Schema(
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

    // Prediction Result from Python
    prediction: {
      label: {
        type: String,
        enum: ['Butawerala', 'Dingirala', 'Kohukuburerala'],
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
      },
    },

    // All class probabilities
    probabilities: {
      Butawerala: { type: Number, default: 0 },
      Dingirala: { type: Number, default: 0 },
      Kohukuburerala: { type: Number, default: 0 },
    },

    // Was prediction accepted?
    accepted: {
      type: Boolean,
      default: true,
    },

    // Optional: device or user info
    deviceInfo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,   // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model('VarietyPrediction', varietyPredictionSchema);