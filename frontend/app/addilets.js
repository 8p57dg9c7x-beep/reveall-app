import React, { useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

// Fixed heights for virtualization
const CELEB_CARD_WIDTH = 140;
const CELEB_CARD_HEIGHT = 200;
const MAKEUP_CARD_WIDTH = 160;
const MAKEUP_CARD_HEIGHT = 220;
const CAPSULE_ITEM_WIDTH = (width - 60) / 2;

// Memoized components
const CelebCard = memo(({ celeb }) => (
  <View style={styles.celebCard}>
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
));

const MakeupCard = memo(({ makeup }) => (
  <TouchableOpacity style={styles.makeupCard} activeOpacity={0.8}>
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
));

const OutfitRecCard = memo(({ rec }) => (
  <TouchableOpacity style={styles.recCard} activeOpacity={0.8}>
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
));

const CapsuleItem = memo(({ item }) => (
  <View style={styles.capsuleItem}>
    <Image source={{ uri: item.image }} style={styles.capsuleImage} />
    <Text style={styles.capsuleName}>{item.name}</Text>
  </View>
));

// Horizontal FlatList wrapper with optimization
const HorizontalList = memo(({ data, renderItem, keyPrefix, itemWidth }) => {
  const getItemLayout = useCallback((data, index) => ({
    length: itemWidth + 16,
    offset: (itemWidth + 16) * index,
    index,
  }), [itemWidth]);

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${keyPrefix}-${item.id || item.name || index}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScroll}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={3}
      removeClippedSubviews={true}
      getItemLayout={getItemLayout}
    />
  );
});

export default function AddiletsScreen() {
  const { personalization, loading, refreshPersonalization } = useAddilets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/stylelab';

  // Handle back navigation
  const handleBack = () => {
    router.push(returnPath);
  };

  // Render empty loading state
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

  // Memoized render functions
  const renderCelebItem = useCallback(({ item }) => <CelebCard celeb={item} />, []);
  const renderMakeupItem = useCallback(({ item }) => <MakeupCard makeup={item} />, []);
  const renderOutfitItem = useCallback(({ item }) => <OutfitRecCard rec={item} />, []);

  // List header component containing all sections
  const ListHeaderComponent = useCallback(() => (
    <View>
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
        <HorizontalList 
          data={styleProfile.celebrityMatches} 
          renderItem={renderCelebItem} 
          keyPrefix="celeb"
          itemWidth={CELEB_CARD_WIDTH}
        />
      </View>

      {/* Daily Outfit Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Outfit Picks</Text>
          <MaterialCommunityIcons name="weather-sunny" size={20} color={COLORS.accent} />
        </View>
        {dailyRecommendations.map((rec) => (
          <OutfitRecCard key={rec.id} rec={rec} />
        ))}
      </View>

      {/* Makeup Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Makeup Look Suggestions</Text>
        <HorizontalList 
          data={makeupRecommendations} 
          renderItem={renderMakeupItem} 
          keyPrefix="makeup"
          itemWidth={MAKEUP_CARD_WIDTH}
        />
      </View>

      {/* Seasonal Capsule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Seasonal Capsule</Text>
        <Text style={styles.sectionSubtitle}>Essential items for your wardrobe</Text>
        <View style={styles.capsuleGrid}>
          {seasonalCapsule.map((item) => (
            <CapsuleItem key={item.id} item={item} />
          ))}
        </View>
      </View>

      {/* Refresh Button */}
      <View style={styles.section}>
        <GradientButton
          title="Generate New Recommendations"
          onPress={refreshPersonalization}
          icon={<MaterialCommunityIcons name="autorenew" size={20} color="#fff" />}
          style={styles.refreshMainButton}
        />
      </View>

      <View style={styles.bottomPadding} />
    </View>
  ), [styleProfile, dailyRecommendations, makeupRecommendations, seasonalCapsule, renderCelebItem, renderMakeupItem, refreshPersonalization]);

  // Empty data for parent FlatList
  const emptyData = useMemo(() => [], []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="star-four-points" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Addilets</Text>
        </View>
        <TouchableOpacity onPress={refreshPersonalization} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={emptyData}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.headerPaddingTop,
    paddingBottom: SPACING.headerPaddingBottom,
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
    marginBottom: SPACING.sectionGap,
    paddingHorizontal: SPACING.screenHorizontal,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sectionTitleToContent,
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
    ...CARD_SHADOW,
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
    width: CELEB_CARD_WIDTH,
    height: CELEB_CARD_HEIGHT,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginRight: SPACING.cardGap,
    ...CARD_SHADOW,
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
    marginBottom: SPACING.cardGap,
    ...CARD_SHADOW,
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
    gap: 16,
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
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  confidenceBadge: {
    height: 20,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  makeupCard: {
    width: MAKEUP_CARD_WIDTH,
    height: MAKEUP_CARD_HEIGHT,
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
    padding: 12,
  },
  makeupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  makeupVibe: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
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
    gap: 16,
  },
  capsuleItem: {
    width: CAPSULE_ITEM_WIDTH,
    alignItems: 'center',
  },
  capsuleImage: {
    width: CAPSULE_ITEM_WIDTH,
    height: CAPSULE_ITEM_WIDTH,
    borderRadius: SIZES.borderRadiusCard,
    marginBottom: 8,
  },
  capsuleName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  refreshMainButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 80,
  },
});
