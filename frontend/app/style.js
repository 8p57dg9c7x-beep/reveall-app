import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import OutfitCard from '../components/OutfitCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import GradientChip from '../components/GradientChip';
import { asCardItem } from '../utils/helpers';

const STYLE_CATEGORIES = [
  { id: 'streetwear', name: 'Street', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'bohemian', name: 'Boho', icon: 'flower' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'shoe-heel' },
];

export default function StyleDiscovery() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/discover';
  const flatListRef = useRef(null);
  
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load outfits
  const loadOutfits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/outfits/${selectedCategory}`);
      const data = await response.json();
      const normalizedOutfits = (data.outfits || []).map(asCardItem);
      setOutfits(normalizedOutfits);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadOutfits();
  }, [selectedCategory]);

  const handleBack = () => {
    router.push(returnPath);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOutfits();
    setRefreshing(false);
  }, [loadOutfits]);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
    }
  }, [selectedCategory]);

  const handleOutfitPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit), returnPath: '/style' },
    });
  }, []);

  const renderOutfitRow = useCallback(({ item, index }) => {
    const isLeft = index % 2 === 0;
    const nextItem = index < outfits.length - 1 ? outfits[index + 1] : null;

    if (!isLeft) return null;

    return (
      <View style={styles.row}>
        <OutfitCard item={item} onPress={() => handleOutfitPress(item)} isLeft={true} />
        {nextItem && (
          <OutfitCard item={nextItem} onPress={() => handleOutfitPress(nextItem)} isLeft={false} />
        )}
      </View>
    );
  }, [outfits, handleOutfitPress]);

  // Minimal header that scrolls with content
  const ListHeaderComponent = useCallback(() => (
    <View style={styles.listHeader}>
      {/* Back + Title Row */}
      <View style={styles.titleRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Style Discovery</Text>
        <TouchableOpacity 
          onPress={() => router.push('/saved-outfits')}
          style={styles.actionButton}
        >
          <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Category Filters - Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {STYLE_CATEGORIES.map((category) => (
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

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {loading ? 'Loading...' : `${outfits.length} outfits`}
      </Text>
    </View>
  ), [handleBack, selectedCategory, handleCategorySelect, loading, outfits.length]);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="hanger" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>No outfits found</Text>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={outfits}
        renderItem={renderOutfitRow}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={loading ? <SkeletonGrid /> : renderEmpty}
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
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        removeClippedSubviews={true}
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
  resultsCount: {
    paddingHorizontal: SPACING.screenHorizontal,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  // Grid
  row: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenHorizontal,
    justifyContent: 'space-between',
    marginBottom: SPACING.cardGap,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 12,
  },
});
