import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { COLORS, GRADIENTS, SPACING, CARD_SHADOW } from '../constants/theme';
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

export default function BeautyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/discover';
  const { personalization } = useAddilets();
  const flatListRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('natural');
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const makeupRecommendations = personalization?.recommendations?.makeup || [];

  // Load looks
  const loadLooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/beauty/${selectedCategory}`);
      const data = await response.json();
      const normalizedLooks = (data.looks || []).map(asCardItem);
      setLooks(normalizedLooks);
    } catch (error) {
      console.error('Error loading beauty looks:', error);
      setError('Unable to load beauty looks. Please try again.');
      setLooks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadLooks();
  }, [selectedCategory]);

  const handleBack = () => {
    router.push(returnPath);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    trackCategoryView(selectedCategory, 'beauty');
    await loadLooks();
    setRefreshing(false);
  }, [loadLooks, selectedCategory]);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedCategory]);

  const handleLookPress = useCallback((look) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(look), returnPath: '/beauty' }
    });
  }, []);

  const renderBeautyItem = useCallback(({ item }) => (
    <BeautyCard
      item={item}
      onPress={() => handleLookPress(item)}
      style={styles.beautyCard}
    />
  ), [handleLookPress]);

  // Scrollable header - scrolls away with content for max browsing space
  const ListHeaderComponent = useCallback(() => (
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
  ), [handleBack, selectedCategory, handleCategorySelect, loading, looks.length, makeupRecommendations]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="lipstick" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>No looks found</Text>
      <Text style={styles.emptySubtext}>Try a different category</Text>
    </View>
  ), []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={looks}
        renderItem={renderBeautyItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={2}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={loading ? <SkeletonGrid /> : renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={5}
        initialNumToRender={6}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.bottomPadding,
  },
  // Header
  listHeader: {
    marginBottom: 8,
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
    paddingBottom: 16,
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
  // Grid
  beautyCard: {
    flex: 1,
    margin: 6,
    maxWidth: '48%',
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
