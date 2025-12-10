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
    shadowOpacity: 0.3,
    shadowRadius: 12,
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

export const SIZES = {
  // Rounded corners
  borderRadiusCard: 14,  // Cards
  borderRadiusPill: 28,  // Pills/Chips
  borderRadiusButton: 14,  // Buttons
  borderRadiusInput: 12,  // Input fields
  
  // Legacy support
  borderRadius: 14,
  spacing: 20,
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
