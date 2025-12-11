const mongoose = require('mongoose');

const addiletsProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional during dev
  },
  styleDNA: {
    type: [String],
    default: ['Minimalist', 'Casual']
  },
  colorPalette: {
    type: [String],
    default: ['#1A1A1A', '#FFFFFF', '#B14CFF', '#FF6EC7']
  },
  celebrityMatches: [{
    name: { type: String, required: true },
    match: { type: Number, required: true },
    image: { type: String, required: true }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
addiletsProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AddiletsProfile', addiletsProfileSchema);
