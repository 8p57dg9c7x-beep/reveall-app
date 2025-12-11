import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../constants/theme';
import GradientButton from '../components/GradientButton';

// Fixed heights for getItemLayout optimization
const HERO_HEIGHT = 180;
const CTA_HEIGHT = 80;
const QUICK_ACTIONS_HEIGHT = 200;
const FOR_YOU_HEIGHT = 220;
const TRENDING_SECTION_HEIGHT = 200;
const HORIZONTAL_CARD_WIDTH = 140;
const HORIZONTAL_CARD_HEIGHT = 180;

export default function HomeScreen() {
  const { personalization } = useAddilets();

  // Quick action buttons - memoized to prevent re-renders
  const quickActions = useMemo(() => [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist' },
    { id: 'ai-wardrobe', label: 'AI Wardrobe', icon: 'hanger', route: '/aiwardrobe' },
    { id: 'body-scanner', label: 'Body Scanner', icon: 'tape-measure', route: '/bodyscanner' },
    { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/favorites' },
  ], []);

  // Memoized trending data
  const trendingStyles = useMemo(() => [1, 2, 3, 4, 5], []);
  const trendingSongs = useMemo(() => [1, 2, 3, 4, 5], []);
  const trendingMovies = useMemo(() => [1, 2, 3, 4, 5], []);

  // Memoized render functions
  const renderQuickAction = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionButton}
      onPress={() => router.push(action.route)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={GRADIENTS.chip}
        style={styles.quickActionGradient}
      >
        <MaterialCommunityIcons 
          name={action.icon} 
          size={28} 
          color={COLORS.textPrimary} 
        />
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const renderHorizontalItem = useCallback(({ item, icon, route }) => (
    <TouchableOpacity
      key={item}
      style={styles.trendingCard}
      onPress={() => router.push(route)}
      activeOpacity={0.8}
    >
      <View style={styles.trendingImagePlaceholder}>
        <MaterialCommunityIcons name={icon} size={32} color={COLORS.textMuted} />
      </View>
      <Text style={styles.trendingCardTitle}>{icon === 'hanger' ? 'Style' : icon === 'music-note' ? 'Song' : 'Movie'} {item}</Text>
    </TouchableOpacity>
  ), []);

  // List header component - contains all header content
  const ListHeaderComponent = useCallback(() => (
    <View>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <MaterialCommunityIcons name="movie-open" size={48} color={COLORS.primary} />
        <Text style={styles.heroTitle}>CINESCAN</Text>
        <Text style={styles.heroSubtitle}>Discover • Identify • Explore</Text>
      </View>

      {/* Main CTA Button */}
      <View style={styles.ctaSection}>
        <GradientButton
          title="Tap to Identify"
          onPress={() => router.push('/comingsoon')}
          size="large"
          icon={<MaterialCommunityIcons name="movie-search" size={24} color="#FFFFFF" />}
          style={styles.mainCTA}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      {/* For You Section - Powered by Addilets */}
      <View style={styles.forYouSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.forYouHeader}>
            <MaterialCommunityIcons name="star-four-points" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>For You</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/addilets')}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.forYouCard}
          onPress={() => router.push('/addilets')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(177, 76, 255, 0.3)', 'rgba(177, 76, 255, 0.1)']}
            style={styles.forYouGradient}
          >
            <View style={styles.forYouContent}>
              <View style={styles.forYouIcon}>
                <MaterialCommunityIcons name="account-star" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.forYouText}>
                <Text style={styles.forYouTitle}>Your Personalized Style Profile</Text>
                <Text style={styles.forYouSubtitle}>AI-powered recommendations just for you</Text>
              </View>
            </View>
            <View style={styles.forYouStats}>
              <View style={styles.forYouStat}>
                <Text style={styles.forYouStatNumber}>{personalization?.recommendations?.outfits?.length || 3}</Text>
                <Text style={styles.forYouStatLabel}>Outfits Today</Text>
              </View>
              <View style={styles.forYouStatDivider} />
              <View style={styles.forYouStat}>
                <Text style={styles.forYouStatNumber}>{personalization?.recommendations?.makeup?.length || 2}</Text>
                <Text style={styles.forYouStatLabel}>Makeup Looks</Text>
              </View>
              <View style={styles.forYouStatDivider} />
              <View style={styles.forYouStat}>
                <Text style={styles.forYouStatNumber}>{personalization?.styleProfile?.celebrityMatches?.[0]?.match || 92}%</Text>
                <Text style={styles.forYouStatLabel}>Match Score</Text>
              </View>
            </View>
            <View style={styles.forYouCTA}>
              <Text style={styles.forYouCTAText}>Explore Addilets</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Trending Styles Section */}
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Styles</Text>
          <TouchableOpacity onPress={() => router.push('/style')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={trendingStyles}
          keyExtractor={(item) => `style-${item}`}
          renderItem={({ item }) => renderHorizontalItem({ item, icon: 'hanger', route: '/style' })}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: HORIZONTAL_CARD_WIDTH + 12,
            offset: (HORIZONTAL_CARD_WIDTH + 12) * index,
            index,
          })}
        />
      </View>

      {/* Trending Songs Section */}
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Songs</Text>
          <TouchableOpacity onPress={() => router.push('/trendingsongs')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={trendingSongs}
          keyExtractor={(item) => `song-${item}`}
          renderItem={({ item }) => renderHorizontalItem({ item, icon: 'music-note', route: '/trendingsongs' })}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: HORIZONTAL_CARD_WIDTH + 12,
            offset: (HORIZONTAL_CARD_WIDTH + 12) * index,
            index,
          })}
        />
      </View>

      {/* Trending Movies Section */}
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Movies</Text>
          <TouchableOpacity onPress={() => router.push('/discover')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={trendingMovies}
          keyExtractor={(item) => `movie-${item}`}
          renderItem={({ item }) => renderHorizontalItem({ item, icon: 'movie', route: '/discover' })}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: HORIZONTAL_CARD_WIDTH + 12,
            offset: (HORIZONTAL_CARD_WIDTH + 12) * index,
            index,
          })}
        />
      </View>
    </View>
  ), [personalization, quickActions, trendingStyles, trendingSongs, trendingMovies, renderQuickAction, renderHorizontalItem]);

  // Main data for parent FlatList (empty - all content is in header)
  const mainData = useMemo(() => [], []);

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      style={styles.container}
    >
      <FlatList
        data={mainData}
        renderItem={() => null}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={() => 'main'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        removeClippedSubviews={true}
        windowSize={5}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 1,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  mainCTA: {
    width: '100%',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '47%',
    aspectRatio: 1.5,
  },
  quickActionGradient: {
    flex: 1,
    borderRadius: SIZES.borderRadiusCard,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...SHADOWS.card,
  },
  quickActionLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  forYouSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  forYouHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  forYouCard: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  forYouGradient: {
    padding: 20,
  },
  forYouContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  forYouIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forYouText: {
    flex: 1,
    marginLeft: 16,
  },
  forYouTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  forYouSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  forYouStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  forYouStat: {
    alignItems: 'center',
  },
  forYouStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  forYouStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  forYouStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  forYouCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  forYouCTAText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  trendingSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingRight: 20,
  },
  trendingCard: {
    width: HORIZONTAL_CARD_WIDTH,
    marginRight: 12,
  },
  trendingImagePlaceholder: {
    width: HORIZONTAL_CARD_WIDTH,
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
});
