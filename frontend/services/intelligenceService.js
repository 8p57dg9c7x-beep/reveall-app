// Intelligence Service - Quiet Memory & Learning
// Manages soft signals that the app is learning about user's style
// DESIGN: Text-only, subtle, no badges/scores/percentages

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFeedbackStats } from './feedbackService';
import { getStylePreferences } from './stylePreferencesService';

const INTELLIGENCE_KEY = '@reveal_intelligence';

// Store intelligence state
const getIntelligenceState = async () => {
  try {
    const stored = await AsyncStorage.getItem(INTELLIGENCE_KEY);
    return stored ? JSON.parse(stored) : { messagesShown: [], lastShown: null };
  } catch (error) {
    return { messagesShown: [], lastShown: null };
  }
};

const saveIntelligenceState = async (state) => {
  try {
    await AsyncStorage.setItem(INTELLIGENCE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('Error saving intelligence state:', error);
  }
};

// Get a gentle, contextual intelligence message
// Returns null if no message should be shown (rate limited)
export const getIntelligenceMessage = async () => {
  try {
    const state = await getIntelligenceState();
    const now = new Date();
    
    // Rate limit: Don't show messages more than once per session
    // (24 hours between showing same category of message)
    if (state.lastShown) {
      const lastShown = new Date(state.lastShown);
      const hoursSinceLastShown = (now - lastShown) / (1000 * 60 * 60);
      if (hoursSinceLastShown < 2) {
        return null; // Don't show message too frequently
      }
    }

    // Get user data to determine what message to show
    const feedbackStats = await getFeedbackStats();
    const prefs = await getStylePreferences();
    
    let message = null;
    let messageId = null;

    // Priority 1: After first feedback
    if (feedbackStats.total === 1 && !state.messagesShown.includes('first_feedback')) {
      message = "Noted. I will remember that.";
      messageId = 'first_feedback';
    }
    // Priority 2: After several feedbacks
    else if (feedbackStats.total >= 3 && feedbackStats.total <= 5 && !state.messagesShown.includes('learning')) {
      message = "I'm starting to understand your style...";
      messageId = 'learning';
    }
    // Priority 3: After setting preferences
    else if (prefs && !state.messagesShown.includes('preferences_set')) {
      message = "Your preferences will guide my suggestions.";
      messageId = 'preferences_set';
    }
    // Priority 4: After many interactions
    else if (feedbackStats.total >= 8 && !state.messagesShown.includes('knowing_style')) {
      message = "Your style is becoming clearer to me.";
      messageId = 'knowing_style';
    }

    // Save that we showed a message
    if (message && messageId) {
      await saveIntelligenceState({
        messagesShown: [...state.messagesShown, messageId],
        lastShown: now.toISOString(),
      });
    }

    return message;
  } catch (error) {
    console.log('Error getting intelligence message:', error);
    return null;
  }
};

// Get immediate acknowledgment after feedback action
// These are shown right away, not rate-limited
export const getFeedbackAcknowledgment = async (type) => {
  if (type === 'like') {
    return "Noted. I will keep this in mind.";
  } else if (type === 'dislike') {
    return "Got it. I will adjust my suggestions.";
  }
  return null;
};

// Reset intelligence state (for testing/debugging)
export const resetIntelligenceState = async () => {
  try {
    await AsyncStorage.removeItem(INTELLIGENCE_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  getIntelligenceMessage,
  getFeedbackAcknowledgment,
  resetIntelligenceState,
};
