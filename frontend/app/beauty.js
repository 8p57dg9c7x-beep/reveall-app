import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import BeautyCard from '../components/BeautyCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import { trackCategoryView } from '../services/analytics';
import { asCardItem } from '../utils/helpers';
import GradientChip from '../components/GradientChip';

const CATEGORIES = [
  { id: 'natural', name: 'Natural', icon: 'leaf' },
  { id: 'glam', name: 'Glam', icon: 'shimmer' },
  { id: 'bridal', name: 'Bridal', icon: 'heart' },
  { id: 'smokey', name: 'Smokey', icon: 'eye' },
  { id: 'bold', name: 'Bold', icon: 'lightning-bolt' },
  { id: 'everyday', name: 'Everyday', icon: 'calendar-today' },
];

// Individual Beauty Card Component
const BeautyCardItem = React.memo(({ item, onPress, isLeft }) => (
  <TouchableOpacity
    style={[styles.beautyCard, isLeft ? styles.cardLeft : styles.cardRight]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <Image source={{ uri: item.image }} style={styles.cardImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.85)']}
      style={styles.cardOverlay}
    >
      {item.difficulty && (
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.difficulty.toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      {item.duration && (
        <Text style={styles.cardDuration}>{item.duration}</Text>
      )}
    </LinearGradient>
    <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
      <MaterialCommunityIcons name="heart-outline" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  </TouchableOpacity>
));

export default function BeautyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/discover';
  const { personalization } = useAddilets();
  const scrollRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('natural');
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const makeupRecommendations = personalization?.recommendations?.makeup || [];

  // Load looks - clears data and resets state properly
  const loadLooks = useCallback(async (category) => {
    setLoading(true);
    setLooks([]); // Clear previous data immediately
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/beauty/${category}`);
      const data = await response.json();
      const normalizedLooks = (data.looks || []).map(asCardItem);
      setLooks(normalizedLooks);
    } catch (error) {
      console.error('Error loading beauty looks:', error);
      setLooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLooks(selectedCategory);
  }, [selectedCategory, loadLooks]);

  const handleBack = () => {
    router.push(returnPath);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    trackCategoryView(selectedCategory, 'beauty');
    await loadLooks(selectedCategory);
    setRefreshing(false);
  }, [loadLooks, selectedCategory]);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId !== selectedCategory) {
      // Reset scroll position first
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      // Update category (triggers data reload)
      setSelectedCategory(categoryId);
    }
  }, [selectedCategory]);

  const handleLookPress = useCallback((look) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(look), returnPath: '/beauty' }
    });
  }, []);

  // Pair looks into rows for 2-column grid
  const lookRows = [];
  for (let i = 0; i < looks.length; i += 2) {
    lookRows.push({
      id: `row-${i}`,
      left: looks[i],
      right: looks[i + 1] || null,
    });
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="lipstick" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Looks Found</Text>
      <Text style={styles.emptySubtext}>Try a different category or check back later</Text>
      <TouchableOpacity
        style={styles.exploreCTA}
        onPress={() => handleCategorySelect('natural')}
      >
        <Text style={styles.exploreCTAText}>Explore Natural Looks</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor={COLORS.primary} 
          />
        }
      >
        {/* Header */}
        <View style={styles.listHeader}>
          {/* Back + Title Row */}
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Beauty Hub</Text>
            <TouchableOpacity 
              onPress={() => router.push('/saved-beauty')}
              style={styles.actionButton}
            >
              <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Category Filters - Horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((category) => (
              <GradientChip
                key={category.id}
                label={category.name}
                icon={category.icon}
                active={selectedCategory === category.id}
                onPress={() => handleCategorySelect(category.id)}
                style={styles.categoryChip}
              />
            ))}
          </ScrollView>

          {/* Addilets Personalized Section (if available) */}
          {makeupRecommendations.length > 0 && (
            <View style={styles.forYouSection}>
              <View style={styles.forYouHeader}>
                <View style={styles.forYouTitleRow}>
                  <MaterialCommunityIcons name="star-four-points" size={16} color={COLORS.primary} />
                  <Text style={styles.forYouTitle}>For You</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/addilets')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.forYouScroll}
              >
                {makeupRecommendations.slice(0, 5).map((makeup) => (
                  <TouchableOpacity key={makeup.id} style={styles.forYouCard} activeOpacity={0.8}>
                    <Image source={{ uri: makeup.image }} style={styles.forYouImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.forYouOverlay}>
                      <Text style={styles.forYouLabel} numberOfLines={1}>{makeup.title}</Text>
                      <View style={styles.forYouMatch}>
                        <MaterialCommunityIcons name="heart" size={10} color="#FF6EC7" />
                        <Text style={styles.forYouMatchText}>{makeup.match}%</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Results count */}
          <Text style={styles.resultsCount}>
            {loading ? 'Loading...' : `${looks.length} ${CATEGORIES.find(c => c.id === selectedCategory)?.name || ''} looks`}
          </Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <SkeletonGrid />
          </View>
        ) : looks.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.gridContainer}>
            {lookRows.map((row) => (
              <View key={row.id} style={styles.row}>
                <BeautyCardItem item={row.left} onPress={handleLookPress} isLeft={true} />
                {row.right ? (
                  <BeautyCardItem item={row.right} onPress={handleLookPress} isLeft={false} />
                ) : (
                  <View style={styles.emptyCard} />
                )}
              </View>
            ))}
          </View>
        )}
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
  // Header
  listHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories
  categoriesScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 12,
  },
  categoryChip: {
    marginRight: 10,
  },
  // For You Section
  forYouSection: {
    marginBottom: 16,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 12,
  },
  forYouTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forYouTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  forYouScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  forYouCard: {
    width: 120,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    ...CARD_SHADOW,
  },
  forYouImage: {
    width: '100%',
    height: '100%',
  },
  forYouOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  forYouLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  forYouMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  forYouMatchText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6EC7',
  },
  // Results count
  resultsCount: {
    paddingHorizontal: SPACING.screenHorizontal,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  // Loading
  loadingContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  // Grid - Using flex for reliable 2-column layout
  gridContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  // Beauty Card - Using flex: 1 for equal width columns
  beautyCard: {
    flex: 1,
    height: 200,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...CARD_SHADOW,
  },
  cardLeft: {
    marginRight: 6,
  },
  cardRight: {
    marginLeft: 6,
  },
  emptyCard: {
    flex: 1,
    marginLeft: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
  },
  difficultyBadge: {
    position: 'absolute',
    top: -28,
    right: 12,
    backgroundColor: '#FF6EC7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State - Premium design with CTA
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreCTA: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreCTAText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
