import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
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
// HOME SCREEN - DETERMINISTIC STATE CONTRACT
// ═══════════════════════════════════════════════════════════════
//
// STATE CONTRACT:
// ┌─────────────────────────────────────────────────────────────┐
// │ items.length === 0        → EMPTY STATE                    │
// │ items.length > 0 && < 5   → BUILDING STATE                 │
// │ items.length >= 5         → READY STATE (primary CTA)      │
// └─────────────────────────────────────────────────────────────┘
//
// GUARANTEES:
// 1. Same items array → same UI render, always
// 2. State is re-fetched on EVERY focus event
// 3. No derived state that can go stale
// 4. Loading guard prevents flash of wrong content
//
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = '@reveal_wardrobe';
const MIN_ITEMS_FOR_STYLING = ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const { openHelpMeDecide } = useHelpMeDecide();
  
  // ═══════════════════════════════════════════════════════════════
  // SINGLE SOURCE OF TRUTH
  // All UI decisions derive from this one state
  // ═══════════════════════════════════════════════════════════════
  const [items, setItems] = useState(null); // null = loading, [] = empty, [...] = has items
  const [weather, setWeather] = useState(null);

  // ═══════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════
  
  const loadItems = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = json ? JSON.parse(json) : [];
      // Ensure we always get an array
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.log('[Home] Error loading items:', error);
      setItems([]); // Fail safe to empty
    }
  }, []);

  // Load weather once on mount
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const data = await fetchRealWeather();
        setWeather(data);
      } catch (error) {
        console.log('[Home] Error loading weather:', error);
      }
    };
    loadWeather();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CRITICAL: Re-fetch items on EVERY focus
  // This is the key to deterministic behavior
  // ═══════════════════════════════════════════════════════════════
  useFocusEffect(
    useCallback(() => {
      // Reset scroll position
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      // Always re-fetch - this ensures fresh data after any navigation
      loadItems();
    }, [loadItems])
  );

  // ═══════════════════════════════════════════════════════════════
  // DERIVED STATE - Computed fresh on every render
  // These are NOT stored in state, preventing stale values
  // ═══════════════════════════════════════════════════════════════
  const isLoading = items === null;
  const itemCount = items?.length ?? 0;
  const isEmpty = itemCount === 0;
  const isBuilding = itemCount > 0 && itemCount < MIN_ITEMS_FOR_STYLING;
  const isReady = itemCount >= MIN_ITEMS_FOR_STYLING;
  const recentItems = items?.slice(-3).reverse() ?? [];
  const itemsNeeded = MIN_ITEMS_FOR_STYLING - itemCount;

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════
  
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navigateToCloset = () => {
    triggerHaptic();
    router.push('/aiwardrobe');
  };

  const handlePrimaryCTA = () => {
    triggerHaptic();
    openHelpMeDecide();
  };

  // ═══════════════════════════════════════════════════════════════
  // LOADING STATE - Prevents flash of wrong content
  // ═══════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 100 }]}>
          <ActivityIndicator size="small" color={COLORS.textMuted} />
        </View>
      </LinearGradient>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER - Deterministic based on itemCount
  // ═══════════════════════════════════════════════════════════════
  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content, 
          { 
            paddingTop: insets.top + 56, 
            paddingBottom: 100,
          }
        ]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        bounces={true}
      >
        
        {/* ─────────────────────────────────────────────────────── */}
        {/* GREETING - Always shown                                 */}
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
        {/* CLOSET PREVIEW - Shows when user has ANY items          */}
        {/* This is the visual acknowledgment of their wardrobe     */}
        {/* ─────────────────────────────────────────────────────── */}
        {itemCount > 0 && (
          <TouchableOpacity 
            style={styles.wardrobeAnchor}
            onPress={navigateToCloset}
            activeOpacity={0.9}
          >
            {recentItems.length > 0 && (
              <View style={styles.wardrobePreview}>
                {recentItems.map((item, index) => (
                  <View 
                    key={item.id || `item-${index}`} 
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
            )}
            <Text style={styles.wardrobeLabel}>
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} in your closet
            </Text>
          </TouchableOpacity>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* STATE: READY (itemCount >= 5)                           */}
        {/* Primary CTA: "What should I wear?"                      */}
        {/* ─────────────────────────────────────────────────────── */}
        {isReady && (
          <>
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={handlePrimaryCTA}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryText}>What should I wear?</Text>
              <Text style={styles.primarySubtext}>Based on weather and your closet</Text>
            </TouchableOpacity>
            
            <View style={styles.secondary}>
              <TouchableOpacity 
                style={styles.closetLink}
                onPress={navigateToCloset}
                activeOpacity={0.7}
              >
                <Text style={styles.closetText}>Open closet</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* STATE: BUILDING (0 < itemCount < 5)                     */}
        {/* Prompt to add more items                                */}
        {/* ─────────────────────────────────────────────────────── */}
        {isBuilding && (
          <View style={styles.buildingState}>
            <Text style={styles.buildingText}>
              Add {itemsNeeded} more to unlock outfit suggestions
            </Text>
            <TouchableOpacity 
              style={styles.addMoreLink}
              onPress={navigateToCloset}
              activeOpacity={0.7}
            >
              <Text style={styles.addMoreText}>Add items</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────── */}
        {/* STATE: EMPTY (itemCount === 0)                          */}
        {/* Fresh start experience                                  */}
        {/* ─────────────────────────────────────────────────────── */}
        {isEmpty && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your closet awaits</Text>
            <TouchableOpacity 
              style={styles.startLink}
              onPress={navigateToCloset}
              activeOpacity={0.7}
            >
              <Text style={styles.startText}>Start building</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    flexGrow: 1,
  },
  
  // HEADLINE
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
  
  // CLOSET PREVIEW
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
  
  // PRIMARY ACTION (READY STATE)
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  primarySubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    letterSpacing: 0.1,
  },
  
  // SECONDARY LINK
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
  
  // BUILDING STATE
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
  
  // EMPTY STATE
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
});
