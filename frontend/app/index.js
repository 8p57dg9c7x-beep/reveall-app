import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { fetchRealWeather, getWeatherOutfitImages, WEATHER_CONDITIONS } from '../services/weatherService';
import { API_BASE_URL } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Home Screen - Personal Dashboard with Weather-Powered Recommendations
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState(null);
  const [weatherOutfits, setWeatherOutfits] = useState([]);
  const [recommendedOutfits, setRecommendedOutfits] = useState([]);
  const [styleRecommendation, setStyleRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load real weather data and outfit recommendations
  useEffect(() => {
    const loadWeatherAndRecommendations = async () => {
      setLoading(true);
      try {
        // Step 1: Get real weather
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
        
        // Step 2: ALWAYS get weather-based outfit recommendations from backend
        // Works with both real location and default weather
        try {
          const recResponse = await fetch(
            `${API_BASE_URL}/api/recommendations/weather?temp=${weatherData.temp}&condition=${weatherData.condition}`
          );
          const recData = await recResponse.json();
          
          if (recData.success && recData.outfits && recData.outfits.length > 0) {
            setRecommendedOutfits(recData.outfits.slice(0, 3)); // Top 3 for the card
            setStyleRecommendation(recData.style_recommendation);
          }
        } catch (recError) {
          console.log('Recommendations fetch error, using fallback:', recError);
        }
        
        // Fallback: use static weather outfit images
        setWeatherOutfits(getWeatherOutfitImages(weatherData.tempCategory));
        
      } catch (error) {
        console.error('Error loading weather data:', error);
        // Fallback to static data
        const fallbackWeather = await fetchRealWeather();
        setWeather(fallbackWeather);
        setWeatherOutfits(getWeatherOutfitImages(fallbackWeather.tempCategory));
      } finally {
        setLoading(false);
      }
    };
    
    loadWeatherAndRecommendations();
  }, []);

  // Quick actions - v1 Core: 4 actions including Favorites
  const quickActions = useMemo(() => [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist', color: '#B14CFF' },
    { id: 'body-scan', label: 'Body Scan', icon: 'human', route: '/bodyscanner', color: '#4ECDC4' },
    { id: 'wardrobe', label: 'My Closet', icon: 'hanger', route: '/aiwardrobe', color: '#FF6EC7' },
    { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/saved-outfits', color: '#FF4757' },
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

  // Render outfit card for Today's Picks
  const renderOutfitCard = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => {
        if (item.id) {
          // Navigate to outfit detail if it's a real outfit
          router.push({ 
            pathname: '/outfitdetail', 
            params: { outfitData: JSON.stringify(item), returnPath: '/' } 
          });
        } else {
          router.push({ pathname: '/style', params: { returnPath: '/' } });
        }
      }}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.outfitImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.outfitOverlay}
      >
        <View style={styles.outfitTag}>
          <Text style={styles.outfitTagText}>{item.tag || item.weather_match_reason || 'Trending'}</Text>
        </View>
        <Text style={styles.outfitTitle} numberOfLines={1}>{item.title}</Text>
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

      {/* Weather Style Card - Hero with Outfit Thumbnails */}
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

            {/* Outfit Suggestion with Thumbnails */}
            <View style={styles.outfitSuggestion}>
              <Text style={styles.suggestionLabel}>What to Wear Today</Text>
              <Text style={styles.suggestionStyle}>
                {styleRecommendation?.tip || weather.outfitSuggestion.style}
              </Text>
              
              {/* Outfit Thumbnails */}
              {recommendedOutfits.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailScroll}
                >
                  {recommendedOutfits.map((outfit, index) => (
                    <TouchableOpacity
                      key={outfit.id || index}
                      style={styles.thumbnailCard}
                      onPress={() => router.push({
                        pathname: '/outfitdetail',
                        params: { outfitData: JSON.stringify(outfit), returnPath: '/' }
                      })}
                      activeOpacity={0.85}
                    >
                      <Image 
                        source={{ uri: outfit.image }} 
                        style={styles.thumbnailImage}
                      />
                      <View style={styles.thumbnailOverlay}>
                        <Text style={styles.thumbnailTitle} numberOfLines={1}>
                          {outfit.title?.split(' ').slice(0, 2).join(' ')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.seeMoreCard}
                    onPress={() => router.push({ pathname: '/style', params: { returnPath: '/' } })}
                  >
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                    <Text style={styles.seeMoreText}>More</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <View style={styles.suggestionItems}>
                  {weather.outfitSuggestion.items.slice(0, 3).map((item, i) => (
                    <View key={i} style={styles.suggestionChip}>
                      <Text style={styles.suggestionChipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* CTA */}
            <View style={styles.weatherCTA}>
              <Text style={styles.weatherCTAText}>Get Personalized Picks</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Quick Actions - v1 Core: 4 Tools */}
      <View style={styles.quickActionsRow}>
        {quickActions.map(renderQuickAction)}
      </View>

      {/* Today's Picks - Weather-based AI recommendations */}
      {(recommendedOutfits.length > 0 || weatherOutfits.length > 0) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Picks</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/aistylist', params: { returnPath: '/' } })}>
              <Text style={styles.seeAll}>Ask AI</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recommendedOutfits.length > 0 
              ? recommendedOutfits 
              : weatherOutfits
            }
            keyExtractor={(item, index) => item.id || `outfit-${index}`}
            renderItem={renderOutfitCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.outfitsScroll}
          />
        </View>
      )}
    </View>
  ), [insets.top, weather, weatherOutfits, recommendedOutfits, styleRecommendation, quickActions, renderQuickAction, renderOutfitCard]);

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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
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
  // Outfit Thumbnails in Weather Card
  thumbnailScroll: {
    gap: 10,
  },
  thumbnailCard: {
    width: 70,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
  },
  thumbnailTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  seeMoreCard: {
    width: 50,
    height: 90,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
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
