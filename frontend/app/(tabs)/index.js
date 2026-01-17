import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

// ═══════════════════════════════════════════════════════════════
// HOME
// Like opening your wardrobe, not opening an app.
// One purpose. Calm. Reassuring.
// ═══════════════════════════════════════════════════════════════

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const { openHelpMeDecide } = useHelpMeDecide();

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      loadClosetCount();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const weatherData = await fetchRealWeather();
      setWeather(weatherData);
      await loadClosetCount();
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const loadClosetCount = async () => {
    const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
    if (wardrobeJson) {
      setClosetCount(JSON.parse(wardrobeJson).length);
    }
  };

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
          { 
            paddingTop: insets.top + 60, 
            paddingBottom: insets.bottom + 140
          }
        ]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        bounces={true}
      >
        
        {/* ─────────────────────────────────────────────────────── */}
        {/* EMOTIONAL HEADLINE                                      */}
        {/* Calm. No icons. No cards.                               */}
        {/* ─────────────────────────────────────────────────────── */}
        
        <View style={styles.headline}>
          <Text style={styles.headlineText}>
            {weather?.greeting?.text || 'Good day'}
          </Text>
          
          {/* Weather - quiet context */}
          {weather && (
            <Text style={styles.weatherText}>
              {weather.tempDisplay} outside
            </Text>
          )}
        </View>

        {/* ─────────────────────────────────────────────────────── */}
        {/* ONE PRIMARY ACTION                                       */}
        {/* "Help me decide what to wear today"                      */}
        {/* ─────────────────────────────────────────────────────── */}
        
        {canStyle ? (
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={() => { triggerHaptic(); openHelpMeDecide(); }}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>
              Help me decide what to wear
            </Text>
          </TouchableOpacity>
        ) : hasItems ? (
          <View style={styles.buildingState}>
            <Text style={styles.buildingText}>
              Add {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount === 1 ? 'piece' : 'pieces'} to unlock outfit suggestions
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Start by adding a few pieces to your closet
            </Text>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* SECONDARY - Closet access                               */}
        {/* Reassuring, not competing                               */}
        {/* ─────────────────────────────────────────────────────── */}
        
        <View style={styles.secondary}>
          <TouchableOpacity 
            style={styles.closetLink}
            onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
            activeOpacity={0.7}
          >
            <Text style={styles.closetText}>
              {hasItems 
                ? `Your closet · ${closetCount} ${closetCount === 1 ? 'piece' : 'pieces'}`
                : 'Open your closet'
              }
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// Minimal. Calm. Like opening a wardrobe.
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    flexGrow: 1,
  },
  
  // ─────────────────────────────────────────────────────────────
  // HEADLINE - Emotional, calm
  // ─────────────────────────────────────────────────────────────
  headline: {
    marginBottom: 80,
  },
  headlineText: {
    fontSize: 34,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  weatherText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 12,
    letterSpacing: 0.2,
  },
  
  // ─────────────────────────────────────────────────────────────
  // PRIMARY ACTION - The one thing
  // ─────────────────────────────────────────────────────────────
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  
  // ─────────────────────────────────────────────────────────────
  // BUILDING STATE - Encouraging
  // ─────────────────────────────────────────────────────────────
  buildingState: {
    paddingVertical: 20,
  },
  buildingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  
  // ─────────────────────────────────────────────────────────────
  // EMPTY STATE - Inviting
  // ─────────────────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  
  // ─────────────────────────────────────────────────────────────
  // SECONDARY - Quiet, reassuring
  // ─────────────────────────────────────────────────────────────
  secondary: {
    marginTop: 'auto',
    paddingTop: 48,
  },
  closetLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closetText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
