import React from 'react';
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
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function AddiletsScreen() {
  const { personalization, loading, refreshPersonalization } = useAddilets();

  if (!personalization || loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="shimmer" size={64} color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your style...</Text>
        </View>
      </LinearGradient>
    );
  }

  const styleProfile = personalization.styleProfile;
  const dailyRecommendations = personalization.recommendations.outfits;
  const makeupRecommendations = personalization.recommendations.makeup;
  const seasonalCapsule = personalization.recommendations.capsule;

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
        <TouchableOpacity onPress={refreshPersonalization} style={styles.refreshButton}>
          <MaterialCommunityIcons 
            name="refresh" 
            size={24} 
            color={COLORS.textPrimary} 
            style={loading && styles.spinning}
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
