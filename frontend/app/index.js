import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';
import { fetchRealWeather } from '../services/weatherService';
import { getClosetItemCount, ONBOARDING_CONFIG } from '../services/onboardingService';
import { logEvent } from '../services/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Today Screen - v1: Calm, Wardrobe-First Welcome
// Philosophy: "This is my wardrobe — organized, calm, and helpful."
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reset scroll to top on tab focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Track app open
  useEffect(() => {
    logEvent('app_opened', { screen: 'today' });
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load weather (ambient, not hero)
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
        
        // Load closet items for preview
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
          setRecentItems(items.slice(0, 4)); // Show 4 recent items as preview
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh data periodically
  useEffect(() => {
    const refresh = async () => {
      const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
      if (wardrobeJson) {
        const items = JSON.parse(wardrobeJson);
        setClosetCount(items.length);
        setRecentItems(items.slice(0, 4));
      }
    };
    
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  const hasItems = closetCount > 0;
  const canStyleWardrobe = closetCount >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Calm Header with Ambient Weather */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{weather?.greeting?.text || 'Welcome'}</Text>
            <Text style={styles.dateText}>{weather?.dayOfWeek}, {weather?.date}</Text>
          </View>
          
          {/* Ambient Weather Badge - Subtle, not hero */}
          {weather && (
            <View style={styles.weatherBadge}>
              <MaterialCommunityIcons name={weather.icon} size={18} color={weather.iconColor} />
              <Text style={styles.weatherTemp}>{weather.tempDisplay}</Text>
            </View>
          )}
        </View>

        {/* Main Content: Wardrobe Preview or Welcome */}
        {hasItems ? (
          <>
            {/* Your Wardrobe Preview */}
            <TouchableOpacity 
              style={styles.wardrobePreview}
              onPress={() => router.push('/aiwardrobe')}
              activeOpacity={0.9}
            >
              <View style={styles.wardrobeHeader}>
                <Text style={styles.wardrobeTitle}>Your Wardrobe</Text>
                <View style={styles.wardrobeCount}>
                  <Text style={styles.wardrobeCountText}>{closetCount} items</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                </View>
              </View>
              
              {/* Item Preview Grid */}
              <View style={styles.itemGrid}>
                {recentItems.map((item, index) => (
                  <View key={item.id || index} style={styles.itemPreview}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  </View>
                ))}
                {recentItems.length < 4 && Array.from({ length: 4 - recentItems.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={[styles.itemPreview, styles.itemEmpty]}>
                    <MaterialCommunityIcons name="plus" size={24} color={COLORS.textMuted} />
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Style My Wardrobe - Only shows after 3+ items */}
            {canStyleWardrobe && weather && (
              <TouchableOpacity 
                style={styles.styleCard}
                onPress={() => router.push('/aistylist')}
                activeOpacity={0.9}
              >
                <View style={styles.styleCardContent}>
                  <View style={styles.styleCardLeft}>
                    <Text style={styles.styleCardTitle}>Style My Wardrobe</Text>
                    <Text style={styles.styleCardSubtitle}>
                      {weather.tempDisplay} · {weather.conditionLabel}
                    </Text>
                  </View>
                  <View style={styles.styleCardIcon}>
                    <MaterialCommunityIcons name="hanger" size={24} color={COLORS.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Add More Prompt - if less than 3 items */}
            {!canStyleWardrobe && (
              <View style={styles.addMoreCard}>
                <Text style={styles.addMoreText}>
                  Add {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more item{ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount !== 1 ? 's' : ''} to unlock outfit suggestions
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(closetCount / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }]} />
                </View>
              </View>
            )}
          </>
        ) : (
          /* Empty State - Warm Welcome */
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <MaterialCommunityIcons name="wardrobe-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Your Wardrobe Awaits</Text>
            <Text style={styles.welcomeSubtitle}>
              Add your clothes to create a calm, organized space — and get outfit ideas that actually fit your style.
            </Text>
            <TouchableOpacity 
              style={styles.welcomeCTA}
              onPress={() => router.push('/aiwardrobe')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.welcomeCTAText}>Add Your First Piece</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ambient Weather Suggestion - Subtle hint */}
        {weather && hasItems && (
          <View style={styles.weatherHint}>
            <MaterialCommunityIcons name={weather.icon} size={16} color={COLORS.textMuted} />
            <Text style={styles.weatherHintText}>
              {weather.outfitSuggestion?.tip || `Good day for ${weather.outfitSuggestion?.style?.toLowerCase()}`}
            </Text>
          </View>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // Ambient Weather Badge
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  // Wardrobe Preview
  wardrobePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  wardrobeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wardrobeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  wardrobeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wardrobeCountText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  itemGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  itemPreview: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  
  // Style My Wardrobe Card
  styleCard: {
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  styleCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleCardLeft: {
    flex: 1,
  },
  styleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  styleCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  styleCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Add More Card
  addMoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addMoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  
  // Welcome Card (Empty State)
  welcomeCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  welcomeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
  },
  welcomeCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Weather Hint
  weatherHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  weatherHintText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
