// Feedback Service - Outfit Feedback System
// Stores user feedback on outfit recommendations for future personalization

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from './firebase';

const FEEDBACK_KEY = '@reveal_outfit_feedback';

// Dislike reasons
export const DISLIKE_REASONS = [
  { id: 'fit', label: 'Fit', icon: 'resize' },
  { id: 'color', label: 'Color', icon: 'palette' },
  { id: 'weather', label: 'Weather', icon: 'weather-cloudy' },
  { id: 'vibe', label: 'Vibe', icon: 'emoticon-neutral' },
];

// Get all feedback
export const getAllFeedback = async () => {
  try {
    const stored = await AsyncStorage.getItem(FEEDBACK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.log('Error loading feedback:', error);
    return [];
  }
};

// Save feedback for an outfit
export const saveFeedback = async (outfitId, type, reason = null) => {
  try {
    const feedback = await getAllFeedback();
    
    const newFeedback = {
      id: Date.now().toString(),
      outfitId,
      type, // 'like' or 'dislike'
      reason, // Only for dislikes
      timestamp: new Date().toISOString(),
    };
    
    // Remove any existing feedback for this outfit
    const filtered = feedback.filter(f => f.outfitId !== outfitId);
    filtered.push(newFeedback);
    
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(filtered));
    
    // Track analytics
    if (type === 'like') {
      logEvent('outfit_liked', { outfit_id: outfitId.toString() });
    } else {
      logEvent('outfit_disliked', { 
        outfit_id: outfitId.toString(),
        reason: reason || 'unspecified'
      });
    }
    
    return newFeedback;
  } catch (error) {
    console.log('Error saving feedback:', error);
    return null;
  }
};

// Like an outfit
export const likeOutfit = async (outfitId) => {
  return saveFeedback(outfitId, 'like');
};

// Dislike an outfit with reason
export const dislikeOutfit = async (outfitId, reason = null) => {
  return saveFeedback(outfitId, 'dislike', reason);
};

// Check if outfit has feedback
export const getOutfitFeedback = async (outfitId) => {
  const feedback = await getAllFeedback();
  return feedback.find(f => f.outfitId === outfitId) || null;
};

// Get feedback stats
export const getFeedbackStats = async () => {
  const feedback = await getAllFeedback();
  const likes = feedback.filter(f => f.type === 'like').length;
  const dislikes = feedback.filter(f => f.type === 'dislike').length;
  
  const reasonCounts = {};
  feedback
    .filter(f => f.type === 'dislike' && f.reason)
    .forEach(f => {
      reasonCounts[f.reason] = (reasonCounts[f.reason] || 0) + 1;
    });
  
  return {
    total: feedback.length,
    likes,
    dislikes,
    reasonCounts,
    likeRate: feedback.length > 0 ? Math.round((likes / feedback.length) * 100) : 0,
  };
};

export default {
  DISLIKE_REASONS,
  getAllFeedback,
  saveFeedback,
  likeOutfit,
  dislikeOutfit,
  getOutfitFeedback,
  getFeedbackStats,
};
