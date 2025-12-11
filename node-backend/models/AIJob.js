const mongoose = require('mongoose');

const aiJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for now (can upload without auth during dev)
  },
  type: {
    type: String,
    enum: ['upload', 'stylist', 'wardrobe', 'bodyscan', 'body-scan', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    type: String
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('AIJob', aiJobSchema);
