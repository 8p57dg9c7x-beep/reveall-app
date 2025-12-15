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
import { fetchRealWeather, getWeatherOutfitImages } from '../services/weatherService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Home Screen - Personal Dashboard (Clean & Premium)
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState(null);
  const [weatherOutfits, setWeatherOutfits] = useState([]);

  // Load real weather data on mount
  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchRealWeather();
      setWeather(data);
      setWeatherOutfits(getWeatherOutfitImages(data.tempCategory));
    };
    loadWeather();
  }, []);

  // Quick actions - simplified to 3 core actions
  const quickActions = useMemo(() => [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist', color: '#B14CFF' },
    { id: 'body-scan', label: 'Body Scan', icon: 'human', route: '/bodyscanner', color: '#4ECDC4' },
    { id: 'wardrobe', label: 'My Closet', icon: 'hanger', route: '/aiwardrobe', color: '#FF6EC7' },
  ], []);

  // Render quick action button
  const renderQuickAction = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickAction}
      onPress={() => router.push({ pathname: action.route, params: { returnPath: '/' } })}
      activeOpacity={0.85}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}25` }]}>
        <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
      </View>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </TouchableOpacity>
  ), []);

  // Render outfit card
  const renderOutfitCard = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={styles.outfitCard}
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
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  // Main content
  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + 16 }}>
      {/* Greeting */}
      {weather && (
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{weather.greeting.text}</Text>
          <Text style={styles.dateText}>{weather.dayOfWeek}, {weather.date}</Text>
        </View>
      )}

      {/* Weather Style Card - Hero */}
      {weather && (
        <TouchableOpacity 
          style={styles.weatherCard}
          onPress={() => router.push({ pathname: '/aistylist', params: { returnPath: '/' } })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[weather.iconColor, `${weather.iconColor}90`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weatherGradient}
          >
            {/* Weather Info */}
            <View style={styles.weatherTop}>
              <View style={styles.weatherLeft}>
                <MaterialCommunityIcons name={weather.icon} size={48} color="#FFFFFF" />
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>{weather.tempF}</Text>
                  <Text style={styles.weatherLocation}>{weather.location}</Text>
                </View>
              </View>
              <Text style={styles.weatherCondition}>{weather.conditionLabel}</Text>
            </View>

            {/* Outfit Suggestion */}
            <View style={styles.outfitSuggestion}>
              <Text style={styles.suggestionLabel}>Today's Style</Text>
              <Text style={styles.suggestionStyle}>{weather.outfitSuggestion.style}</Text>
              <View style={styles.suggestionItems}>
                {weather.outfitSuggestion.items.slice(0, 3).map((item, i) => (
                  <View key={i} style={styles.suggestionChip}>
                    <Text style={styles.suggestionChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA */}
            <View style={styles.weatherCTA}>
              <Text style={styles.weatherCTAText}>Get Personalized Picks</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Quick Actions - 3 Core Tools */}
      <View style={styles.quickActionsRow}>
        {quickActions.map(renderQuickAction)}
      </View>

      {/* Today's Picks */}
      {weatherOutfits.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Picks</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={weatherOutfits}
            keyExtractor={(item) => `outfit-${item.id}`}
            renderItem={renderOutfitCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.outfitsScroll}
          />
        </View>
      )}

      {/* Single Shop CTA */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.shopCTA}
          onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.primary, '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopCTAGradient}
          >
            <MaterialCommunityIcons name="shopping" size={24} color="#FFFFFF" />
            <View style={styles.shopCTAText}>
              <Text style={styles.shopCTATitle}>Shop The Look</Text>
              <Text style={styles.shopCTASubtitle}>Get exact pieces from any outfit</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  ), [insets.top, weather, weatherOutfits, quickActions, renderQuickAction, renderOutfitCard]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
  // Greeting
  greetingSection: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 20,
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
  // Weather Card
  weatherCard: {
    marginHorizontal: SPACING.screenHorizontal,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...CARD_SHADOW,
  },
  weatherGradient: {
    padding: 20,
  },
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherInfo: {
    marginLeft: 12,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  weatherLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherCondition: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  outfitSuggestion: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestionStyle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  suggestionItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weatherCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  weatherCTAText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 28,
  },
  quickAction: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Outfit Cards
  outfitsScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  outfitCard: {
    width: 150,
    height: 200,
    marginRight: 12,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
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
    padding: 12,
  },
  outfitTag: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  outfitTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outfitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Shop CTA
  shopCTA: {
    marginHorizontal: SPACING.screenHorizontal,
    borderRadius: 16,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  shopCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  shopCTAText: {
    flex: 1,
  },
  shopCTATitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopCTASubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
