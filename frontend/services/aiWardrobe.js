/**
 * AI Wardrobe Service
 * Handles wardrobe management and outfit generation
 * 
 * Future Backend Integration:
 * - Upload wardrobe items with auto-tagging
 * - Generate outfit combinations from wardrobe
 * - Save and manage digital wardrobe
 */

import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ai_wardrobe_items';

/**
 * Upload and auto-tag wardrobe item
 * @param {string} imageUri - Image URI from ImagePicker
 * @returns {Promise<Object>} Wardrobe item with auto-generated tags
 */
export const uploadWardrobeItem = async (imageUri) => {
  try {
    // Future API call:
    // const formData = new FormData();
    // formData.append('image', {
    //   uri: imageUri,
    //   type: 'image/jpeg',
    //   name: 'wardrobe-item.jpg',
    // });
    // 
    // const response = await fetch(`${API_BASE_URL}/api/ai/wardrobe/upload`, {
    //   method: 'POST',
    //   body: formData,
    // });
    // const data = await response.json();
    // return data;

    // Mock auto-tagging
    return mockAutoTag(imageUri);
  } catch (error) {
    console.error('Error uploading wardrobe item:', error);
    throw error;
  }
};

/**
 * Generate outfit combinations from selected items
 * @param {Array<Object>} selectedItems - Array of wardrobe item IDs
 * @returns {Promise<Array<Object>>} Generated outfit combinations
 */
export const generateOutfits = async (selectedItems) => {
  try {
    // Future API call:
    // const response = await fetch(`${API_BASE_URL}/api/ai/wardrobe/generate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ itemIds: selectedItems }),
    // });
    // const data = await response.json();
    // return data;

    // Mock outfit generation
    return mockGenerateOutfits(selectedItems);
  } catch (error) {
    console.error('Error generating outfits:', error);
    throw error;
  }
};

/**
 * Get all wardrobe items from local storage
 * @returns {Promise<Array<Object>>} Array of wardrobe items
 */
export const getWardrobeItems = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting wardrobe items:', error);
    return [];
  }
};

/**
 * Save wardrobe items to local storage
 * @param {Array<Object>} items - Array of wardrobe items
 * @returns {Promise<void>}
 */
export const saveWardrobeItems = async (items) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving wardrobe items:', error);
    throw error;
  }
};

/**
 * Delete wardrobe item
 * @param {number} itemId - Item ID to delete
 * @returns {Promise<void>}
 */
export const deleteWardrobeItem = async (itemId) => {
  try {
    const items = await getWardrobeItems();
    const filtered = items.filter(item => item.id !== itemId);
    await saveWardrobeItems(filtered);
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    throw error;
  }
};

/**
 * Mock function for auto-tagging
 */
const mockAutoTag = (imageUri) => {
  const categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
  const colors = ['black', 'white', 'blue', 'red', 'gray', 'navy'];
  const styles = ['casual', 'formal', 'sporty', 'elegant', 'vintage'];

  return {
    id: Date.now(),
    image: imageUri,
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: [
      colors[Math.floor(Math.random() * colors.length)],
      styles[Math.floor(Math.random() * styles.length)],
      'imported'
    ],
    name: 'New Item',
    confidence: 0.85 + Math.random() * 0.15, // 0.85-1.0
  };
};

/**
 * Mock function for outfit generation
 */
const mockGenerateOutfits = (selectedItems) => {
  return [
    {
      id: 1,
      items: selectedItems.slice(0, 3),
      name: 'Casual Day Out',
      occasion: 'Casual',
      season: 'Spring/Summer',
      weather: 'Sunny',
      vibe: 'Relaxed & Comfortable',
      confidence: 0.94,
    },
    {
      id: 2,
      items: selectedItems.slice(0, 2),
      name: 'Urban Minimal',
      occasion: 'Everyday',
      season: 'All Seasons',
      weather: 'Any',
      vibe: 'Clean & Modern',
      confidence: 0.88,
    },
    {
      id: 3,
      items: selectedItems,
      name: 'Street Ready',
      occasion: 'Weekend',
      season: 'Fall/Winter',
      weather: 'Cool',
      vibe: 'Edgy & Bold',
      confidence: 0.91,
    },
  ];
};
