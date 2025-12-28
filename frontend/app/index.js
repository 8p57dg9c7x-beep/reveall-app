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
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';
import { fetchRealWeather } from '../services/weatherService';
import { getClosetItemCount, ONBOARDING_CONFIG } from '../services/onboardingService';
import { logEvent } from '../services/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Today Screen - v1: "What should I wear today?"
// A living wardrobe that thinks for you
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reset scroll on focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    logEvent('app_opened', { screen: 'today' });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
        
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
          setRecentItems(items.slice(0, 6));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Refresh closet data periodically
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
          setRecentItems(items.slice(0, 6));
        }
      };
      refresh();
    }, [])
  );

  const hasItems = closetCount > 0;
  const canStyle = closetCount >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;

  // Get outfit suggestion text based on weather
  const getOutfitHint = () => {
    if (!weather) return "Checking the weather...";
    const temp = weather.temp || 70;
    if (temp < 50) return "Layer up today — it's cold outside";
    if (temp < 65) return "A light jacket would be perfect";
    if (temp < 80) return "Great day for your favorite pieces";
    return "Keep it light and breezy today";
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dominant Hero: What to Wear Today */}
        <View style={styles.heroSection}>
          <Text style={styles.heroQuestion}>What should I wear today?</Text>
          
          {weather && (
            <View style={styles.weatherContext}>
              <MaterialCommunityIcons name={weather.icon} size={20} color={weather.iconColor} />
              <Text style={styles.weatherText}>{weather.tempDisplay} · {weather.conditionLabel}</Text>
            </View>
          )}
          
          <Text style={styles.outfitHint}>{getOutfitHint()}</Text>
        </View>

        {/* Outfit Preview / Anticipation */}
        {hasItems && canStyle ? (
          <TouchableOpacity 
            style={styles.outfitPreview}
            onPress={() => router.push('/aistylist')}
            activeOpacity={0.9}
          >
            <View style={styles.outfitHeader}>
              <Text style={styles.outfitLabel}>Today's suggestion</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
            
            <View style={styles.outfitItems}>
              {recentItems.slice(0, 3).map((item, index) => (
                <View key={item.id} style={[styles.outfitItem, index === 1 && styles.outfitItemCenter]}>
                  <Image source={{ uri: item.image }} style={styles.outfitItemImage} />
                  <Text style={styles.outfitItemLabel}>{item.category || 'Item'}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.outfitTap}>Tap to see full outfit</Text>
          </TouchableOpacity>
        ) : hasItems ? (
          /* Milestone: Almost ready */
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneProgress}>
              <View style={[styles.milestoneBar, { width: `${(closetCount / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }]} />
            </View>
            <Text style={styles.milestoneText}>
              {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more item{ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount !== 1 ? 's' : ''} until your wardrobe can dress you
            </Text>
            <TouchableOpacity 
              style={styles.milestoneButton}
              onPress={() => router.push('/aiwardrobe')}
            >
              <Text style={styles.milestoneButtonText}>Add to Closet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Empty: Outfit Placeholder for anticipation */
          <View style={styles.placeholderCard}>
            <View style={styles.placeholderOutfit}>
              <View style={styles.placeholderItem}>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.placeholderLabel}>Top</Text>
              </View>
              <View style={styles.placeholderItem}>
                <MaterialCommunityIcons name="lingerie" size={32} color={COLORS.textMuted} />
                <Text style={styles.placeholderLabel}>Bottom</Text>
              </View>
              <View style={styles.placeholderItem}>
                <MaterialCommunityIcons name="shoe-sneaker" size={32} color={COLORS.textMuted} />
                <Text style={styles.placeholderLabel}>Shoes</Text>
              </View>
            </View>
            <Text style={styles.placeholderText}>Your outfit will appear here</Text>
            <Text style={styles.placeholderSubtext}>Add clothes to your closet to get started</Text>
          </View>
        )}

        {/* Quick Access to Closet */}
        <TouchableOpacity 
          style={styles.closetAccess}
          onPress={() => router.push('/aiwardrobe')}
          activeOpacity={0.9}
        >
          <View style={styles.closetAccessLeft}>
            <MaterialCommunityIcons name="wardrobe-outline" size={24} color={COLORS.primary} />
            <View>
              <Text style={styles.closetAccessTitle}>My Closet</Text>
              <Text style={styles.closetAccessSubtitle}>
                {closetCount === 0 ? 'Start building' : `${closetCount} items`}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>

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
  
  // Hero Section - Dominant
  heroSection: {
    marginBottom: 28,
  },
  heroQuestion: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 12,
  },
  weatherContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  outfitHint: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  
  // Outfit Preview
  outfitPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outfitItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  outfitItem: {
    alignItems: 'center',
    width: 90,
  },
  outfitItemCenter: {
    transform: [{ scale: 1.1 }],
  },
  outfitItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  outfitItemLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  outfitTap: {
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Milestone Card
  milestoneCard: {
    backgroundColor: 'rgba(177, 76, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  milestoneProgress: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  milestoneBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  milestoneText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  milestoneButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  milestoneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Placeholder Card
  placeholderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },
  placeholderOutfit: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  placeholderItem: {
    alignItems: 'center',
    opacity: 0.5,
  },
  placeholderLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  
  // Closet Access
  closetAccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 16,
  },
  closetAccessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  closetAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closetAccessSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
