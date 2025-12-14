// REVEAL v1 Feature Flags
// Strategic scope control for launch — all features preserved, visibility controlled
// To re-enable any feature, simply set the flag to true

export const FEATURE_FLAGS = {
  // ===== v1 CORE FEATURES (ACTIVE) =====
  AI_STYLIST: true,
  SHOP_THE_LOOK: true,
  WEATHER_OUTFITS: true,
  STYLE_DISCOVERY: true,
  BODY_SCANNER: true,
  BEAUTY_HUB: true,  // Keep for affiliate shopping flow
  AI_WARDROBE: true,
  
  // ===== HIDDEN FOR v1 (Infrastructure preserved) =====
  MUSIC_SCAN: false,
  TRENDING_SONGS: false,
  FITNESS_TAB: false,
  ADDILETS: false,
  STYLE_DNA: false,
  
  // ===== TAB VISIBILITY =====
  TABS: {
    HOME: true,
    DISCOVER: true,
    STYLE_LAB: true,
    FITNESS: false,  // Hidden for v1
    PROFILE: true,
  },
  
  // ===== DISCOVER SECTIONS =====
  DISCOVER_SECTIONS: {
    STYLE: true,
    BEAUTY: true,
    MUSIC: false,  // Hidden for v1
  },
  
  // ===== STYLE LAB TOOLS =====
  STYLE_LAB_TOOLS: {
    AI_STYLIST: true,
    BODY_SCANNER: true,
    AI_WARDROBE: true,
    ADDILETS: false,  // Hidden for v1
  },
  
  // ===== HOME SECTIONS =====
  HOME_SECTIONS: {
    WEATHER_OUTFITS: true,
    STYLE_DNA_CARD: false,  // Hidden for v1
    QUICK_ACTIONS: true,
    FOR_YOU: true,
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
  scope: 'v1 Launch - Style + Shopping Core',
  launchDate: null,
};

export default FEATURE_FLAGS;
