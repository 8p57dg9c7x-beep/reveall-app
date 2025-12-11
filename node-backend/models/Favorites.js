const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional during dev
  },
  items: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['style', 'makeup', 'outfit'], required: true }
  }]
});

module.exports = mongoose.model('Favorites', favoritesSchema);
