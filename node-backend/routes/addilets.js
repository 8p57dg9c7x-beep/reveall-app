const express = require('express');
const router = express.Router();

// Placeholder for Addilets endpoints
// Will be implemented after initial endpoint testing

router.get('/profile', (req, res) => {
  res.json({ message: 'Addilets profile endpoint - coming soon' });
});

router.post('/generate', (req, res) => {
  res.json({ message: 'Addilets generate endpoint - coming soon' });
});

module.exports = router;
