const mongoose = require('mongoose');

const revealDNASchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  styleDNA: {
    type: [String],
    default: []
  },
  colorPalette: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  celebrityMatches: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
revealDNASchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RevealDNA', revealDNASchema);
