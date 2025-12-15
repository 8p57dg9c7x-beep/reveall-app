import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Image,
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

const STYLE_CATEGORIES = [
  { id: 'streetwear', name: 'Street', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'bohemian', name: 'Boho', icon: 'flower' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'shoe-heel' },
];

// Individual Outfit Card Component
const OutfitCardItem = React.memo(({ item, onPress, isLeft }) => (
  <TouchableOpacity
    style={[styles.outfitCard, isLeft ? styles.cardLeft : styles.cardRight]}
    onPress={() => onPress(item)}
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
));

export default function StyleDiscovery() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/discover';
  const scrollRef = useRef(null);
  
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load outfits when category changes
  const loadOutfits = useCallback(async (category) => {
    setLoading(true);
    setOutfits([]); // Clear immediately for clean transition
    
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
      // Scroll to top first
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      // Update category (triggers data reload)
      setSelectedCategory(categoryId);
    }
  }, [selectedCategory]);

  const handleOutfitPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit), returnPath: '/style' },
    });
  }, []);

  // Pair outfits into rows for 2-column grid
  const outfitRows = [];
  for (let i = 0; i < outfits.length; i += 2) {
    outfitRows.push({
      id: `row-${i}`,
      left: outfits[i],
      right: outfits[i + 1] || null,
    });
  }

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="hanger" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>No outfits found</Text>
      <Text style={styles.emptySubtext}>Try a different style category</Text>
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

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <SkeletonGrid />
          </View>
        ) : outfits.length === 0 ? (
          renderEmpty()
        ) : (
          <View style={styles.gridContainer}>
            {outfitRows.map((row) => (
              <View key={row.id} style={styles.row}>
                <OutfitCardItem item={row.left} onPress={handleOutfitPress} isLeft={true} />
                {row.right ? (
                  <OutfitCardItem item={row.right} onPress={handleOutfitPress} isLeft={false} />
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
  // Outfit Card - Using flex: 1 for equal width columns
  outfitCard: {
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
