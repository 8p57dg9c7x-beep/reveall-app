// REVEAL Ad Service
// v1 Monetization: One interstitial ad per day, shown on AI Stylist entry
// Uses Google AdMob with test IDs for development

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const LAST_AD_SHOWN_KEY = '@reveal_last_ad_shown_at';
const IS_PRO_USER_KEY = '@reveal_is_pro_user';

// Test Ad Unit IDs (Google's official test IDs)
// Replace with real IDs from AdMob dashboard for production
export const AD_UNIT_IDS = {
  // Interstitial test IDs
  INTERSTITIAL: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  // Rewarded test IDs (for future use)
  REWARDED: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};

// 24 hours in milliseconds
const AD_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Check if user is a Pro subscriber (no ads)
 */
export const isProUser = async () => {
  try {
    const isPro = await AsyncStorage.getItem(IS_PRO_USER_KEY);
    return isPro === 'true';
  } catch (error) {
    console.log('Error checking pro status:', error);
    return false;
  }
};

/**
 * Set Pro user status (for future in-app purchase)
 */
export const setProUser = async (isPro) => {
  try {
    await AsyncStorage.setItem(IS_PRO_USER_KEY, isPro ? 'true' : 'false');
  } catch (error) {
    console.log('Error setting pro status:', error);
  }
};

/**
 * Get the timestamp of when ad was last shown
 */
export const getLastAdShownAt = async () => {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_AD_SHOWN_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.log('Error getting last ad timestamp:', error);
    return null;
  }
};

/**
 * Record that an ad was just shown
 */
export const recordAdShown = async () => {
  try {
    const now = Date.now();
    await AsyncStorage.setItem(LAST_AD_SHOWN_KEY, now.toString());
    console.log('📺 Ad shown recorded at:', new Date(now).toISOString());
    return true;
  } catch (error) {
    console.log('Error recording ad shown:', error);
    return false;
  }
};

/**
 * Check if we should show an ad (once per 24 hours, not for Pro users)
 */
export const shouldShowAd = async () => {
  try {
    // Pro users never see ads
    const isPro = await isProUser();
    if (isPro) {
      console.log('📺 Pro user - skipping ad');
      return false;
    }

    // Check cooldown
    const lastShown = await getLastAdShownAt();
    const now = Date.now();

    // First time ever - show ad
    if (!lastShown) {
      console.log('📺 First time user - will show ad');
      return true;
    }

    // Check if 24 hours have passed
    const timeSinceLastAd = now - lastShown;
    const shouldShow = timeSinceLastAd >= AD_COOLDOWN_MS;

    if (shouldShow) {
      console.log('📺 24h passed - will show ad');
    } else {
      const hoursRemaining = Math.ceil((AD_COOLDOWN_MS - timeSinceLastAd) / (60 * 60 * 1000));
      console.log(`📺 Cooldown active - ${hoursRemaining}h remaining`);
    }

    return shouldShow;
  } catch (error) {
    console.log('Error checking ad eligibility:', error);
    return false; // Don't show ad on error
  }
};

/**
 * Reset ad cooldown (for testing purposes only)
 */
export const resetAdCooldown = async () => {
  try {
    await AsyncStorage.removeItem(LAST_AD_SHOWN_KEY);
    console.log('📺 Ad cooldown reset');
    return true;
  } catch (error) {
    console.log('Error resetting ad cooldown:', error);
    return false;
  }
};

/**
 * Get time remaining until next ad (in hours)
 */
export const getTimeUntilNextAd = async () => {
  try {
    const lastShown = await getLastAdShownAt();
    if (!lastShown) return 0;

    const now = Date.now();
    const timeSinceLastAd = now - lastShown;
    const timeRemaining = AD_COOLDOWN_MS - timeSinceLastAd;

    if (timeRemaining <= 0) return 0;

    return Math.ceil(timeRemaining / (60 * 60 * 1000)); // Hours
  } catch (error) {
    return 0;
  }
};

export default {
  AD_UNIT_IDS,
  isProUser,
  setProUser,
  shouldShowAd,
  recordAdShown,
  getLastAdShownAt,
  resetAdCooldown,
  getTimeUntilNextAd,
};
