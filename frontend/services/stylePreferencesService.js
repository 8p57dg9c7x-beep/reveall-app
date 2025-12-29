// Style Preferences Service
// Manages user's appearance preferences for improved recommendations
// Data stays on device, never shared

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@reveal_style_preferences';

// Get all preferences
export const getStylePreferences = async () => {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.log('Error loading style preferences:', error);
    return null;
  }
};

// Save preferences
export const saveStylePreferences = async (prefs) => {
  try {
    const data = {
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.log('Error saving style preferences:', error);
    return false;
  }
};

// Check if user has set preferences
export const hasStylePreferences = async () => {
  const prefs = await getStylePreferences();
  return prefs && (prefs.hair || prefs.eyes || prefs.skin);
};

// Clear preferences
export const clearStylePreferences = async () => {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
    return true;
  } catch (error) {
    console.log('Error clearing style preferences:', error);
    return false;
  }
};

export default {
  getStylePreferences,
  saveStylePreferences,
  hasStylePreferences,
  clearStylePreferences,
};
