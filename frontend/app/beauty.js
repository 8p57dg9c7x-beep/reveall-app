import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import BeautyCard from '../components/BeautyCard';
import { SkeletonOutfitCard } from '../components/SkeletonLoader';

const CATEGORIES = [
  { id: 'natural', name: 'Natural', icon: 'leaf' },
  { id: 'glam', name: 'Glam', icon: 'shimmer' },
  { id: 'smokey', name: 'Smokey Eye', icon: 'eye' },
  { id: 'everyday', name: 'Everyday', icon: 'calendar-today' },
  { id: 'festival', name: 'Festival', icon: 'party-popper' },
];

const CARD_HEIGHT = 310;

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

  const renderLookCard = useCallback(({ item, index }) => {
    const isLeft = index % 2 === 0;
    return (
      <BeautyCard
        item={item}
        isLeft={isLeft}
        onPress={() => handleLookPress(item)}
      />
    );
  }, [handleLookPress]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.header}>
        <MaterialCommunityIcons name="lipstick" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Beauty Discovery</Text>
        <Text style={styles.headerSubtitle}>Celebrity makeup looks & dupes</Text>
      </View>

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
  ), [selectedCategory, renderCategoryButton]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="lipstick" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Looks Yet</Text>
      <Text style={styles.emptySubtitle}>
        {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} looks will appear here once added.
      </Text>
    </View>
  ), [selectedCategory]);

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
        data={looks}
        renderItem={renderLookCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.columnWrapper}
        getItemLayout={(data, index) => {
          const row = Math.floor(index / 2);
          return {
            length: CARD_HEIGHT,
            offset: CARD_HEIGHT * row + (16 * row),
            index,
          };
        }}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
        initialNumToRender={4}
        updateCellsBatchingPeriod={100}
        legacyImplementation={false}
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
  columnWrapper: {
    paddingHorizontal: 16,
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
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
