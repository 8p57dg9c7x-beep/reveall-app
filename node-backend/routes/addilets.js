const express = require('express');
const AddiletsProfile = require('../models/AddiletsProfile');
const router = express.Router();

/**
 * POST /api/addilets/generate
 * Generate Addilets profile based on user favorites/wardrobe
 * Request: { favorites: [], wardrobe: [] }
 * Response: AddiletsProfile
 */
router.post('/generate', async (req, res) => {
  try {
    const { favorites = [], wardrobe = [] } = req.body;
    const userId = req.userId || null; // From auth middleware if present

    console.log('🧬 Generating Addilets profile...');
    console.log(`   Favorites: ${favorites.length}, Wardrobe: ${wardrobe.length}`);

    // Analyze favorites to determine style DNA
    const allTags = [];
    favorites.forEach(item => {
      if (item.tags) allTags.push(...item.tags);
      if (item.category) allTags.push(item.category);
    });

    // Get top styles from tags
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const topStyles = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Generate style DNA
    const styleDNA = topStyles.length > 0 
      ? topStyles 
      : ['Casual', 'Vintage', 'Streetwear'].sort(() => Math.random() - 0.5).slice(0, 3);

    // Generate color palette
    const colorPalette = ['#1A1A1A', '#FFFFFF', '#B14CFF', '#FF6EC7'];

    // Generate celebrity matches
    const celebrityMatches = [
      { name: 'Zendaya', match: 92, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
      { name: 'Timothée Chalamet', match: 88, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Hailey Bieber', match: 85, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }
    ];

    // Create or update profile in MongoDB
    let profile;
    if (userId) {
      profile = await AddiletsProfile.findOneAndUpdate(
        { userId },
        {
          styleDNA,
          colorPalette,
          celebrityMatches,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
    } else {
      // For unauthenticated users, just return the data
      profile = {
        styleDNA,
        colorPalette,
        celebrityMatches,
        updatedAt: new Date()
      };
    }

    console.log('✅ Addilets profile generated');

    res.json({
      styleDNA: profile.styleDNA,
      colorPalette: profile.colorPalette,
      celebrityMatches: profile.celebrityMatches,
      updatedAt: profile.updatedAt
    });
  } catch (error) {
    console.error('Generate Addilets profile error:', error);
    res.status(500).json({ error: 'Failed to generate Addilets profile' });
  }
});

/**
 * GET /api/addilets/profile
 * Get user's Addilets profile
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.userId || null;

    // Try to get from MongoDB if authenticated
    if (userId) {
      const profile = await AddiletsProfile.findOne({ userId });
      if (profile) {
        return res.json({
          styleDNA: profile.styleDNA,
          colorPalette: profile.colorPalette,
          celebrityMatches: profile.celebrityMatches,
          updatedAt: profile.updatedAt
        });
      }
    }

    // Return default profile for unauthenticated users
    res.json({
      styleDNA: ['Minimalist', 'Casual', 'Versatile'],
      colorPalette: ['#1A1A1A', '#FFFFFF', '#B14CFF', '#FF6EC7'],
      celebrityMatches: [
        { name: 'Zendaya', match: 92, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
        { name: 'Timothée Chalamet', match: 88, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' }
      ],
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Get Addilets profile error:', error);
    res.status(500).json({ error: 'Failed to get Addilets profile' });
  }
});

module.exports = router;
