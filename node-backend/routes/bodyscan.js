const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

/**
 * POST /api/body-scan
 * Process body scan from image URLs
 * 
 * Body: {
 *   frontImageUrl: string,
 *   sideImageUrl: string
 * }
 * 
 * Returns: {
 *   measurements: {
 *     chest: number,
 *     waist: number,
 *     hips: number,
 *     inseam: number,
 *     heightEst: number
 *   }
 * }
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { frontImageUrl, sideImageUrl } = req.body;

    if (!frontImageUrl || !sideImageUrl) {
      return res.status(400).json({ 
        error: 'Both frontImageUrl and sideImageUrl are required' 
      });
    }

    console.log('🔍 Processing body scan...');
    console.log(`Front: ${frontImageUrl}`);
    console.log(`Side: ${sideImageUrl}`);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock measurements (would be from AI in production)
    const measurements = {
      chest: 90 + Math.floor(Math.random() * 15),      // 90-105 cm
      waist: 75 + Math.floor(Math.random() * 10),      // 75-85 cm
      hips: 88 + Math.floor(Math.random() * 12),       // 88-100 cm
      inseam: 78 + Math.floor(Math.random() * 8),      // 78-86 cm
      heightEst: 175 + Math.floor(Math.random() * 15), // 175-190 cm
    };

    console.log('✅ Body scan complete:', measurements);

    res.json({ measurements });
  } catch (error) {
    console.error('❌ Body scan error:', error);
    res.status(500).json({ error: 'Body scan processing failed' });
  }
});

module.exports = router;
