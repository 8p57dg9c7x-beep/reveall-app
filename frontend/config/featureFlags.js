// REVEAL v1 Feature Flags
// LOCKED v1 SCOPE — Focused on "What to Wear Today"
// Core: Weather outfits, AI Stylist, Wardrobe, Style Discovery, Favorites

export const FEATURE_FLAGS = {
  // ===== v1 CORE FEATURES (ACTIVE) =====
  AI_STYLIST: true,          // Core - AI styling with user wardrobe
  WEATHER_OUTFITS: true,     // Core - Weather-based recommendations
  STYLE_DISCOVERY: true,     // Core - Browse outfit inspiration
  AI_WARDROBE: true,         // Core - User's closet management
  BODY_SCANNER: true,        // Core - Body measurements
  
  // ===== HIDDEN FOR v1 (Post-launch features) =====
  SHOP_THE_LOOK: false,      // v2 - Affiliate shopping flow
  BEAUTY_HUB: false,         // v2 - Makeup & beauty looks
  MUSIC_SCAN: false,         // v3 - Music discovery
  TRENDING_SONGS: false,     // v3 - Music charts
  FITNESS_TAB: false,        // v3 - Fitness tracking
  ADDILETS: false,           // v2 - AI personalization engine
  STYLE_DNA: false,          // v2 - Style profile
  
  // ===== TAB VISIBILITY =====
  TABS: {
    HOME: true,
    DISCOVER: true,
    STYLE_LAB: true,
    FITNESS: false,
    PROFILE: true,
  },
  
  // ===== DISCOVER SECTIONS =====
  DISCOVER_SECTIONS: {
    STYLE: true,       // Style Discovery only
    BEAUTY: false,     // Hidden for v1
    MUSIC: false,      // Hidden for v1
  },
  
  // ===== STYLE LAB TOOLS =====
  STYLE_LAB_TOOLS: {
    AI_STYLIST: true,
    BODY_SCANNER: true,
    AI_WARDROBE: true,
    ADDILETS: false,
  },
  
  // ===== HOME SECTIONS =====
  HOME_SECTIONS: {
    WEATHER_OUTFITS: true,
    STYLE_DNA_CARD: false,
    QUICK_ACTIONS: true,
    FOR_YOU: true,
    SHOP_CTA: false,    // Hidden for v1
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
  scope: 'v1 Launch — What to Wear Today',
  launchDate: null,
};

export default FEATURE_FLAGS;
