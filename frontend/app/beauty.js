import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';
import BeautyCard from '../components/BeautyCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import { trackCategoryView } from '../services/analytics';
import { asCardItem } from '../utils/helpers';

const CATEGORIES = [
  { id: 'natural', name: 'Natural', icon: 'leaf' },
  { id: 'glam', name: 'Glam', icon: 'shimmer' },
  { id: 'bridal', name: 'Bridal', icon: 'heart' },
  { id: 'smokey', name: 'Smokey Eye', icon: 'eye' },
  { id: 'bold', name: 'Bold', icon: 'lightning-bolt' },
  { id: 'everyday', name: 'Everyday', icon: 'calendar-today' },
];

const HEADER_MAX_HEIGHT = 160;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function BeautyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { personalization } = useAddilets();
  const [selectedCategory, setSelectedCategory] = useState('natural');
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const makeupRecommendations = personalization?.recommendations?.makeup || [];
  const flatListRef = useRef(null);
  
  // Animated value for scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const categoryOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const categoryTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  // Load looks with cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchLooks = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/beauty/${selectedCategory}`);
        const data = await response.json();
        if (isMounted) {
          const normalizedLooks = (data.looks || []).map(asCardItem);
          setLooks(normalizedLooks);
        }
      } catch (error) {
        console.error('Error loading beauty looks:', error);
        if (isMounted) {
          setError('Unable to load beauty looks. Please try again.');
          setLooks([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLooks();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  // Fix back button freeze
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 50);
    });
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    trackCategoryView(selectedCategory, 'beauty');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/beauty/${selectedCategory}`);
      const data = await response.json();
      const normalizedLooks = (data.looks || []).map(asCardItem);
      setLooks(normalizedLooks);
    } catch (error) {
      console.error('Error refreshing looks:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory]);

  const handleCategoryPress = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleLookPress = useCallback((look) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(look), returnPath: '/beauty' }
    });
  }, []);

  const renderCategoryChip = useCallback((item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive
      ]}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={item.icon} 
        size={16} 
        color={selectedCategory === item.id ? '#FFFFFF' : COLORS.textSecondary} 
      />
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.categoryChipTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategoryPress]);

  const renderBeautyItem = useCallback(({ item }) => (
    <BeautyCard
      item={item}
      onPress={() => handleLookPress(item)}
      style={styles.beautyCard}
    />
  ), [handleLookPress]);

  const ListHeaderComponent = useCallback(() => (
    <View style={styles.listHeader}>
      {/* Addilets Makeup Recommendations */}
      {makeupRecommendations.length > 0 && (
        <View style={styles.addiletsSection}>
          <View style={styles.addiletsSectionHeader}>
            <View style={styles.addiletsTitleRow}>
              <MaterialCommunityIcons name="star-four-points" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>For You</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/addilets')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={makeupRecommendations}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item: makeup }) => (
              <TouchableOpacity style={styles.addiletsCard} activeOpacity={0.8}>
                <Image source={{ uri: makeup.image }} style={styles.addiletsImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.addiletsOverlay}>
                  <Text style={styles.addiletsTitle}>{makeup.title}</Text>
                  <View style={styles.addiletsMatch}>
                    <MaterialCommunityIcons name="heart" size={12} color="#FF6EC7" />
                    <Text style={styles.addiletsMatchText}>{makeup.match}%</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addiletsScroll}
          />
        </View>
      )}

      {/* Section Title */}
      <View style={styles.browseSectionHeader}>
        <Text style={styles.browseTitle}>
          {CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Browse'} Looks
        </Text>
        <Text style={styles.browseCount}>{looks.length} looks</Text>
      </View>
    </View>
  ), [makeupRecommendations, selectedCategory, looks.length]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="lipstick" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No looks found</Text>
      <Text style={styles.emptySubtitle}>Try a different category</Text>
    </View>
  ), []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Animated Collapsible Header */}
      <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}>
        {/* Title Row - Always visible */}
        <View style={styles.titleRow}>
          <Animated.View style={{ transform: [{ scale: titleScale }] }}>
            <Text style={styles.headerTitle}>Beauty Hub</Text>
          </Animated.View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/universal-search')}
            >
              <MaterialCommunityIcons name="magnify" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/saved-beauty')}
            >
              <MaterialCommunityIcons name="heart" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Chips - Collapsible */}
        <Animated.View 
          style={[
            styles.categoriesContainer,
            { 
              opacity: categoryOpacity,
              transform: [{ translateY: categoryTranslateY }]
            }
          ]}
        >
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderCategoryChip(item)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          />
        </Animated.View>
      </Animated.View>

      {/* Content */}
      {loading && looks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <SkeletonGrid />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={looks}
          renderItem={renderBeautyItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          numColumns={2}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          windowSize={5}
          initialNumToRender={6}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: SPACING.screenHorizontal,
    zIndex: 100,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginTop: SPACING.subtitleToChips,
  },
  categoriesContent: {
    gap: SPACING.chipGap,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  listHeader: {
    paddingTop: 8,
  },
  addiletsSection: {
    marginBottom: 24,
  },
  addiletsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addiletsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  addiletsScroll: {
    gap: 12,
  },
  addiletsCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  addiletsImage: {
    width: '100%',
    height: '100%',
  },
  addiletsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  addiletsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addiletsMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addiletsMatchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6EC7',
  },
  browseSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  browseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  browseCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  beautyCard: {
    flex: 1,
    margin: 6,
    maxWidth: '48%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
