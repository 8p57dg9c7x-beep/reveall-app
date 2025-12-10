import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFavorites } from '../contexts/FavoritesContext';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function AddiletsScreen() {
  const { favoriteOutfits, favoriteBeauty } = useFavorites();
  const [styleProfile, setStyleProfile] = useState(null);
  const [dailyRecommendations, setDailyRecommendations] = useState([]);
  const [makeupRecommendations, setMakeupRecommendations] = useState([]);
  const [seasonalCapsule, setSeasonalCapsule] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generatePersonalization();
  }, [favoriteOutfits, favoriteBeauty]);

  const generatePersonalization = () => {
    // Mock AI Logic - Analyze user's favorites and generate profile
    
    // Extract style tags from favorites
    const allTags = [];
    favoriteOutfits.forEach(item => {
      if (item.tags) allTags.push(...item.tags);
      if (item.category) allTags.push(item.category);
    });

    // Get top 3 most common styles
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    const topStyles = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Generate style profile
    const stylePersonalities = topStyles.length > 0 
      ? topStyles 
      : ['Minimalist', 'Casual', 'Versatile'];

    // Generate color palette based on favorites
    const colorPalette = [
      { name: 'Primary', color: '#1A1A1A', desc: 'Black' },
      { name: 'Accent', color: '#FFFFFF', desc: 'White' },
      { name: 'Highlight', color: '#B14CFF', desc: 'Purple' },
      { name: 'Secondary', color: '#FF6EC7', desc: 'Pink' },
    ];

    // Mock celebrity matches
    const celebrityMatches = [
      { name: 'Zendaya', match: 92, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
      { name: 'Timothée Chalamet', match: 88, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Hailey Bieber', match: 85, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    ];

    // Generate daily outfit recommendations
    const outfitRecs = [
      {
        id: 1,
        title: 'Morning Coffee Run',
        occasion: 'Casual',
        weather: 'Cool',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
        confidence: 94,
        reason: 'Based on your casual style preference',
      },
      {
        id: 2,
        title: 'Afternoon Meeting',
        occasion: 'Business Casual',
        weather: 'Indoor',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
        confidence: 89,
        reason: 'Matches your professional wardrobe',
      },
      {
        id: 3,
        title: 'Evening Dinner',
        occasion: 'Smart Casual',
        weather: 'Mild',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
        confidence: 91,
        reason: 'Perfect for your style profile',
      },
    ];

    // Generate makeup recommendations
    const makeupRecs = [
      {
        id: 1,
        title: 'Natural Glow',
        vibe: 'Effortless',
        image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&q=80',
        match: 95,
      },
      {
        id: 2,
        title: 'Soft Glam',
        vibe: 'Elegant',
        image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&q=80',
        match: 88,
      },
    ];

    // Seasonal capsule wardrobe
    const capsuleItems = [
      { id: 1, name: 'White Tee', category: 'tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80' },
      { id: 2, name: 'Black Jeans', category: 'bottoms', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80' },
      { id: 3, name: 'Sneakers', category: 'shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&q=80' },
      { id: 4, name: 'Blazer', category: 'outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=80' },
    ];

    setStyleProfile({
      personalities: stylePersonalities,
      colorPalette,
      celebrityMatches,
    });
    setDailyRecommendations(outfitRecs);
    setMakeupRecommendations(makeupRecs);
    setSeasonalCapsule(capsuleItems);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      generatePersonalization();
      setRefreshing(false);
    }, 1500);
  };

  if (!styleProfile) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="shimmer" size={64} color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your style...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="star-four-points" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Addilets</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons 
            name="refresh" 
            size={24} 
            color={COLORS.textPrimary} 
            style={refreshing && styles.spinning}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Style Profile Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Style Profile</Text>
          <LinearGradient
            colors={['rgba(177, 76, 255, 0.2)', 'rgba(177, 76, 255, 0.05)']}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <MaterialCommunityIcons name="account-star" size={48} color={COLORS.primary} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileTitle}>Style DNA</Text>
                <Text style={styles.profileSubtitle}>AI-Generated Profile</Text>
              </View>
            </View>

            {/* Personality Tags */}
            <View style={styles.tagsContainer}>
              {styleProfile.personalities.map((tag, idx) => (
                <View key={idx} style={styles.personalityTag}>
                  <Text style={styles.personalityTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Color Palette */}
            <View style={styles.colorSection}>
              <Text style={styles.colorSectionTitle}>Your Color Palette</Text>
              <View style={styles.colorPalette}>
                {styleProfile.colorPalette.map((color, idx) => (
                  <View key={idx} style={styles.colorItem}>
                    <View style={[styles.colorCircle, { backgroundColor: color.color }]} />
                    <Text style={styles.colorName}>{color.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Celebrity Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Celebrity Style Matches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {styleProfile.celebrityMatches.map((celeb) => (
              <View key={celeb.name} style={styles.celebCard}>
                <Image source={{ uri: celeb.image }} style={styles.celebImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.celebOverlay}
                >
                  <Text style={styles.celebName}>{celeb.name}</Text>
                  <View style={styles.matchBadge}>
                    <MaterialCommunityIcons name="star" size={14} color={COLORS.accent} />
                    <Text style={styles.matchText}>{celeb.match}% Match</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Daily Outfit Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Outfit Picks</Text>
            <MaterialCommunityIcons name="weather-sunny" size={20} color={COLORS.accent} />
          </View>
          {dailyRecommendations.map((rec) => (
            <TouchableOpacity key={rec.id} style={styles.recCard} activeOpacity={0.8}>
              <Image source={{ uri: rec.image }} style={styles.recImage} />
              <View style={styles.recContent}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <View style={styles.recMeta}>
                  <View style={styles.recMetaItem}>
                    <MaterialCommunityIcons name="tag" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.recMetaText}>{rec.occasion}</Text>
                  </View>
                  <View style={styles.recMetaItem}>
                    <MaterialCommunityIcons name="weather-cloudy" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.recMetaText}>{rec.weather}</Text>
                  </View>
                </View>
                <Text style={styles.recReason}>{rec.reason}</Text>
                <View style={styles.confidenceBadge}>
                  <View style={[styles.confidenceBar, { width: `${rec.confidence}%` }]} />
                  <Text style={styles.confidenceText}>{rec.confidence}% Confidence</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Makeup Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Makeup Look Suggestions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {makeupRecommendations.map((makeup) => (
              <TouchableOpacity key={makeup.id} style={styles.makeupCard} activeOpacity={0.8}>
                <Image source={{ uri: makeup.image }} style={styles.makeupImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.makeupOverlay}
                >
                  <Text style={styles.makeupTitle}>{makeup.title}</Text>
                  <Text style={styles.makeupVibe}>{makeup.vibe}</Text>
                  <View style={styles.makeupMatch}>
                    <MaterialCommunityIcons name="heart" size={14} color="#FF6EC7" />
                    <Text style={styles.makeupMatchText}>{makeup.match}% Match</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Seasonal Capsule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Seasonal Capsule</Text>
          <Text style={styles.sectionSubtitle}>Essential items for your wardrobe</Text>
          <View style={styles.capsuleGrid}>
            {seasonalCapsule.map((item) => (
              <View key={item.id} style={styles.capsuleItem}>
                <Image source={{ uri: item.image }} style={styles.capsuleImage} />
                <Text style={styles.capsuleName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Refresh Button */}
        <GradientButton
          title="Generate New Recommendations"
          onPress={handleRefresh}
          icon={<MaterialCommunityIcons name="autorenew" size={20} color="#fff" />}
          style={styles.refreshMainButton}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinning: {
    // Animation would be added here
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileCard: {
    borderRadius: SIZES.borderRadiusCard,
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  personalityTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  personalityTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  colorSection: {
    marginTop: 8,
  },
  colorSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 16,
  },
  colorItem: {
    alignItems: 'center',
    gap: 8,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(177, 76, 255, 0.3)',
  },
  colorName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  celebCard: {
    width: 140,
    height: 200,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginRight: 16,
  },
  celebImage: {
    width: '100%',
    height: '100%',
  },
  celebOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  celebName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recImage: {
    width: 120,
    height: 160,
  },
  recContent: {
    flex: 1,
    padding: 16,
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  recMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  recMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recReason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  confidenceBadge: {
    position: 'relative',
    height: 20,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  confidenceBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 1,
  },
  makeupCard: {
    width: 180,
    height: 240,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginRight: 16,
  },
  makeupImage: {
    width: '100%',
    height: '100%',
  },
  makeupOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  makeupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  makeupVibe: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  makeupMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  makeupMatchText: {
    fontSize: 12,
    color: '#FF6EC7',
    fontWeight: '600',
  },
  capsuleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  capsuleItem: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  capsuleImage: {
    width: '100%',
    height: 140,
  },
  capsuleName: {
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  refreshMainButton: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
