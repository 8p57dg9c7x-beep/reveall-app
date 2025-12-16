// REVEAL v1 Feature Flags
// LOCKED v1 SCOPE — Hyper-focused on "What should I wear today?"
// Core: Weather outfits, AI Stylist, Body Scan, My Closet, Favorites

export const FEATURE_FLAGS = {
  // ===== v1 CORE FEATURES (ACTIVE) =====
  AI_STYLIST: true,          // Core - AI styling
  WEATHER_OUTFITS: true,     // Core - Weather-based recommendations
  AI_WARDROBE: true,         // Core - User's closet management
  BODY_SCANNER: true,        // Core - Body measurements
  FAVORITES: true,           // Core - Saved outfits
  
  // ===== HIDDEN FOR v1 (Post-launch features) =====
  STYLE_DISCOVERY: false,    // v2 - Browse outfit inspiration
  SHOP_THE_LOOK: false,      // v2 - Affiliate shopping flow
  BEAUTY_HUB: false,         // v2 - Makeup & beauty looks
  MUSIC_SCAN: false,         // v3 - Music discovery
  TRENDING_SONGS: false,     // v3 - Music charts
  FITNESS_TAB: false,        // v3 - Fitness tracking
  ADDILETS: false,           // v2 - AI personalization engine
  STYLE_DNA: false,          // v2 - Style profile
  CELEBRITY_LOOKS: false,    // v2 - Celebrity style matching
  
  // ===== TAB VISIBILITY =====
  TABS: {
    HOME: true,
    DISCOVER: false,         // Hidden for v1
    STYLE_LAB: true,
    FITNESS: false,
    PROFILE: true,
  },
  
  // ===== HOME SECTIONS =====
  HOME_SECTIONS: {
    WEATHER_OUTFITS: true,
    QUICK_ACTIONS: true,
    FOR_YOU: true,
    STYLE_DNA_CARD: false,
    SHOP_CTA: false,
  },
  
  // ===== STYLE LAB TOOLS =====
  STYLE_LAB_TOOLS: {
    AI_STYLIST: true,
    BODY_SCANNER: true,
    AI_WARDROBE: true,
    ADDILETS: false,
  },
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (featureName) => {
  return FEATURE_FLAGS[featureName] === true;
};

// Helper to check nested feature flags
export const isSectionEnabled = (category, section) => {
  return FEATURE_FLAGS[category]?.[section] === true;
};

// Version info
export const APP_VERSION = {
  version: '1.0.0',
  codename: 'Focus',
  scope: 'v1 Launch — What Should I Wear Today?',
  launchDate: null,
};

export default FEATURE_FLAGS;
