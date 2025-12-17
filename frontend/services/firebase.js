// Firebase Configuration for REVEAL
// This initializes Firebase for analytics and future features

import { Platform } from 'react-native';

// Firebase Web Config (for Expo Web)
export const firebaseConfig = {
  apiKey: "AIzaSyA-RS7Wx4cgH98XqFQ9XyDgvhPRxtMVbps",
  authDomain: "reveal-fc379.firebaseapp.com",
  projectId: "reveal-fc379",
  storageBucket: "reveal-fc379.firebasestorage.app",
  messagingSenderId: "76345979004",
  appId: "1:76345979004:ios:85610efaccba5e1fda59f9",
};

// Initialize Firebase based on platform
let firebaseApp = null;
let analytics = null;

export const initializeFirebase = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web initialization using firebase/app
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      
      if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
        
        // Only initialize analytics if supported
        const analyticsSupported = await isSupported();
        if (analyticsSupported) {
          analytics = getAnalytics(firebaseApp);
          console.log('✅ Firebase Analytics initialized (Web)');
        }
      }
    } else {
      // Native initialization using @react-native-firebase
      // Firebase auto-initializes on native from GoogleService-Info.plist
      console.log('✅ Firebase initialized (Native - auto from plist)');
    }
    
    return true;
  } catch (error) {
    console.warn('Firebase initialization warning:', error.message);
    return false;
  }
};

// Analytics helper functions
export const logEvent = async (eventName, params = {}) => {
  try {
    if (Platform.OS === 'web' && analytics) {
      const { logEvent: webLogEvent } = await import('firebase/analytics');
      webLogEvent(analytics, eventName, params);
    } else if (Platform.OS !== 'web') {
      // Native analytics
      const firebaseAnalytics = await import('@react-native-firebase/analytics');
      await firebaseAnalytics.default().logEvent(eventName, params);
    }
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.warn('Analytics event failed:', error.message);
  }
};

// Track screen views
export const logScreenView = async (screenName, screenClass) => {
  try {
    await logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.warn('Screen view tracking failed:', error.message);
  }
};

// Track user actions
export const logUserAction = async (action, category, label, value) => {
  try {
    await logEvent('user_action', {
      action,
      category,
      label,
      value,
    });
  } catch (error) {
    console.warn('User action tracking failed:', error.message);
  }
};

// ===== REVEAL v1 Analytics Events =====

// Track app opened
export const trackAppOpened = () => logEvent('app_opened', { timestamp: new Date().toISOString() });

// Track onboarding completion
export const trackOnboardingComplete = (timeSpentSeconds) => 
  logEvent('onboarding_complete', { time_spent_seconds: timeSpentSeconds });

// Track closet item added
export const trackClosetItemAdded = (category, method = 'manual') => 
  logEvent('closet_item_added', { category, method });

// Track outfit generated
export const trackOutfitGenerated = (occasion, itemCount) => 
  logEvent('outfit_generated', { occasion, item_count: itemCount });

// Track outfit saved
export const trackOutfitSaved = (outfitId) => 
  logEvent('outfit_saved', { outfit_id: outfitId?.toString() });

// Track outfit liked
export const trackOutfitLiked = (outfitId) => 
  logEvent('outfit_liked', { outfit_id: outfitId?.toString() });

// Track outfit disliked
export const trackOutfitDisliked = (outfitId, reason) => 
  logEvent('outfit_disliked', { outfit_id: outfitId?.toString(), reason });

// Track body scan completed
export const trackBodyScanComplete = () => logEvent('body_scan_complete');

// Track AI Stylist unlocked (reached 3 items)
export const trackStylistUnlocked = () => logEvent('stylist_unlocked');

export default {
  initializeFirebase,
  logEvent,
  logScreenView,
  logUserAction,
  firebaseConfig,
  // v1 Analytics
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
