import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { fetchRealWeather } from '../services/weatherService';
import { isFirstTimeUser, getClosetItemCount, ONBOARDING_CONFIG } from '../services/onboardingService';
import { logEvent } from '../services/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Home Screen - v1 Focused: Weather → AI Stylist → Wardrobe
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [closetCount, setClosetCount] = useState(0);
  const [stylistUnlocked, setStylistUnlocked] = useState(false);

  // Track app open
  useEffect(() => {
    logEvent('app_opened', { screen: 'home' });
  }, []);

  // Load real weather data and onboarding state
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load weather
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
        
        // Check onboarding state
        const firstTime = await isFirstTimeUser();
        setIsNewUser(firstTime);
        
        // Check closet count
        const count = await getClosetItemCount();
        setClosetCount(count);
        setStylistUnlocked(count >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh closet count when returning to home
  useEffect(() => {
    const refreshClosetCount = async () => {
      const count = await getClosetItemCount();
      setClosetCount(count);
      setStylistUnlocked(count >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS);
    };
    
    const interval = setInterval(refreshClosetCount, 2000);
    return () => clearInterval(interval);
  }, []);

  // Quick actions - v1 Core: 4 actions (NO Style Discovery)
  const quickActions = useMemo(() => [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist', color: '#B14CFF' },
    { id: 'body-scan', label: 'Body Scan', icon: 'human', route: '/bodyscanner', color: '#4ECDC4' },
    { id: 'wardrobe', label: 'My Closet', icon: 'hanger', route: '/aiwardrobe', color: '#FF6EC7' },
    { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/saved-outfits', color: '#FF4757' },
  ], []);

  // Render quick action button
  const renderQuickAction = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickAction}
      onPress={() => router.push({ pathname: action.route, params: { returnPath: '/' } })}
      activeOpacity={0.85}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}25` }]}>
        <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
      </View>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </TouchableOpacity>
  ), []);

  // Main content
  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + 16 }}>
      {/* Greeting */}
      {weather && (
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{weather.greeting.text}</Text>
          <Text style={styles.dateText}>{weather.dayOfWeek}, {weather.date}</Text>
        </View>
      )}

      {/* Weather Style Card - Main CTA to AI Stylist */}
      {weather && (
        <TouchableOpacity 
          style={styles.weatherCard}
          onPress={() => router.push({ pathname: '/aistylist', params: { returnPath: '/' } })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[weather.iconColor, `${weather.iconColor}90`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weatherGradient}
          >
            {/* Weather Info */}
            <View style={styles.weatherTop}>
              <View style={styles.weatherLeft}>
                <MaterialCommunityIcons name={weather.icon} size={48} color="#FFFFFF" />
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>{weather.tempDisplay || weather.tempF}</Text>
                  <Text style={styles.weatherLocation}>{weather.location}</Text>
                </View>
              </View>
              <Text style={styles.weatherCondition}>{weather.conditionLabel}</Text>
            </View>

            {/* Outfit Suggestion - Daily Hook */}
            <View style={styles.outfitSuggestion}>
              <Text style={styles.suggestionLabel}>Today's Best Look for You</Text>
              <Text style={styles.suggestionStyle}>{weather.outfitSuggestion.style}</Text>
              <View style={styles.suggestionItems}>
                {weather.outfitSuggestion.items.slice(0, 3).map((item, i) => (
                  <View key={i} style={styles.suggestionChip}>
                    <Text style={styles.suggestionChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA */}
            <View style={styles.weatherCTA}>
              <MaterialCommunityIcons name="robot" size={18} color="#FFFFFF" />
              <Text style={styles.weatherCTAText}>Style My Wardrobe</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Quick Actions - v1 Core: 4 Tools */}
      <View style={styles.quickActionsRow}>
        {quickActions.map(renderQuickAction)}
      </View>

      {/* Onboarding Progress Card - First-Time User Flow */}
      {!stylistUnlocked && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.onboardingCard}
            onPress={() => router.push({ pathname: '/aiwardrobe', params: { returnPath: '/' } })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['rgba(177, 76, 255, 0.15)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.onboardingGradient}
            >
              <View style={styles.onboardingHeader}>
                <MaterialCommunityIcons name="sparkles" size={24} color={COLORS.primary} />
                <Text style={styles.onboardingTitle}>Unlock AI Stylist</Text>
              </View>
              
              <Text style={styles.onboardingText}>
                Add {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more item{ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount !== 1 ? 's' : ''} to your closet to get personalized outfit recommendations
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(closetCount / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{closetCount}/{ONBOARDING_CONFIG.MIN_CLOSET_ITEMS}</Text>
              </View>
              
              <View style={styles.onboardingCTA}>
                <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.onboardingCTAText}>Add Your Clothes</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Wardrobe CTA Card - For returning users */}
      {stylistUnlocked && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.wardrobeCTA}
            onPress={() => router.push({ pathname: '/aiwardrobe', params: { returnPath: '/' } })}
            activeOpacity={0.85}
          >
            <View style={styles.wardrobeCTAContent}>
              <View style={styles.wardrobeCTAIcon}>
                <MaterialCommunityIcons name="wardrobe" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.wardrobeCTAText}>
                <Text style={styles.wardrobeCTATitle}>My Closet</Text>
                <Text style={styles.wardrobeCTASubtitle}>{closetCount} items • Ready for styling</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* How It Works Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How REVEAL Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: '#B14CFF25' }]}>
              <Text style={[styles.stepNumberText, { color: '#B14CFF' }]}>1</Text>
            </View>
            <Text style={styles.stepText}>Add your clothes to My Closet</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: '#4ECDC425' }]}>
              <Text style={[styles.stepNumberText, { color: '#4ECDC4' }]}>2</Text>
            </View>
            <Text style={styles.stepText}>We check today's weather for you</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: '#FF6EC725' }]}>
              <Text style={[styles.stepNumberText, { color: '#FF6EC7' }]}>3</Text>
            </View>
            <Text style={styles.stepText}>Get AI-styled outfits from YOUR wardrobe</Text>
          </View>
        </View>
      </View>
    </View>
  ), [insets.top, weather, quickActions, renderQuickAction]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.bottomPadding,
  },
  // Greeting
  greetingSection: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  // Weather Card
  weatherCard: {
    marginHorizontal: SPACING.screenHorizontal,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...CARD_SHADOW,
  },
  weatherGradient: {
    padding: 20,
  },
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherInfo: {
    marginLeft: 12,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  weatherLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherCondition: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  outfitSuggestion: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestionStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  suggestionItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weatherCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  weatherCTAText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 28,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 14,
  },
  // Wardrobe CTA
  wardrobeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.screenHorizontal,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    ...CARD_SHADOW,
  },
  wardrobeCTAContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wardrobeCTAIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  wardrobeCTAText: {
    flex: 1,
  },
  wardrobeCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  wardrobeCTASubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Steps
  stepsContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
});
