const mongoose = require('mongoose');

const aiJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional during dev
  },
  type: {
    type: String,
    enum: ['style', 'wardrobe', 'body-scan'],
    required: true
  },
  inputImage: {
    type: String, // S3 URL or local path
    required: false
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  error: {
    type: String
  }
}, {
  timestamps: true // Automatically handles createdAt and updatedAt
});

module.exports = mongoose.model('AIJob', aiJobSchema);
