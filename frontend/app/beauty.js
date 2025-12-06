import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import OptimizedImage from '../components/OptimizedImage';
import { SkeletonOutfitCard } from '../components/SkeletonLoader';

const CATEGORIES = [
  { id: 'natural', name: 'Natural', icon: 'leaf' },
  { id: 'glam', name: 'Glam', icon: 'shimmer' },
  { id: 'smokey', name: 'Smokey Eye', icon: 'eye' },
  { id: 'everyday', name: 'Everyday', icon: 'calendar-today' },
  { id: 'festival', name: 'Festival', icon: 'party-popper' },
];

export default function BeautyScreen() {
  const [selectedCategory, setSelectedCategory] = useState('natural');
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLooks();
  }, [selectedCategory]);

  const loadLooks = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-mvp.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/beauty/${selectedCategory}`);
      const data = await response.json();
      setLooks(data.looks || []);
    } catch (error) {
      console.error('Error loading beauty looks:', error);
      setLooks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleLookPress = useCallback((item) => {
    router.push({
      pathname: '/beautydetail',
      params: { 
        lookData: JSON.stringify(item),
        returnPath: '/beauty'
      }
    });
  }, []);

  const renderCategoryButton = useCallback(({ item }) => (
    <TouchableOpacity
      key={item.id}
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

  const renderLookCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.lookCard}
      activeOpacity={0.7}
      onPress={() => handleLookPress(item)}
    >
      <OptimizedImage source={{ uri: item.image }} style={styles.lookImage} />
      <View style={styles.lookInfo}>
        <Text style={styles.lookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.celebrity} numberOfLines={1}>{item.celebrity}</Text>
        <Text style={styles.priceRange}>{item.priceRange || 'View Details'}</Text>
      </View>
    </TouchableOpacity>
  ), [handleLookPress]);

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={[styles.container, { pointerEvents: 'box-none' }]}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="lipstick" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Beauty Discovery</Text>
          <Text style={styles.headerSubtitle}>Celebrity makeup looks & dupes</Text>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
          nestedScrollEnabled
          removeClippedSubviews
        >
          {CATEGORIES.map((item) => renderCategoryButton({ item }))}
        </ScrollView>

        {/* Beauty Looks Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.skeletonGrid}>
              <SkeletonOutfitCard />
              <SkeletonOutfitCard />
              <SkeletonOutfitCard />
              <SkeletonOutfitCard />
            </View>
          </View>
        ) : looks.length > 0 ? (
          <View style={styles.flashListContainer}>
            <FlashList
              data={looks}
              renderItem={renderLookCard}
              estimatedItemSize={300}
              numColumns={2}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              contentContainerStyle={styles.flashListContent}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="lipstick" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Looks Yet</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} looks will appear here once added.
            </Text>
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
    paddingBottom: 120,
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
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  flashListContainer: {
    flex: 1,
    minHeight: 400,
    paddingHorizontal: 16,
  },
  flashListContent: {
    paddingBottom: 20,
  },
  lookCard: {
    flex: 0.48,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lookImage: {
    width: '100%',
    height: 240,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  lookInfo: {
    padding: 12,
  },
  lookTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  celebrity: {
    color: COLORS.accent,
    fontSize: 12,
    marginBottom: 4,
  },
  priceRange: {
    color: COLORS.textSecondary,
    fontSize: 12,
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
