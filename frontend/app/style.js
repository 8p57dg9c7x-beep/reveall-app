import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl, 
  Image,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import GradientChip from '../components/GradientChip';
import { asCardItem } from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.screenHorizontal * 2 - 12) / 2;

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

  // Load outfits when category changes
  const loadOutfits = useCallback(async (category) => {
    setLoading(true);
    // Clear previous data immediately for clean transition
    setOutfits([]);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/outfits/${category}`);
      const data = await response.json();
      const normalizedOutfits = (data.outfits || []).map(asCardItem);
      setOutfits(normalizedOutfits);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and category change handler
  useEffect(() => {
    loadOutfits(selectedCategory);
  }, [selectedCategory, loadOutfits]);

  const handleBack = () => {
    router.push(returnPath);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOutfits(selectedCategory);
    setRefreshing(false);
  }, [loadOutfits, selectedCategory]);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId !== selectedCategory) {
      // Reset scroll position first
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      // Then update category (which triggers data reload)
      setSelectedCategory(categoryId);
    }
  }, [selectedCategory]);

  const handleOutfitPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit), returnPath: '/style' },
    });
  }, []);

  // Render individual outfit card
  const renderOutfitCard = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={[styles.outfitCard, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}
      onPress={() => handleOutfitPress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.outfitImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.outfitOverlay}
      >
        {item.gender && (
          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>{item.gender.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
        {item.priceRange && (
          <Text style={styles.outfitPrice}>{item.priceRange}</Text>
        )}
      </LinearGradient>
      <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
        <MaterialCommunityIcons name="heart-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleOutfitPress]);

  // Scrollable header that moves with content
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
          <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
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
        {loading ? 'Loading...' : `${outfits.length} ${STYLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || ''} outfits`}
      </Text>
    </View>
  ), [handleBack, selectedCategory, handleCategorySelect, loading, outfits.length]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="hanger" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>No outfits found</Text>
      <Text style={styles.emptySubtext}>Try a different style category</Text>
    </View>
  ), []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={outfits}
        renderItem={renderOutfitCard}
        keyExtractor={(item, index) => `${selectedCategory}-${item.id || index}`}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
        // Force re-render when category changes
        extraData={selectedCategory}
        // Performance optimizations
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 220,
          offset: 220 * Math.floor(index / 2),
          index,
        })}
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
    flexGrow: 1,
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
  columnWrapper: {
    paddingHorizontal: SPACING.screenHorizontal,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Outfit Card
  outfitCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...CARD_SHADOW,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
  },
  outfitOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
  },
  genderBadge: {
    position: 'absolute',
    top: -28,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  genderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  outfitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  outfitPrice: {
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
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
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
