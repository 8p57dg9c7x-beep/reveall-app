// REVEAL - Investor-Ready Purple Luxury Theme
export const COLORS = {
  // Background colors - Deep Space Gradient
  background: '#0B0812',
  backgroundGradientStart: '#0B0812',
  backgroundGradientEnd: '#190822',
  
  // Primary brand colors - Accent Gradient
  primary: '#B14CFF',  // Purple
  primaryGradientStart: '#B14CFF',
  primaryGradientEnd: '#FF4F81',  // Pink
  
  // Chips/Pills Gradient
  chipGradientStart: '#A259FF',
  chipGradientEnd: '#6A00FF',
  
  // Text colors - Professional Hierarchy
  textPrimary: '#FFFFFF',  // Headline
  textSecondary: '#DAD7DE',  // Body
  textMuted: '#A9A0B0',  // Muted/Secondary
  text: '#FFFFFF',  // Alias
  textTertiary: '#8B7FA3',  // Extra muted
  
  // Card and surface colors
  card: '#1A0F24',  // Slightly lighter than background for depth
  cardHover: '#221831',
  cardLight: '#2D1F3D',
  surface: '#1A0F24',
  
  // Accent colors (keeping some originals for compatibility)
  accent: '#B14CFF',
  accentLight: '#D17BFF',
  accentDark: '#8A2FE6',
  
  // Secondary colors
  secondary: '#FF4F81',  // Pink accent
  secondaryLight: '#FF7BA0',
  secondaryDark: '#E6366C',
  
  // Surface and functional colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // UI element colors
  border: '#FFFFFF',
  borderLight: '#3D2850',
  divider: '#2A1838',
  overlay: 'rgba(11, 8, 18, 0.85)',
  
  // Tab bar - Premium Purple
  tabBarBackground: '#0B0812',
  tabBarActive: '#B14CFF',
  tabBarInactive: '#A9A0B0',
  
  // Legacy support (for components not yet updated)
  primaryDark: '#8A2FE6',
  primaryLight: '#D17BFF',
};

export const GRADIENTS = {
  // Primary accent gradient (buttons, active tabs)
  accent: ['#B14CFF', '#FF4F81'],
  accentReverse: ['#FF4F81', '#B14CFF'],
  
  // Chips/Pills gradient
  chip: ['#A259FF', '#6A00FF'],
  chipReverse: ['#6A00FF', '#A259FF'],
  
  // Background gradient
  background: ['#0B0812', '#190822'],
  backgroundReverse: ['#190822', '#0B0812'],
  
  // Card subtle gradient
  card: ['#1A0F24', '#221831'],
};

export const SHADOWS = {
  button: {
    shadowColor: '#B14CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHover: {
    shadowColor: '#B14CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

// 🎯 PREMIUM CARD SHADOW - Calibrated for real devices
export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};

export const SIZES = {
  // Rounded corners
  borderRadiusCard: 16,  // Cards - Premium rounded
  borderRadiusPill: 28,  // Pills/Chips
  borderRadiusButton: 14,  // Buttons
  borderRadiusInput: 12,  // Input fields
  cardRadius: 16,        // Alias for card radius (BRICK 6)
  
  // Legacy support
  borderRadius: 16,
  spacing: 20,
};

// 🎯 GLOBAL SPACING SYSTEM - APP STORE READY
export const SPACING = {
  // Screen safe area additions
  topPadding: 16,             // Standard header top padding (after insets.top)
  bottomPadding: 140,         // Tab bar clearance (MANDATORY on all scrollable screens)
  
  // Horizontal padding
  screenHorizontal: 20,       // Standard screen horizontal padding
  
  // Header spacing
  headerPaddingTop: 16,       // Header top padding (use with insets.top)
  headerPaddingBottom: 20,    // Header bottom padding
  
  // Section spacing (vertical gaps)
  sectionGap: 32,             // Gap between major sections
  sectionTitleTop: 24,        // Space above section titles
  sectionTitleBottom: 12,     // Space below section titles
  
  // Title hierarchy
  titleToSubtitle: 6,         // Title → Subtitle gap
  subtitleToChips: 20,        // Subtitle → Chips gap
  chipsToContent: 20,         // Chips → Content grid gap
  chipRowGap: 12,             // Gap between chip rows
  sectionTitleToContent: 14,  // Section title → Content gap
  
  // Card and item spacing
  cardGap: 16,                // Vertical gap between cards
  cardHorizontalGap: 12,      // Horizontal gap between cards
  cardPadding: 16,            // Internal card padding
  chipGap: 10,                // Gap between chips
  itemGap: 12,                // Gap between list items
  
  // Content padding
  contentPaddingTop: 24,      // Top padding inside content areas
  contentPaddingBottom: 24,   // Bottom padding inside content areas
  
  // Button spacing
  buttonMarginTop: 24,        // Top margin for CTA buttons
  buttonPaddingVertical: 16,  // Vertical padding inside buttons
  buttonPaddingHorizontal: 24, // Horizontal padding inside buttons
};

// 🎯 TEXT HIERARCHY - APP STORE READY
export const TEXT_STYLES = {
  // Page titles
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Body text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#DAD7DE',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: '#DAD7DE',
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: '#A9A0B0',
  },
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A9A0B0',
  },
  // Buttons
  buttonLarge: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
};

// 🎯 BUTTON SIZES - 44px minimum touch targets
export const BUTTON_SIZES = {
  large: {
    height: 56,
    paddingHorizontal: 28,
    borderRadius: 16,
    fontSize: 17,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    fontSize: 15,
  },
  small: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 14,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
};

export const TYPOGRAPHY = {
  // Font families (Inter/Manrope fallback to system)
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Animation constants for consistent micro-animations
export const ANIMATIONS = {
  // Duration in milliseconds
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Scale values for press animations
  scale: {
    pressed: 0.96,
    normal: 1,
    hover: 1.02,
  },
  
  // Opacity values
  opacity: {
    pressed: 0.7,
    disabled: 0.5,
    normal: 1,
  },
  
  // Spring configurations for native feel
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

// Icon styling
export const ICONS = {
  strokeWidth: 2,  // 2px white stroke
  activeColor: '#B14CFF',  // Purple when active
  inactiveColor: '#FFFFFF',  // White when inactive
  size: {
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
  },
};
