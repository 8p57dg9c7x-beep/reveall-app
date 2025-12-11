import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from './FavoritesContext';
import { API_BASE_URL } from '../config';

const AddiletsContext = createContext();
const STORAGE_KEY = '@addilets_personalization';

export const useAddilets = () => {
  const context = useContext(AddiletsContext);
  if (!context) {
    throw new Error('useAddilets must be used within an AddiletsProvider');
  }
  return context;
};

export const AddiletsProvider = ({ children }) => {
  const { favoriteOutfits, favoriteBeauty } = useFavorites();
  const [personalization, setPersonalization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted personalization on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Generate personalization whenever favorites change
  useEffect(() => {
    if (personalization !== null) {
      generatePersonalization();
    }
  }, [favoriteOutfits.length, favoriteBeauty.length]);

  const loadPersistedData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPersonalization(JSON.parse(stored));
      } else {
        generatePersonalization();
      }
    } catch (error) {
      console.error('Error loading Addilets data:', error);
      generatePersonalization();
    } finally {
      setLoading(false);
    }
  };

  const persistData = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting Addilets data:', error);
    }
  };

  const generatePersonalization = () => {
    setLoading(true);

    // Mock AI Logic - Analyze user's favorites
    const allTags = [];
    favoriteOutfits.forEach(item => {
      if (item.tags) allTags.push(...item.tags);
      if (item.category) allTags.push(item.category);
    });

    // Get top 3 most common styles
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    const topStyles = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Generate style profile
    const stylePersonalities = topStyles.length > 0 
      ? topStyles 
      : ['Minimalist', 'Casual', 'Versatile'];

    // Generate color palette based on favorites
    const colorPalette = [
      { name: 'Primary', color: '#1A1A1A', desc: 'Black' },
      { name: 'Accent', color: '#FFFFFF', desc: 'White' },
      { name: 'Highlight', color: '#B14CFF', desc: 'Purple' },
      { name: 'Secondary', color: '#FF6EC7', desc: 'Pink' },
    ];

    // Mock celebrity matches
    const celebrityMatches = [
      { name: 'Zendaya', match: 92, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
      { name: 'Timothée Chalamet', match: 88, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Hailey Bieber', match: 85, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    ];

    // Generate daily outfit recommendations
    const outfitRecommendations = [
      {
        id: 1,
        title: 'Morning Coffee Run',
        occasion: 'Casual',
        weather: 'Cool',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
        confidence: 94,
        reason: 'Based on your casual style preference',
        tags: ['casual', 'comfortable', 'everyday'],
      },
      {
        id: 2,
        title: 'Afternoon Meeting',
        occasion: 'Business Casual',
        weather: 'Indoor',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
        confidence: 89,
        reason: 'Matches your professional wardrobe',
        tags: ['formal', 'professional', 'elegant'],
      },
      {
        id: 3,
        title: 'Evening Dinner',
        occasion: 'Smart Casual',
        weather: 'Mild',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
        confidence: 91,
        reason: 'Perfect for your style profile',
        tags: ['smart-casual', 'evening', 'stylish'],
      },
      {
        id: 4,
        title: 'Weekend Brunch',
        occasion: 'Casual Chic',
        weather: 'Sunny',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
        confidence: 92,
        reason: 'Aligned with your weekend style',
        tags: ['weekend', 'brunch', 'relaxed'],
      },
    ];

    // Generate makeup recommendations
    const makeupRecommendations = [
      {
        id: 1,
        title: 'Natural Glow',
        vibe: 'Effortless',
        image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&q=80',
        match: 95,
        tags: ['natural', 'minimal', 'everyday'],
      },
      {
        id: 2,
        title: 'Soft Glam',
        vibe: 'Elegant',
        image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&q=80',
        match: 88,
        tags: ['glam', 'elegant', 'evening'],
      },
    ];

    // Seasonal capsule wardrobe
    const capsuleItems = [
      { id: 1, name: 'White Tee', category: 'tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80' },
      { id: 2, name: 'Black Jeans', category: 'bottoms', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80' },
      { id: 3, name: 'Sneakers', category: 'shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&q=80' },
      { id: 4, name: 'Blazer', category: 'outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=80' },
    ];

    // Set personalization data
    const newPersonalization = {
      styleProfile: {
        personalities: stylePersonalities,
        colorPalette,
        celebrityMatches,
      },
      recommendations: {
        outfits: outfitRecommendations,
        makeup: makeupRecommendations,
        capsule: capsuleItems,
      },
      preferences: {
        styles: stylePersonalities,
        colors: colorPalette.map(c => c.color),
        occasions: ['Casual', 'Business Casual', 'Smart Casual'],
      },
    };

    setPersonalization(newPersonalization);
    persistData(newPersonalization);
    setLoading(false);
  };

  const refreshPersonalization = () => {
    setLoading(true);
    generatePersonalization();
  };

  const getRecommendedOutfits = (count = 3) => {
    if (!personalization) return [];
    return personalization.recommendations.outfits.slice(0, count);
  };

  const getStylePreferences = () => {
    if (!personalization) return [];
    return personalization.preferences.styles;
  };

  const getColorPalette = () => {
    if (!personalization) return [];
    return personalization.styleProfile.colorPalette;
  };

  const value = {
    personalization,
    loading,
    refreshPersonalization,
    getRecommendedOutfits,
    getStylePreferences,
    getColorPalette,
  };

  return (
    <AddiletsContext.Provider value={value}>
      {children}
    </AddiletsContext.Provider>
  );
};
