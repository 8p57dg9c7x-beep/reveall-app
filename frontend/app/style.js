import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import OutfitCard from '../components/OutfitCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';

const STYLE_CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'bohemian', name: 'Bohemian', icon: 'flower' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'shoe-heel' },
];

export default function StyleDiscovery() {
  const flatListRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [celebrityOutfits, setCelebrityOutfits] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCelebrityOutfits();
  }, []);

  useEffect(() => {
    loadOutfits();
  }, [selectedCategory]);

  const loadOutfits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/outfits/${selectedCategory}`);
      const data = await response.json();
      setOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setError('Unable to load outfits. Please try again.');
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadCelebrityOutfits = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outfits/celebrity`);
      const data = await response.json();
      setCelebrityOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading celebrity outfits:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOutfits();
    await loadCelebrityOutfits();
    setRefreshing(false);
  }, [loadOutfits, loadCelebrityOutfits]);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId === selectedCategory) return;
    setSelectedCategory(categoryId);
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [selectedCategory]);

  const handleCelebrityPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit) },
    });
  }, []);

  const handleOutfitPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit) },
    });
  }, []);

  const renderCategoryButton = useCallback((category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <MaterialCommunityIcons
        name={category.icon}
        size={20}
        color={selectedCategory === category.id ? COLORS.textPrimary : COLORS.textSecondary}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategorySelect]);

  const renderOutfitRow = useCallback(({ item, index }) => {
    const isLeft = index % 2 === 0;
    const nextItem = index < outfits.length - 1 ? outfits[index + 1] : null;

    if (!isLeft) return null;

    return (
      <View style={styles.row}>
        <OutfitCard
          item={item}
          onPress={() => handleOutfitPress(item)}
          isLeft={true}
        />
        {nextItem && (
          <OutfitCard
            item={nextItem}
            onPress={() => handleOutfitPress(nextItem)}
            isLeft={false}
          />
        )}
      </View>
    );
  }, [outfits, handleOutfitPress]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="hanger" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Outfits Found</Text>
      <Text style={styles.emptySubtitle}>
        We're working on adding more {selectedCategory} styles
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadOutfits}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color={COLORS.error || '#ff4444'} />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadOutfits}>
        <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Style Discovery</Text>
          <Text style={styles.headerSubtitle}>Find your perfect look</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoritesButton}
          onPress={() => router.push('/saved-outfits')}
        >
          <MaterialCommunityIcons name="heart" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {celebrityOutfits.length > 0 && (
        <View style={styles.celebritySection}>
          <Text style={styles.sectionTitle}>Dress Like Your Icon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.celebrityScrollContent}
          >
            {celebrityOutfits.map((outfit) => (
              <TouchableOpacity
                key={outfit.id}
                style={styles.celebrityCard}
                onPress={() => handleCelebrityPress(outfit)}
              >
                <View style={styles.celebrityImageContainer}>
                  <Text style={styles.celebrityPlaceholder}>Celebrity</Text>
                </View>
                <Text style={styles.celebrityName} numberOfLines={2}>
                  {outfit.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {STYLE_CATEGORIES.map(renderCategoryButton)}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && outfits.length === 0 ? (
        <ScrollView style={styles.scrollView}>
          <ListHeaderComponent />
          <SkeletonGrid />
        </ScrollView>
      ) : error ? (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
          }
        >
          <ListHeaderComponent />
          {renderErrorState()}
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={outfits}
          renderItem={renderOutfitRow}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  favoritesButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  celebritySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  celebrityScrollContent: {
    paddingRight: 16,
    gap: 16,
  },
  celebrityCard: {
    width: 120,
  },
  celebrityImageContainer: {
    width: 120,
    height: 160,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrityPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  celebrityName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    gap: 12,
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});