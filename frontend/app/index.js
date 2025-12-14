import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { FEATURE_FLAGS } from '../config/featureFlags';

// Fixed heights for getItemLayout optimization
const HORIZONTAL_CARD_WIDTH = 140;

// Mock weather data (will be replaced with real API)
const MOCK_WEATHER = {
  temp: 72,
  condition: 'Sunny',
  icon: 'weather-sunny',
  location: 'Los Angeles',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState(MOCK_WEATHER);

  // Quick action buttons - filtered by feature flags (v1 core)
  const quickActions = useMemo(() => {
    const allActions = [
      { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist', params: { returnPath: '/' }, color: '#B14CFF', enabled: FEATURE_FLAGS.AI_STYLIST },
      { id: 'style-lab', label: 'Style Lab', icon: 'flask', route: '/stylelab', params: {}, color: '#4ECDC4', enabled: true },
      { id: 'body-scanner', label: 'Body Scan', icon: 'human', route: '/bodyscanner', params: { returnPath: '/' }, color: '#95E1D3', enabled: FEATURE_FLAGS.BODY_SCANNER },
      { id: 'shop', label: 'Shop', icon: 'shopping', route: '/style', params: { returnPath: '/' }, color: '#FF6EC7', enabled: FEATURE_FLAGS.SHOP_THE_LOOK },
    ];
    return allActions.filter(a => a.enabled);
  }, []);

  // Weather-based outfit suggestions
  const weatherOutfits = useMemo(() => [
    { id: 1, title: 'Light & Breezy', temp: '70-80°F', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', tag: 'Perfect for today' },
    { id: 2, title: 'Casual Cool', temp: '65-75°F', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80', tag: 'Light layers' },
    { id: 3, title: 'Summer Ready', temp: '75-85°F', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80', tag: 'Stay cool' },
    { id: 4, title: 'Sunny Day', temp: '70-80°F', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80', tag: 'UV protection' },
  ], []);

  // Trending styles data
  const trendingStyles = useMemo(() => [
    { id: 1, title: 'Street Style', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80' },
    { id: 2, title: 'Minimalist', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80' },
    { id: 3, title: 'Casual Chic', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80' },
    { id: 4, title: 'Athleisure', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80' },
  ], []);

  // Render functions
  const renderQuickAction = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionButton}
      onPress={() => router.push({ pathname: action.route, params: action.params })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${action.color}30`, `${action.color}10`]}
        style={styles.quickActionGradient}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}40` }]}>
          <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
        </View>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const renderWeatherOutfit = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.weatherCard}
      onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.weatherImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.weatherOverlay}
      >
        <View style={styles.weatherTag}>
          <Text style={styles.weatherTagText}>{item.tag}</Text>
        </View>
        <Text style={styles.weatherTitle}>{item.title}</Text>
        <Text style={styles.weatherTemp}>{item.temp}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const renderStyleCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.styleCard}
      onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.styleImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.styleOverlay}
      >
        <Text style={styles.styleTitle}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  // List header component
  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + SPACING.topPadding }}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={['rgba(177, 76, 255, 0.3)', 'rgba(177, 76, 255, 0.05)']}
          style={styles.heroGradient}
        >
          <MaterialCommunityIcons name="eye" size={56} color={COLORS.primary} />
          <Text style={styles.heroTitle}>REVEAL</Text>
          <Text style={styles.heroSubtitle}>Your Personal Style Intelligence</Text>
        </LinearGradient>
      </View>

      {/* Weather Card (v1 Core Feature) */}
      {FEATURE_FLAGS.WEATHER_OUTFITS && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.weatherBanner}
            onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.weatherBannerGradient}
            >
              <View style={styles.weatherBannerLeft}>
                <MaterialCommunityIcons name={weather.icon} size={40} color="#FFFFFF" />
                <View style={styles.weatherBannerText}>
                  <Text style={styles.weatherBannerTemp}>{weather.temp}°F</Text>
                  <Text style={styles.weatherBannerLocation}>{weather.location}</Text>
                </View>
              </View>
              <View style={styles.weatherBannerRight}>
                <Text style={styles.weatherBannerCTA}>Today's Outfits</Text>
                <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      {/* Weather-Based Outfits (v1 Core) */}
      {FEATURE_FLAGS.WEATHER_OUTFITS && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="weather-sunny" size={20} color="#FFD93D" />
              <Text style={styles.sectionTitleInline}>Weather Picks</Text>
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={weatherOutfits}
            keyExtractor={(item) => `weather-${item.id}`}
            renderItem={renderWeatherOutfit}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            initialNumToRender={4}
            removeClippedSubviews={true}
          />
        </View>
      )}

      {/* Shop The Look Banner (v1 Core) */}
      {FEATURE_FLAGS.SHOP_THE_LOOK && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.shopBanner}
            onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.primary, '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shopBannerGradient}
            >
              <View style={styles.shopBannerContent}>
                <MaterialCommunityIcons name="shopping" size={32} color="#FFFFFF" />
                <View style={styles.shopBannerText}>
                  <Text style={styles.shopBannerTitle}>Shop The Look</Text>
                  <Text style={styles.shopBannerSubtitle}>Find & buy pieces from any outfit</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="arrow-right-circle" size={32} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Trending Styles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleInline}>Trending Styles</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={trendingStyles}
          keyExtractor={(item) => `style-${item.id}`}
          renderItem={renderStyleCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          initialNumToRender={4}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: HORIZONTAL_CARD_WIDTH + 12,
            offset: (HORIZONTAL_CARD_WIDTH + 12) * index,
            index,
          })}
        />
      </View>
    </View>
  ), [insets.top, weather, quickActions, weatherOutfits, trendingStyles, renderQuickAction, renderWeatherOutfit, renderStyleCard]);

  const emptyData = useMemo(() => [], []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={emptyData}
        renderItem={() => null}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={() => 'main'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        removeClippedSubviews={true}
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
  heroSection: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionGap,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: SIZES.borderRadiusCard,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sectionTitleToContent,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sectionTitleToContent,
  },
  sectionTitleInline: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Weather Banner
  weatherBanner: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  weatherBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  weatherBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherBannerText: {
    marginLeft: 12,
  },
  weatherBannerTemp: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weatherBannerLocation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherBannerCTA: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.cardGap,
  },
  quickActionButton: {
    width: '47%',
    ...CARD_SHADOW,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.cardPadding,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  // Weather Outfit Cards
  weatherCard: {
    width: 160,
    height: 220,
    marginRight: SPACING.itemGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  weatherImage: {
    width: '100%',
    height: '100%',
  },
  weatherOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  weatherTag: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  weatherTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weatherTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weatherTemp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  // Shop Banner
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
  // Style Cards
  horizontalScroll: {
    paddingRight: 20,
  },
  styleCard: {
    width: HORIZONTAL_CARD_WIDTH,
    height: 180,
    marginRight: SPACING.itemGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  styleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  styleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
