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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Today Screen - Minimal, Intentional
// ONE hero action. Everything else secondary.
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
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
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
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const canStyle = closetCount >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;
  const hasItems = closetCount > 0;

  // Weather-aware hint
  const getContextHint = () => {
    if (!weather) return null;
    const temp = weather.temp || 70;
    if (temp < 50) return "It's cold outside";
    if (temp < 65) return "A bit cool today";
    if (temp < 80) return "Perfect weather";
    return "Warm day ahead";
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{weather?.greeting?.text || 'Good day'}</Text>
          {weather && (
            <View style={styles.weatherPill}>
              <MaterialCommunityIcons name={weather.icon} size={16} color={COLORS.textSecondary} />
              <Text style={styles.weatherText}>{weather.tempDisplay}</Text>
            </View>
          )}
        </View>

        {/* HERO - ONE action */}
        {canStyle ? (
          <TouchableOpacity 
            style={styles.heroCard}
            onPress={() => { triggerHaptic(); openHelpMeDecide(); }}
            activeOpacity={0.95}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroQuestion}>What should I wear today?</Text>
              {getContextHint() && (
                <Text style={styles.heroHint}>{getContextHint()}</Text>
              )}
            </View>
            <View style={styles.heroAction}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : hasItems ? (
          // Progress state - not yet ready for styling
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Building your wardrobe</Text>
            <Text style={styles.progressSubtitle}>
              {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount === 1 ? 'piece' : 'pieces'} to unlock outfit suggestions
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(closetCount / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }]} />
            </View>
            <TouchableOpacity 
              style={styles.progressAction}
              onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.progressActionText}>Add items</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Empty state - inviting
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="hanger" size={32} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.emptyTitle}>Your wardrobe awaits</Text>
            <Text style={styles.emptySubtitle}>Add a few pieces to get started</Text>
            <TouchableOpacity 
              style={styles.emptyCTA}
              onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
              activeOpacity={0.9}
            >
              <Text style={styles.emptyCTAText}>Open My Closet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Secondary - Closet access (subtle) */}
        {hasItems && (
          <TouchableOpacity 
            style={styles.closetLink}
            onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
            activeOpacity={0.7}
          >
            <Text style={styles.closetLinkText}>My Closet</Text>
            <View style={styles.closetBadge}>
              <Text style={styles.closetBadgeText}>{closetCount}</Text>
            </View>
          </TouchableOpacity>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 120,
  },
  
  // Header - Minimal
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weatherText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // HERO - The ONE action
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
  },
  heroContent: {
    flex: 1,
  },
  heroQuestion: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  heroHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  heroAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  
  // Progress state
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressAction: {
    alignSelf: 'flex-start',
  },
  progressActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 28,
  },
  emptyCTA: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Closet link - Secondary, subtle
  closetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  closetLinkText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  closetBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closetBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
