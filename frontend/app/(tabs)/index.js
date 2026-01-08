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
import { COLORS, GRADIENTS, SPACING } from '../../constants/theme';
import { fetchRealWeather } from '../../services/weatherService';
import { ONBOARDING_CONFIG } from '../../services/onboardingService';
import { useHelpMeDecide } from '../_layout';
import { logEvent } from '../../services/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Today Screen - A calm daily check-in
// "Confidence starts here."
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const { openHelpMeDecide } = useHelpMeDecide();

  // NAVIGATION: Always reset scroll to top when tab is focused
  // IMPORTANT: This must run every single time the tab gains focus
  useFocusEffect(
    useCallback(() => {
      // Immediate scroll reset - no animation, no delay
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      
      // Refresh wardrobe data
      const refresh = async () => {
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
          setRecentItems(items.slice(0, 4));
        }
      };
      refresh();
    }, [])
  );

  useEffect(() => {
    logEvent('app_opened', { screen: 'today' });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
        
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
          setRecentItems(items.slice(0, 4));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const hasItems = closetCount > 0;
  const canStyle = closetCount >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;

  // Gentle outfit hint based on weather
  const getDailyHint = () => {
    if (!weather) return null;
    const temp = weather.temp || 70;
    if (temp < 50) return "Layer up - it's chilly today";
    if (temp < 65) return "A light layer would be perfect";
    if (temp < 80) return "Great weather for your favorites";
    return "Keep it light and comfortable";
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Warm Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{weather?.greeting?.text || 'Good day'}</Text>
          
          {/* Moment of Recognition - Human-centric tagline */}
          <Text style={styles.recognitionText}>Getting dressed should not be stressful.</Text>
          
          {/* Ambient Weather - Subtle */}
          {weather && (
            <View style={styles.weatherRow}>
              <MaterialCommunityIcons name={weather.icon} size={18} color={weather.iconColor} />
              <Text style={styles.weatherText}>{weather.tempDisplay}</Text>
            </View>
          )}
        </View>

        {/* HERO SECTION - Visual landing point */}
        <View style={styles.heroSection}>
          {hasItems && recentItems.length >= 2 ? (
            // Show collage of recent items
            <View style={styles.heroCollage}>
              <View style={styles.heroMainImage}>
                {recentItems[0] && (
                  <Image source={{ uri: recentItems[0].image }} style={styles.heroImage} />
                )}
              </View>
              <View style={styles.heroSideImages}>
                {recentItems[1] && (
                  <Image source={{ uri: recentItems[1].image }} style={styles.heroSmallImage} />
                )}
                {recentItems[2] && (
                  <Image source={{ uri: recentItems[2].image }} style={styles.heroSmallImage} />
                )}
              </View>
            </View>
          ) : (
            // Empty/minimal state - abstract visual
            <View style={styles.heroAbstract}>
              <LinearGradient 
                colors={['rgba(177, 76, 255, 0.15)', 'rgba(102, 126, 234, 0.08)']}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="hanger" size={48} color="rgba(255,255,255,0.2)" />
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Daily Anchor - Subtle reason to check in */}
        {hasItems && canStyle ? (
          <TouchableOpacity 
            style={styles.dailyCard}
            onPress={openHelpMeDecide}
            activeOpacity={0.9}
          >
            <Text style={styles.dailyLabel}>Today&apos;s suggestion</Text>
            
            <View style={styles.outfitPreview}>
              {recentItems.slice(0, 3).map((item, index) => (
                <Image 
                  key={item.id} 
                  source={{ uri: item.image }} 
                  style={[
                    styles.outfitItem,
                    index === 1 && styles.outfitItemCenter
                  ]} 
                />
              ))}
            </View>
            
            {getDailyHint() && (
              <Text style={styles.dailyHint}>{getDailyHint()}</Text>
            )}
            
            <Text style={styles.dailyAction}>Help me decide →</Text>
          </TouchableOpacity>
        ) : hasItems ? (
          /* Progress toward first outfit */
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Almost there</Text>
            <Text style={styles.progressText}>
              {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more item{ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount !== 1 ? 's' : ''} to unlock your first outfit suggestion
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(closetCount / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }]} />
            </View>
          </View>
        ) : (
          /* Empty - Warm invitation */
          <View style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>Your Wardrobe Awaits</Text>
            <Text style={styles.inviteTagline}>Confidence starts here.</Text>
            
            <View style={styles.inviteVisual}>
              <View style={styles.placeholderItem}>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={28} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.placeholderItem}>
                <MaterialCommunityIcons name="hanger" size={28} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.placeholderItem}>
                <MaterialCommunityIcons name="shoe-sneaker" size={28} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.inviteCTA}
              onPress={() => router.push('/aiwardrobe')}
              activeOpacity={0.9}
            >
              <Text style={styles.inviteCTAText}>Open My Closet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Closet Access - Always visible */}
        {hasItems && (
          <TouchableOpacity 
            style={styles.closetLink}
            onPress={() => router.push('/aiwardrobe')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="wardrobe-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.closetLinkText}>My Closet</Text>
            <Text style={styles.closetLinkCount}>{closetCount}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
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
  
  // Welcome
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  recognitionText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  
  // Hero Section - Visual landing point
  heroSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroCollage: {
    flexDirection: 'row',
    gap: 8,
    height: 160,
  },
  heroMainImage: {
    width: 140,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroSideImages: {
    gap: 8,
  },
  heroSmallImage: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  heroAbstract: {
    width: '100%',
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Daily Card - For users with items
  dailyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  dailyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  outfitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  outfitItem: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  outfitItemCenter: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  dailyHint: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  dailyAction: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: 'rgba(177, 76, 255, 0.06)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
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
  
  // Invite Card - Empty state
  inviteCard: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 24,
  },
  inviteTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inviteTagline: {
    fontSize: 17,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  inviteVisual: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  placeholderItem: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  inviteCTA: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  inviteCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Closet Link
  closetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  closetLinkText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  closetLinkCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginRight: 4,
  },
});
