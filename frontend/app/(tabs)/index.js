import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Dimensions,
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

// ═══════════════════════════════════════════════════════════════
// HOME
// Like opening your wardrobe, not opening an app.
// One purpose. Calm. Personal.
// ═══════════════════════════════════════════════════════════════

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const { openHelpMeDecide } = useHelpMeDecide();

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      loadClosetData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const weatherData = await fetchRealWeather();
      setWeather(weatherData);
      await loadClosetData();
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const loadClosetData = async () => {
    const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
    if (wardrobeJson) {
      const items = JSON.parse(wardrobeJson);
      setClosetCount(items.length);
      // Get up to 3 recent items for the emotional anchor
      setRecentItems(items.slice(-3).reverse());
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
            paddingTop: insets.top + 56, 
            paddingBottom: insets.bottom + 140
          }
        ]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        bounces={true}
      >
        
        {/* ─────────────────────────────────────────────────────── */}
        {/* EMOTIONAL HEADLINE                                      */}
        {/* ─────────────────────────────────────────────────────── */}
        
        <View style={styles.headline}>
          <Text style={styles.headlineText}>
            {weather?.greeting?.text || 'Good day'}
          </Text>
          
          {weather && (
            <Text style={styles.weatherText}>
              {weather.tempDisplay} outside
            </Text>
          )}
        </View>

        {/* ─────────────────────────────────────────────────────── */}
        {/* EMOTIONAL ANCHOR - Your wardrobe presence               */}
        {/* Subtle visual that says "this is yours"                 */}
        {/* ─────────────────────────────────────────────────────── */}
        
        {hasItems && recentItems.length > 0 && (
          <TouchableOpacity 
            style={styles.wardrobeAnchor}
            onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
            activeOpacity={0.9}
          >
            <View style={styles.wardrobePreview}>
              {recentItems.map((item, index) => (
                <View 
                  key={item.id || index} 
                  style={[
                    styles.previewThumb,
                    { 
                      marginLeft: index > 0 ? -16 : 0,
                      zIndex: 3 - index,
                    }
                  ]}
                >
                  <Image source={{ uri: item.image }} style={styles.thumbImage} />
                </View>
              ))}
            </View>
            <Text style={styles.wardrobeLabel}>
              {closetCount} {closetCount === 1 ? 'piece' : 'pieces'} waiting
            </Text>
          </TouchableOpacity>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* ONE PRIMARY ACTION                                       */}
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
              Add {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - closetCount} more to unlock outfit suggestions
            </Text>
            <TouchableOpacity 
              style={styles.addMoreLink}
              onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.addMoreText}>Add items</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Your wardrobe awaits
            </Text>
            <TouchableOpacity 
              style={styles.startLink}
              onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.startText}>Start building</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* SECONDARY CLOSET ACCESS                                 */}
        {/* Clear affordance - obviously tappable                   */}
        {/* ─────────────────────────────────────────────────────── */}
        
        {hasItems && canStyle && (
          <View style={styles.secondary}>
            <TouchableOpacity 
              style={styles.closetLink}
              onPress={() => { triggerHaptic(); router.push('/aiwardrobe'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.closetText}>Open closet</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
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
  // HEADLINE
  // ─────────────────────────────────────────────────────────────
  headline: {
    marginBottom: 40,
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
  // EMOTIONAL ANCHOR - Your wardrobe presence
  // ─────────────────────────────────────────────────────────────
  wardrobeAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
    paddingVertical: 8,
  },
  wardrobePreview: {
    flexDirection: 'row',
    marginRight: 14,
  },
  previewThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0D0D0D',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wardrobeLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  
  // ─────────────────────────────────────────────────────────────
  // PRIMARY ACTION
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
  // BUILDING STATE
  // ─────────────────────────────────────────────────────────────
  buildingState: {
    paddingVertical: 16,
  },
  buildingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  addMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  
  // ─────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  startLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  
  // ─────────────────────────────────────────────────────────────
  // SECONDARY - Clear affordance
  // ─────────────────────────────────────────────────────────────
  secondary: {
    marginTop: 'auto',
    paddingTop: 48,
  },
  closetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  closetText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginRight: 4,
  },
});
