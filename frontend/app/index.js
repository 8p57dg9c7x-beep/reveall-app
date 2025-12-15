import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { fetchRealWeather, getWeatherOutfitImages } from '../services/weatherService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_CARD_WIDTH = 160;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState(null);
  const [weatherOutfits, setWeatherOutfits] = useState([]);

  // Load weather data on mount
  useEffect(() => {
    const loadWeather = async () => {
      const data = getMockWeather('Los Angeles');
      setWeather(data);
      setWeatherOutfits(getWeatherOutfitImages(data.tempCategory));
    };
    loadWeather();
  }, []);

  // Quick action buttons - v1 core
  const quickActions = useMemo(() => [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist', params: { returnPath: '/' }, color: '#B14CFF' },
    { id: 'body-scanner', label: 'Body Scan', icon: 'human', route: '/bodyscanner', params: { returnPath: '/' }, color: '#95E1D3' },
    { id: 'wardrobe', label: 'My Closet', icon: 'hanger', route: '/aiwardrobe', params: { returnPath: '/' }, color: '#4ECDC4' },
    { id: 'shop', label: 'Shop Looks', icon: 'shopping', route: '/style', params: { returnPath: '/' }, color: '#FF6EC7' },
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
          <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
        </View>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const renderWeatherOutfit = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={[styles.outfitCard, index === 0 && styles.outfitCardFirst]}
      onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.outfitImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.outfitOverlay}
      >
        <View style={styles.outfitTag}>
          <Text style={styles.outfitTagText}>{item.tag}</Text>
        </View>
        <Text style={styles.outfitTitle}>{item.title}</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
        >
          <Text style={styles.shopButtonText}>Shop Look</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  // List header component
  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + 16 }}>
      {/* Personalized Greeting Header */}
      {weather && (
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>{weather.greeting.text}</Text>
              <Text style={styles.dateText}>{weather.dayOfWeek}, {weather.date}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <MaterialCommunityIcons name="account-circle" size={40} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Weather Card - Hero */}
      {weather && (
        <View style={styles.heroSection}>
          <TouchableOpacity 
            style={styles.weatherHero}
            onPress={() => router.push({ pathname: '/aistylist', params: { returnPath: '/' } })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[weather.iconColor, `${weather.iconColor}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.weatherHeroGradient}
            >
              {/* Weather Info */}
              <View style={styles.weatherInfo}>
                <View style={styles.weatherLeft}>
                  <MaterialCommunityIcons name={weather.icon} size={56} color="#FFFFFF" />
                  <View style={styles.weatherDetails}>
                    <Text style={styles.weatherTemp}>{weather.tempF}</Text>
                    <Text style={styles.weatherCondition}>{weather.conditionLabel}</Text>
                    <Text style={styles.weatherLocation}>{weather.location}</Text>
                  </View>
                </View>
              </View>

              {/* Outfit Suggestion */}
              <View style={styles.outfitSuggestion}>
                <View style={styles.suggestionHeader}>
                  <MaterialCommunityIcons name="hanger" size={20} color="#FFFFFF" />
                  <Text style={styles.suggestionTitle}>Today's Style</Text>
                </View>
                <Text style={styles.suggestionStyle}>{weather.outfitSuggestion.style}</Text>
                <Text style={styles.suggestionTip}>{weather.outfitSuggestion.tip}</Text>
                
                <View style={styles.suggestionItems}>
                  {weather.outfitSuggestion.items.slice(0, 3).map((item, i) => (
                    <View key={i} style={styles.suggestionItem}>
                      <Text style={styles.suggestionItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* CTA */}
              <View style={styles.heroCTA}>
                <Text style={styles.heroCTAText}>Get Personalized Picks</Text>
                <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      {/* Weather-Based Outfit Picks */}
      {weatherOutfits.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="tshirt-crew" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitleInline}>Today's Picks</Text>
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={weatherOutfits}
            keyExtractor={(item) => `outfit-${item.id}`}
            renderItem={renderWeatherOutfit}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            initialNumToRender={3}
            removeClippedSubviews={true}
          />
        </View>
      )}

      {/* Shop The Look Banner */}
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
              <MaterialCommunityIcons name="shopping" size={28} color="#FFFFFF" />
              <View style={styles.shopBannerText}>
                <Text style={styles.shopBannerTitle}>Shop The Look</Text>
                <Text style={styles.shopBannerSubtitle}>Get exact pieces from any outfit</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="arrow-right-circle" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* AI Stylist Promo */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.aiPromo}
          onPress={() => router.push({ pathname: '/aistylist', params: { returnPath: '/' } })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['rgba(177, 76, 255, 0.2)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.aiPromoGradient}
          >
            <View style={styles.aiPromoIcon}>
              <MaterialCommunityIcons name="robot" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.aiPromoContent}>
              <Text style={styles.aiPromoTitle}>AI Stylist</Text>
              <Text style={styles.aiPromoSubtitle}>Get personalized outfit recommendations based on your style, weather, and occasion</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  ), [insets.top, weather, weatherOutfits, quickActions, renderQuickAction, renderWeatherOutfit]);

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
  // Greeting Section
  greetingSection: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  // Hero Weather Section
  heroSection: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionGap,
  },
  weatherHero: {
    borderRadius: 24,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  weatherHeroGradient: {
    padding: 20,
  },
  weatherInfo: {
    marginBottom: 20,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetails: {
    marginLeft: 16,
  },
  weatherTemp: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  weatherCondition: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  weatherLocation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  outfitSuggestion: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  suggestionStyle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  suggestionTip: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  suggestionItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  suggestionItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  heroCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Sections
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
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    width: '48%',
    ...CARD_SHADOW,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  // Outfit Cards
  horizontalScroll: {
    paddingRight: 20,
  },
  outfitCard: {
    width: HORIZONTAL_CARD_WIDTH,
    height: 220,
    marginRight: 12,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  outfitCardFirst: {
    marginLeft: 0,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  outfitOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  outfitTag: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  outfitTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outfitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    padding: 18,
  },
  shopBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  shopBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  // AI Promo
  aiPromo: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  aiPromoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
    borderRadius: SIZES.borderRadiusCard,
  },
  aiPromoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiPromoContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  aiPromoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  aiPromoSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
