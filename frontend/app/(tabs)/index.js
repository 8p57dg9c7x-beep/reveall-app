import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING } from '../../constants/theme';
import { fetchRealWeather } from '../../services/weatherService';
import { ONBOARDING_CONFIG } from '../../services/onboardingService';
import { useHelpMeDecide } from '../_layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// TODAY SCREEN
// A calm, intentional landing moment.
// One hero. One action. Space to breathe.
// ═══════════════════════════════════════════════════════════════

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const { openHelpMeDecide } = useHelpMeDecide();

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      const refresh = async () => {
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          setClosetCount(JSON.parse(wardrobeJson).length);
        }
      };
      refresh();
    }, [])
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
        
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          setClosetCount(JSON.parse(wardrobeJson).length);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const canStyle = closetCount >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;
  const hasItems = closetCount > 0;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.content, 
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* ─────────────────────────────────────────────────────── */}
        {/* HERO SECTION - The emotional anchor                     */}
        {/* ─────────────────────────────────────────────────────── */}
        
        <View style={styles.hero}>
          {/* Greeting - Large, confident */}
          <Text style={styles.greeting}>
            {weather?.greeting?.text || 'Good day'}
          </Text>
          
          {/* Weather context - Subtle, secondary */}
          {weather && (
            <View style={styles.weatherContext}>
              <MaterialCommunityIcons 
                name={weather.icon} 
                size={18} 
                color={COLORS.textMuted} 
              />
              <Text style={styles.weatherText}>{weather.tempDisplay}</Text>
            </View>
          )}
        </View>

        {/* ─────────────────────────────────────────────────────── */}
        {/* PRIMARY ACTION - The ONE thing to do                    */}
        {/* ─────────────────────────────────────────────────────── */}
        
        {canStyle ? (
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={() => { triggerHaptic(); openHelpMeDecide(); }}
            activeOpacity={0.92}
          >
            <Text style={styles.primaryQuestion}>
              What should I wear?
            </Text>
            <View style={styles.primaryArrow}>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : hasItems ? (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Building your wardrobe</Text>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(closetCount / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressHint}>
              {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more to unlock suggestions
            </Text>
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyMessage}>Your wardrobe awaits</Text>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* SECONDARY - Quiet access to closet                      */}
        {/* ─────────────────────────────────────────────────────── */}
        
        <View style={styles.secondary}>
          <TouchableOpacity 
            style={styles.closetAccess}
            onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
            activeOpacity={0.7}
          >
            <Text style={styles.closetLabel}>My Closet</Text>
            {hasItems && (
              <Text style={styles.closetCount}>{closetCount}</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES - Calm, spacious, intentional
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  
  // ─────────────────────────────────────────────────────────────
  // HERO - The emotional landing moment
  // ─────────────────────────────────────────────────────────────
  hero: {
    marginBottom: 64,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    lineHeight: 44,
  },
  weatherContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  weatherText: {
    fontSize: 15,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  
  // ─────────────────────────────────────────────────────────────
  // PRIMARY ACTION - Single, clear purpose
  // ─────────────────────────────────────────────────────────────
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginBottom: 48,
  },
  primaryQuestion: {
    fontSize: 19,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  primaryArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ─────────────────────────────────────────────────────────────
  // PROGRESS - When building wardrobe
  // ─────────────────────────────────────────────────────────────
  progressSection: {
    marginBottom: 48,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressHint: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  
  // ─────────────────────────────────────────────────────────────
  // EMPTY - Inviting, not sad
  // ─────────────────────────────────────────────────────────────
  emptySection: {
    marginBottom: 48,
  },
  emptyMessage: {
    fontSize: 17,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  
  // ─────────────────────────────────────────────────────────────
  // SECONDARY - Subtle, always available
  // ─────────────────────────────────────────────────────────────
  secondary: {
    marginTop: 'auto',
    paddingTop: 32,
  },
  closetAccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  closetLabel: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  closetCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
