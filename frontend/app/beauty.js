import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import BeautyCard from '../components/BeautyCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import GradientChip from '../components/GradientChip';
import FadeInView from '../components/FadeInView';
import { trackCategoryView } from '../services/analytics';
import { asCardItem } from '../utils/helpers';

const CATEGORIES = [
  { id: 'natural', name: 'Natural', icon: 'leaf' },
  { id: 'glam', name: 'Glam', icon: 'shimmer' },
  { id: 'bridal', name: 'Bridal', icon: 'heart' },
  { id: 'smokey', name: 'Smokey Eye', icon: 'eye' },
  { id: 'bold', name: 'Bold', icon: 'lightning-bolt' },
  { id: 'everyday', name: 'Everyday', icon: 'calendar-today' },
  { id: 'festival', name: 'Festival', icon: 'party-popper' },
];

export default function BeautyScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('natural');
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = React.useRef(null);
  const categoryScrollRef = React.useRef(null);

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
          // 🔥 NORMALIZE all beauty looks before setting state
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

  const loadLooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Track category view
    trackCategoryView(selectedCategory, 'beauty');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/beauty/${selectedCategory}`);
      const data = await response.json();
      // 🔥 NORMALIZE all beauty looks
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLooks();
    setRefreshing(false);
  }, [loadLooks]);

  const handleCategoryPress = useCallback((categoryId) => {
    if (categoryId === selectedCategory) return;
    setSelectedCategory(categoryId);
    // Don't scroll - let user maintain their position
  }, [selectedCategory]);

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

  const renderBeautyRow = useCallback(({ item, index }) => {
    const isLeft = index % 2 === 0;
    const nextItem = index < looks.length - 1 ? looks[index + 1] : null;

    if (!isLeft) return null;

    return (
      <View style={styles.row}>
        <BeautyCard
          item={item}
          onPress={() => handleLookPress(item)}
          isLeft={true}
        />
        {nextItem && (
          <BeautyCard
            item={nextItem}
            onPress={() => handleLookPress(nextItem)}
            isLeft={false}
          />
        )}
      </View>
    );
  }, [looks, handleLookPress]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="lipstick" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Beauty Looks Found</Text>
      <Text style={styles.emptySubtitle}>
        We're working on adding more {selectedCategory} looks
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadLooks}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color={COLORS.error || '#ff4444'} />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadLooks}>
        <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View>
      {/* Empty - header moved outside */}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header - Outside FlatList */}
      <View style={styles.fixedHeader}>
        <FadeInView style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Beauty Hub</Text>
            <Text style={styles.headerSubtitle}>Discover celebrity-inspired makeup</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <AnimatedPressable 
              style={styles.searchButton}
              onPress={() => router.push('/universal-search')}
              scaleValue={0.9}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <AnimatedPressable 
              style={styles.favoritesButton}
              onPress={() => router.push('/saved-beauty')}
              scaleValue={0.9}
            >
              <MaterialCommunityIcons name="heart" size={24} color={COLORS.primary} />
            </AnimatedPressable>
          </View>
        </FadeInView>

        {/* Fixed Category Filter Bar */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesWrapper}>
            {CATEGORIES.map((item) => (
              <AnimatedPressable
                key={item.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === item.id && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategoryPress(item.id)}
                scaleValue={0.95}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={selectedCategory === item.id ? '#FFFFFF' : '#8B7BA8'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      {loading && looks.length === 0 ? (
        <ScrollView style={styles.scrollView}>
          <SkeletonGrid />
        </ScrollView>
      ) : error ? (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
          }
        >
          {renderErrorState()}
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={looks}
          renderItem={renderBeautyRow}
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
    paddingBottom: 120,
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
});