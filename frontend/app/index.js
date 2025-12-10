import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../constants/theme';
import GradientButton from '../components/GradientButton';
import { API_BASE_URL } from '../config';

export default function HomeScreen() {
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Quick action buttons
  const quickActions = [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist' },
    { id: 'ai-wardrobe', label: 'AI Wardrobe', icon: 'hanger', route: '/aiwardrobe' },
    { id: 'body-scanner', label: 'Body Scanner', icon: 'tape-measure', route: '/bodyscanner' },
    { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/favorites' },
  ];

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
            {quickActions.map((action) => (
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
            ))}
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
                  <Text style={styles.forYouStatNumber}>3</Text>
                  <Text style={styles.forYouStatLabel}>Outfits Today</Text>
                </View>
                <View style={styles.forYouStatDivider} />
                <View style={styles.forYouStat}>
                  <Text style={styles.forYouStatNumber}>2</Text>
                  <Text style={styles.forYouStatLabel}>Makeup Looks</Text>
                </View>
                <View style={styles.forYouStatDivider} />
                <View style={styles.forYouStat}>
                  <Text style={styles.forYouStatNumber}>92%</Text>
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.trendingCard}
                onPress={() => router.push('/style')}
              >
                <View style={styles.trendingImagePlaceholder}>
                  <MaterialCommunityIcons name="hanger" size={32} color={COLORS.textMuted} />
                </View>
                <Text style={styles.trendingCardTitle}>Style {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Songs Section */}
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Songs</Text>
            <TouchableOpacity onPress={() => router.push('/trendingsongs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.trendingCard}
                onPress={() => router.push('/trendingsongs')}
              >
                <View style={styles.trendingImagePlaceholder}>
                  <MaterialCommunityIcons name="music-note" size={32} color={COLORS.textMuted} />
                </View>
                <Text style={styles.trendingCardTitle}>Song {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Movies Section */}
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>
            <TouchableOpacity onPress={() => router.push('/discover')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.trendingCard}
                onPress={() => router.push('/discover')}
              >
                <View style={styles.trendingImagePlaceholder}>
                  <MaterialCommunityIcons name="movie" size={32} color={COLORS.textMuted} />
                </View>
                <Text style={styles.trendingCardTitle}>Movie {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    width: '48%',
  },
  quickActionGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: SIZES.borderRadiusCard,
    gap: 12,
  },
  quickActionLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  trendingSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  trendingCard: {
    width: 140,
  },
  trendingImagePlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  forYouSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  forYouHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forYouCard: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  forYouGradient: {
    padding: 24,
  },
  forYouContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    marginBottom: 16,
  },
  forYouStat: {
    alignItems: 'center',
  },
  forYouStatNumber: {
    fontSize: 22,
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
    height: 32,
    backgroundColor: 'rgba(177, 76, 255, 0.3)',
  },
  forYouCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  forYouCTAText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
