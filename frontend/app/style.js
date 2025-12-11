import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../constants/theme';
import OutfitCard from '../components/OutfitCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import GradientChip from '../components/GradientChip';
import FadeInView from '../components/FadeInView';
import { trackCategoryView } from '../services/analytics';
import { asCardItem } from '../utils/helpers';

const STYLE_CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'bohemian', name: 'Bohemian', icon: 'flower' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'shoe-heel' },
];

export default function StyleDiscovery() {
  const navigation = useNavigation();
  const { getRecommendedOutfits } = useAddilets();
  const flatListRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [celebrityOutfits, setCelebrityOutfits] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [addiletsRecommendations, setAddiletsRecommendations] = useState([]);

  // Load Addilets recommendations
  useEffect(() => {
    const recommendations = getRecommendedOutfits(3);
    setAddiletsRecommendations(recommendations);
  }, []);

  // Load celebrity outfits with cleanup
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/outfits/celebrity`);
        const data = await response.json();
        if (isMounted) {
          // 🔥 NORMALIZE celebrity outfits
          const normalizedOutfits = (data.outfits || []).map(asCardItem);
          setCelebrityOutfits(normalizedOutfits);
        }
      } catch (err) {
        console.error('Error loading celebrity outfits:', err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load outfits with cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchOutfits = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const url = `${API_BASE_URL}/api/outfits/${selectedCategory}`;
        console.log('🔍 Loading outfits from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Loaded outfits:', data.outfits?.length || 0);
        
        if (isMounted) {
          // 🔥 NORMALIZE all outfits before setting state
          const normalizedOutfits = (data.outfits || []).map(asCardItem);
          setOutfits(normalizedOutfits);
        }
      } catch (err) {
        console.error('❌ Error loading outfits:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOutfits();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // Fix back button freeze
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 50);
    });

    return unsubscribe;
  }, [navigation]);

  const loadOutfits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Track category view
    trackCategoryView(selectedCategory, 'outfit');
    
    try {
      const url = `${API_BASE_URL}/api/outfits/${selectedCategory}`;
      console.log('🔍 Loading outfits from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Loaded outfits:', data.outfits?.length || 0);
      
      // 🔥 NORMALIZE all outfits
      const normalizedOutfits = (data.outfits || []).map(asCardItem);
      setOutfits(normalizedOutfits);
    } catch (error) {
      console.error('❌ Error loading outfits:', error);
      console.error('   URL:', `${API_BASE_URL}/api/outfits/${selectedCategory}`);
      console.error('   Error details:', error.message);
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
      // 🔥 NORMALIZE celebrity outfits
      const normalizedOutfits = (data.outfits || []).map(asCardItem);
      setCelebrityOutfits(normalizedOutfits);
    } catch (error) {
      console.error('Error loading celebrity outfits:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Trigger re-fetch by toggling category temporarily
    const current = selectedCategory;
    setSelectedCategory('');
    setTimeout(() => setSelectedCategory(current), 10);
    setRefreshing(false);
  }, [selectedCategory]);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId === selectedCategory) return;
    setSelectedCategory(categoryId);
    // Don't force scroll - let user maintain their position
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
    <GradientChip
      key={category.id}
      label={category.name}
      icon={category.icon}
      active={selectedCategory === category.id}
      onPress={() => handleCategorySelect(category.id)}
      style={{ marginRight: 12 }}
    />
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
      {/* Addilets For You Section */}
      {addiletsRecommendations.length > 0 && (
        <View style={styles.forYouSection}>
          <View style={styles.forYouHeader}>
            <View style={styles.forYouTitleRow}>
              <MaterialCommunityIcons name="star-four-points" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Picked For You</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/addilets')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.forYouSubtitle}>Based on your style profile</Text>
          <FlatList
            horizontal
            data={addiletsRecommendations}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item: rec }) => (
              <TouchableOpacity
                key={rec.id}
                style={styles.forYouCard}
                activeOpacity={0.8}
              >
                <Image source={{ uri: rec.image }} style={styles.forYouImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.forYouOverlay}
                >
                  <View style={styles.forYouBadge}>
                    <MaterialCommunityIcons name="star" size={12} color={COLORS.accent} />
                    <Text style={styles.forYouConfidence}>{rec.confidence}%</Text>
                  </View>
                  <Text style={styles.forYouTitle}>{rec.title}</Text>
                  <Text style={styles.forYouOccasion}>{rec.occasion}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forYouScrollContent}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 172,
              offset: 172 * index,
              index,
            })}
          />
        </View>
      )}
      
      {celebrityOutfits.length > 0 && (
        <View style={styles.celebritySection}>
          <Text style={styles.sectionTitle}>Dress Like Your Icon</Text>
          <FlatList
            horizontal
            data={celebrityOutfits}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item: outfit }) => (
              <TouchableOpacity
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
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.celebrityScrollContent}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 136,
              offset: 136 * index,
              index,
            })}
          />
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      style={styles.container}
    >
      {/* Fixed Header - Outside FlatList */}
      <View style={styles.fixedHeader}>
        <FadeInView style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Style Discovery</Text>
            <Text style={styles.headerSubtitle}>Find your perfect look</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => router.push('/universal-search')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.favoritesButton}
              onPress={() => router.push('/saved-outfits')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="heart" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Fixed Category Filter Bar */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesWrapper}>
            {STYLE_CATEGORIES.map(renderCategoryButton)}
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
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
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
          updateCellsBatchingPeriod={50}
          getItemLayout={(data, index) => ({
            length: 260,
            offset: 260 * Math.floor(index / 2),
            index,
          })}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fixedHeader: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
    borderRadius: SIZES.borderRadiusCard,
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
  categoriesWrapper: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  categoriesContent: {
    gap: 12,
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    height: 44,
    minHeight: 44,
    maxHeight: 44,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
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
  // Addilets For You Section
  forYouSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forYouTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forYouSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  forYouScrollContent: {
    paddingRight: 20,
  },
  forYouCard: {
    width: 160,
    height: 220,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: COLORS.card,
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
    padding: 12,
  },
  forYouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  forYouConfidence: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  forYouTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  forYouOccasion: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
});