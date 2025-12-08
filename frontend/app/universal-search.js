import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import FilterChip from '../components/FilterChip';
import OutfitCard from '../components/OutfitCard';
import BeautyCard from '../components/BeautyCard';
import { API_BASE_URL } from '../config';

const TABS = [
  { id: 'outfits', label: 'Style', icon: 'hanger' },
  { id: 'beauty', label: 'Beauty', icon: 'lipstick' },
  { id: 'movies', label: 'Movies', icon: 'movie' },
];

const OUTFIT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bohemian', label: 'Bohemian' },
  { id: 'sport', label: 'Sport' },
  { id: 'elegant', label: 'Elegant' },
];

const BEAUTY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'natural', label: 'Natural' },
  { id: 'glam', label: 'Glam' },
  { id: 'bridal', label: 'Bridal' },
  { id: 'smokey', label: 'Smokey' },
  { id: 'bold', label: 'Bold' },
  { id: 'everyday', label: 'Everyday' },
];

export default function UniversalSearchScreen() {
  const [activeTab, setActiveTab] = useState('outfits');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const performSearch = useCallback(async (query, tab, filter) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/search/${tab}?q=${encodeURIComponent(query)}`;
      
      if (filter && filter !== 'all') {
        url += `&category=${filter}`;
      }

      console.log('🔍 Searching:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📊 Results:', data.results?.length || 0);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 2) {
        performSearch(searchQuery, activeTab, selectedFilter);
      } else {
        setResults([]);
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchQuery, activeTab, selectedFilter]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedFilter('all');
    setResults([]);
    if (searchQuery && searchQuery.length >= 2) {
      performSearch(searchQuery, tab, 'all');
    }
  };

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    if (searchQuery && searchQuery.length >= 2) {
      performSearch(searchQuery, activeTab, filterId);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  const renderOutfitRow = ({ item, index }) => {
    const isLeft = index % 2 === 0;
    const nextItem = index < results.length - 1 ? results[index + 1] : null;

    if (!isLeft) return null;

    return (
      <View style={styles.row}>
        <OutfitCard
          item={item}
          onPress={() => router.push({
            pathname: '/outfitdetail',
            params: { outfitData: JSON.stringify(item) },
          })}
          isLeft={true}
        />
        {nextItem && (
          <OutfitCard
            item={nextItem}
            onPress={() => router.push({
              pathname: '/outfitdetail',
              params: { outfitData: JSON.stringify(nextItem) },
            })}
            isLeft={false}
          />
        )}
      </View>
    );
  };

  const renderBeautyRow = ({ item, index }) => {
    const isLeft = index % 2 === 0;
    const nextItem = index < results.length - 1 ? results[index + 1] : null;

    if (!isLeft) return null;

    return (
      <View style={styles.row}>
        <BeautyCard
          item={item}
          onPress={() => router.push({
            pathname: '/beautydetail',
            params: { lookData: JSON.stringify(item) },
          })}
          isLeft={true}
        />
        {nextItem && (
          <BeautyCard
            item={nextItem}
            onPress={() => router.push({
              pathname: '/beautydetail',
              params: { lookData: JSON.stringify(nextItem) },
            })}
            isLeft={false}
          />
        )}
      </View>
    );
  };

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => {
        router.push({
          pathname: '/moviedetail',
          params: { movieId: item.id },
        });
      }}
    >
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.movieMeta}>
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.movieMetaText}>
            {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
          </Text>
          <MaterialCommunityIcons name="star" size={14} color={COLORS.accent} style={{ marginLeft: 12 }} />
          <Text style={styles.movieMetaText}>{item.vote_average?.toFixed(1) || 'N/A'}</Text>
        </View>
        <Text style={styles.movieOverview} numberOfLines={2}>{item.overview}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery || searchQuery.length < 2) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="magnify" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Start Searching</Text>
          <Text style={styles.emptySubtitle}>
            Type at least 2 characters to find your perfect {activeTab === 'outfits' ? 'outfit' : activeTab === 'beauty' ? 'beauty look' : 'movie'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="emoticon-sad-outline" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptySubtitle}>
          Try different keywords or filters
        </Text>
      </View>
    );
  };

  const currentFilters = activeTab === 'outfits' ? OUTFIT_FILTERS : 
                         activeTab === 'beauty' ? BEAUTY_FILTERS : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Search</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          onClear={handleClearSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => handleTabChange(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? COLORS.textPrimary : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      {activeTab !== 'movies' && currentFilters.length > 0 && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {currentFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                selected={selectedFilter === filter.id}
                onPress={() => handleFilterChange(filter.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={activeTab === 'outfits' ? renderOutfitRow : 
                     activeTab === 'beauty' ? renderBeautyRow : 
                     renderMovieItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filters: {
    paddingHorizontal: 16,
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  movieCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  movieMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  movieOverview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
