// Onboarding Service - First-Time User Experience
// Tracks user progress and manages onboarding state

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@reveal_onboarding';
const MIN_CLOSET_ITEMS = 3;

// Default onboarding state
const DEFAULT_STATE = {
  hasCompletedOnboarding: false,
  hasSeenWelcome: false,
  closetItemsAdded: 0,
  firstOutfitGenerated: false,
  onboardingStartedAt: null,
  onboardingCompletedAt: null,
};

// Get onboarding state
export const getOnboardingState = async () => {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
    return DEFAULT_STATE;
  } catch (error) {
    console.log('Error loading onboarding state:', error);
    return DEFAULT_STATE;
  }
};

// Save onboarding state
export const saveOnboardingState = async (state) => {
  try {
    const current = await getOnboardingState();
    const updated = { ...current, ...state };
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log('Error saving onboarding state:', error);
    return state;
  }
};

// Check if user is first-time (hasn't completed onboarding)
export const isFirstTimeUser = async () => {
  const state = await getOnboardingState();
  return !state.hasCompletedOnboarding;
};

// Check if AI Stylist should be unlocked
export const isAIStylistUnlocked = async () => {
  try {
    const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
    if (wardrobeJson) {
      const items = JSON.parse(wardrobeJson);
      return items.length >= MIN_CLOSET_ITEMS;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Get current closet count
export const getClosetItemCount = async () => {
  try {
    const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
    if (wardrobeJson) {
      const items = JSON.parse(wardrobeJson);
      return items.length;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

// Mark welcome as seen
export const markWelcomeSeen = async () => {
  return saveOnboardingState({ 
    hasSeenWelcome: true,
    onboardingStartedAt: new Date().toISOString(),
  });
};

// Mark onboarding as complete
export const completeOnboarding = async () => {
  return saveOnboardingState({ 
    hasCompletedOnboarding: true,
    onboardingCompletedAt: new Date().toISOString(),
  });
};

// Update closet items count
export const updateClosetProgress = async (count) => {
  const state = await saveOnboardingState({ closetItemsAdded: count });
  
  // Auto-complete onboarding if threshold reached
  if (count >= MIN_CLOSET_ITEMS && !state.hasCompletedOnboarding) {
    await completeOnboarding();
  }
  
  return state;
};

// Mark first outfit generated
export const markFirstOutfitGenerated = async () => {
  return saveOnboardingState({ firstOutfitGenerated: true });
};

// Get progress percentage (0-100)
export const getOnboardingProgress = async () => {
  const count = await getClosetItemCount();
  return Math.min(100, Math.round((count / MIN_CLOSET_ITEMS) * 100));
};

// Constants
export const ONBOARDING_CONFIG = {
  MIN_CLOSET_ITEMS,
  TARGET_TIME_SECONDS: 60, // Goal: value in under 60 seconds
};

export default {
  getOnboardingState,
  saveOnboardingState,
  isFirstTimeUser,
  isAIStylistUnlocked,
  getClosetItemCount,
  markWelcomeSeen,
  completeOnboarding,
  updateClosetProgress,
  markFirstOutfitGenerated,
  getOnboardingProgress,
  ONBOARDING_CONFIG,
};
