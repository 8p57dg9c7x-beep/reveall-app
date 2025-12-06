import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import OptimizedImage from '../components/OptimizedImage';
import OutfitCard from '../components/OutfitCard';
import { SkeletonOutfitCard } from '../components/SkeletonLoader';

const CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'tie' },
  { id: 'affordable', name: 'Affordable Fits', icon: 'tag-multiple' },
  { id: 'celebrity', name: 'Celebrity', icon: 'star' },
];

const CARD_HEIGHT = 310; // Fixed height for performance

export default function StyleScreen() {
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [outfits, setOutfits] = useState([]);
  const [celebrityOutfits, setCelebrityOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = React.useRef(null);

  useEffect(() => {
    loadOutfits();
    loadCelebrityOutfits();
  }, [selectedCategory]);

  const loadOutfits = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-mvp.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/outfits/${selectedCategory}`);
      const data = await response.json();
      setOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadCelebrityOutfits = useCallback(async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-mvp.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/outfits/celebrity`);
      const data = await response.json();
      setCelebrityOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading celebrity outfits:', error);
    }
  }, []);

  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    // Reset scroll position to top when switching categories
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 100);
  }, []);

  const handleOutfitPress = useCallback((item) => {
    router.push({
      pathname: '/outfitdetail',
      params: { 
        outfitData: JSON.stringify(item),
        returnPath: '/style'
      }
    });
  }, []);

  const handleCelebrityPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { 
        outfitData: JSON.stringify(outfit),
        returnPath: '/style'
      }
    });
  }, []);

  const renderCategoryButton = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? COLORS.textPrimary : COLORS.textSecondary}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategoryPress]);

  // Group items into rows of 2 for single-column FlatList
  const groupedOutfits = useMemo(() => {
    const groups = [];
    for (let i = 0; i < outfits.length; i += 2) {
      groups.push({
        id: `row-${i}`,
        items: [outfits[i], outfits[i + 1]].filter(Boolean)
      });
    }
    return groups;
  }, [outfits]);

  const renderOutfitRow = useCallback(({ item: row }) => {
    return (
      <View style={styles.outfitRow}>
        {row.items.map((item, index) => (
          <OutfitCard
            key={item.id}
            item={item}
            isLeft={index === 0}
            onPress={() => handleOutfitPress(item)}
          />
        ))}
        {/* Add spacer if only one item in row */}
        {row.items.length === 1 && <View style={styles.cardSpacer} />}
      </View>
    );
  }, [handleOutfitPress]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.header}>
        <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Style Discovery</Text>
        <Text style={styles.headerSubtitle}>Curated outfit inspiration</Text>
      </View>

      {/* Dress Like Your Icon Section */}
      {celebrityOutfits.length > 0 && (
        <View style={styles.celebritySection}>
          <View style={styles.celebritySectionHeader}>
            <MaterialCommunityIcons name="star" size={24} color={COLORS.accent} />
            <Text style={styles.celebritySectionTitle}>Dress Like Your Icon</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.celebrityScroll}
            contentContainerStyle={styles.celebrityScrollContent}
            nestedScrollEnabled
          >
            {celebrityOutfits.map((outfit) => (
              <TouchableOpacity
                key={outfit.id}
                style={styles.celebrityCard}
                onPress={() => handleCelebrityPress(outfit)}
              >
                <OptimizedImage source={{ uri: outfit.image }} style={styles.celebrityImage} />
                <View style={styles.celebrityInfo}>
                  <Text style={styles.celebrityName}>{outfit.celebrity}</Text>
                  <Text style={styles.celebrityTitle} numberOfLines={1}>{outfit.title}</Text>
                  {outfit.priceRange && (
                    <Text style={styles.celebrityPrice}>{outfit.priceRange}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Filters */}
      <FlatList
        horizontal
        data={CATEGORIES}
        renderItem={renderCategoryButton}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      />
    </View>
  ), [celebrityOutfits, selectedCategory, handleCelebrityPress, renderCategoryButton]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="hanger" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Outfits Yet</Text>
      <Text style={styles.emptySubtitle}>
        {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} outfits will appear here once added.
      </Text>
    </View>
  ), [selectedCategory]);

  const renderSkeletonRows = useCallback(() => {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4].map((row) => (
          <View key={row} style={styles.skeletonRow}>
            <SkeletonOutfitCard />
            <SkeletonOutfitCard />
          </View>
        ))}
      </View>
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.skeletonGrid}>
          <SkeletonOutfitCard />
          <SkeletonOutfitCard />
        </View>
      </View>
    );
  }, [loading]);

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={[styles.container, { pointerEvents: 'box-none' }]}
    >
      <FlatList
        ref={flatListRef}
        data={groupedOutfits}
        renderItem={renderOutfitRow}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={(data, index) => ({
          length: CARD_HEIGHT + 16,
          offset: (CARD_HEIGHT + 16) * index,
          index,
        })}
        maxToRenderPerBatch={3}
        windowSize={4}
        removeClippedSubviews={Platform.OS !== 'web'}
        initialNumToRender={4}
        updateCellsBatchingPeriod={100}
        legacyImplementation={false}
        scrollEventThrottle={16}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 120,
  },
  outfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  celebritySection: {
    marginBottom: 24,
  },
  celebritySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  celebritySectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  celebrityScroll: {
    flexGrow: 0,
  },
  celebrityScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  celebrityCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  celebrityImage: {
    width: 160,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  celebrityInfo: {
    padding: 12,
  },
  celebrityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 4,
  },
  celebrityTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  celebrityPrice: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  categoriesContainer: {
    maxHeight: 56,
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
