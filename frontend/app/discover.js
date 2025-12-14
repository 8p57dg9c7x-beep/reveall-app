import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { FEATURE_FLAGS } from '../config/featureFlags';

// Discover - Style & Shopping Hub (v1 Focus)
export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  // Main exploration categories - filtered by feature flags
  const EXPLORE_CATEGORIES = useMemo(() => {
    const allCategories = [
      {
        id: 'style-discovery',
        title: 'Style Discovery',
        subtitle: 'Explore trending outfits',
        icon: 'hanger',
        color: '#B14CFF',
        route: '/style',
        params: { returnPath: '/discover' },
        enabled: FEATURE_FLAGS.STYLE_DISCOVERY,
      },
      {
        id: 'beauty-hub',
        title: 'Beauty Hub',
        subtitle: 'Makeup looks & products',
        icon: 'lipstick',
        color: '#FF6EC7',
        route: '/beauty',
        params: { returnPath: '/discover' },
        enabled: FEATURE_FLAGS.BEAUTY_HUB,
      },
      {
        id: 'musicscan',
        title: 'MusicScan',
        subtitle: 'Identify any song instantly',
        icon: 'music-circle',
        color: '#1DB954',
        route: '/musicscan',
        params: { returnPath: '/discover' },
        enabled: FEATURE_FLAGS.MUSIC_SCAN,  // Hidden for v1
      },
      {
        id: 'trending-songs',
        title: 'Trending Songs',
        subtitle: 'See what\'s hot right now',
        icon: 'trending-up',
        color: '#FF6B6B',
        route: '/trendingsongs',
        params: { returnPath: '/discover' },
        enabled: FEATURE_FLAGS.TRENDING_SONGS,  // Hidden for v1
      },
    ];
    
    return allCategories.filter(cat => cat.enabled);
  }, []);

  // Quick explore cards - style & shopping focused
  const QUICK_EXPLORE = useMemo(() => [
    {
      id: 'celebrity-styles',
      title: 'Celebrity Looks',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80',
      route: '/style',
      params: { returnPath: '/discover' },
    },
    {
      id: 'shop-look',
      title: 'Shop The Look',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80',
      route: '/style',
      params: { returnPath: '/discover' },
    },
    {
      id: 'beauty-products',
      title: 'Beauty Products',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80',
      route: '/beauty',
      params: { returnPath: '/discover' },
    },
    {
      id: 'outfit-inspo',
      title: 'Daily Outfits',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80',
      route: '/style',
      params: { returnPath: '/discover' },
    },
  ], []);

  // Handlers
  const handleCategoryPress = useCallback((category) => {
    router.push({ pathname: category.route, params: category.params });
  }, []);

  const handleQuickExplorePress = useCallback((item) => {
    router.push({ pathname: item.route, params: item.params });
  }, []);

  // Render category card
  const renderCategoryCard = useCallback((item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[`${item.color}25`, `${item.color}08`]}
        style={styles.categoryGradient}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}30` }]}>
          <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
        </View>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </LinearGradient>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  // Render quick explore card
  const renderQuickExploreCard = useCallback((item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.quickExploreCard}
      onPress={() => handleQuickExplorePress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.quickExploreImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.quickExploreOverlay}
      >
        <Text style={styles.quickExploreTitle}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), [handleQuickExplorePress]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.headerPaddingTop }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="compass" size={44} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Style inspiration & shopping</Text>
        </View>

        {/* Main Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse</Text>
          {EXPLORE_CATEGORIES.map(renderCategoryCard)}
        </View>

        {/* Quick Explore Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Explore</Text>
          <View style={styles.quickExploreGrid}>
            {QUICK_EXPLORE.map(renderQuickExploreCard)}
          </View>
        </View>

        {/* Shop Featured Banner */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.shopBanner}
            onPress={() => router.push({ pathname: '/style', params: { returnPath: '/discover' } })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.primary, '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shopBannerGradient}
            >
              <View style={styles.shopBannerContent}>
                <MaterialCommunityIcons name="shopping" size={28} color="#FFFFFF" />
                <View style={styles.shopBannerText}>
                  <Text style={styles.shopBannerTitle}>Shop The Look</Text>
                  <Text style={styles.shopBannerSubtitle}>Get the exact pieces from any outfit</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="arrow-right-circle" size={32} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.bottomPadding,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionGap,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sectionTitleBottom,
  },
  categoryCard: {
    marginBottom: SPACING.cardGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.cardPadding + 4,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  categorySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickExploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.cardHorizontalGap,
  },
  quickExploreCard: {
    width: '47%',
    height: 140,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginBottom: SPACING.cardGap,
    ...CARD_SHADOW,
  },
  quickExploreImage: {
    width: '100%',
    height: '100%',
  },
  quickExploreOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  quickExploreTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopBanner: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  shopBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: SIZES.borderRadiusCard,
  },
  shopBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopBannerText: {
    marginLeft: 14,
    flex: 1,
  },
  shopBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
