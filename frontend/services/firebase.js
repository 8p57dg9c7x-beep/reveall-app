// Firebase Analytics Stub for REVEAL V1
// Analytics temporarily disabled for clean native builds
// Will be re-enabled in V1.1 with proper native Firebase setup

import { Platform } from 'react-native';

// Firebase config (preserved for future use)
export const firebaseConfig = {
  apiKey: "AIzaSyA-RS7Wx4cgH98XqFQ9XyDgvhPRxtMVbps",
  authDomain: "reveal-fc379.firebaseapp.com",
  projectId: "reveal-fc379",
  storageBucket: "reveal-fc379.firebasestorage.app",
  messagingSenderId: "76345979004",
  appId: "1:76345979004:ios:85610efaccba5e1fda59f9",
};

// Stub initialization - no-op for V1
export const initializeFirebase = async () => {
  console.log('📊 Analytics disabled for V1 (will be enabled in V1.1)');
  return true;
};

// Stub logEvent - logs to console in dev
export const logEvent = async (eventName, params = {}) => {
  if (__DEV__) {
    console.log(`📊 [Analytics Stub] ${eventName}:`, params);
  }
};

// Track screen views
export const logScreenView = async (screenName, screenClass) => {
  if (__DEV__) {
    console.log(`📊 [Screen View] ${screenName}`);
  }
};

// Track user actions
export const logUserAction = async (action, category, label, value) => {
  if (__DEV__) {
    console.log(`📊 [User Action] ${action} - ${category}`);
  }
};

// ===== REVEAL v1 Analytics Events (stubs) =====
export const trackAppOpened = () => logEvent('app_opened');
export const trackOnboardingComplete = (timeSpentSeconds) => logEvent('onboarding_complete', { timeSpentSeconds });
export const trackClosetItemAdded = (category, method = 'manual') => logEvent('closet_item_added', { category, method });
export const trackOutfitGenerated = (occasion, itemCount) => logEvent('outfit_generated', { occasion, itemCount });
export const trackOutfitSaved = (outfitId) => logEvent('outfit_saved', { outfitId });
export const trackOutfitLiked = (outfitId) => logEvent('outfit_liked', { outfitId });
export const trackOutfitDisliked = (outfitId, reason) => logEvent('outfit_disliked', { outfitId, reason });
export const trackBodyScanComplete = () => logEvent('body_scan_complete');
export const trackStylistUnlocked = () => logEvent('stylist_unlocked');

export default {
  initializeFirebase,
  logEvent,
  logScreenView,
  logUserAction,
  firebaseConfig,
  trackAppOpened,
  trackOnboardingComplete,
  trackClosetItemAdded,
  trackOutfitGenerated,
  trackOutfitSaved,
  trackOutfitLiked,
  trackOutfitDisliked,
  trackBodyScanComplete,
  trackStylistUnlocked,
};
