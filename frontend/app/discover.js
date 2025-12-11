import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import { API_BASE_URL } from '../config';
import { searchMusic } from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import { SkeletonHorizontalScroll } from '../components/SkeletonLoader';
import FadeInView from '../components/FadeInView';
import { asCardItem } from '../utils/helpers';

// Constants for virtualization
const HORIZONTAL_CARD_WIDTH = 140;
const HORIZONTAL_CARD_HEIGHT = 140;

// Memoized card components
const MovieCard = memo(({ movie, onPress }) => (
  <TouchableOpacity
    style={styles.trendingCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <OptimizedImage
      source={{ uri: `https://image.tmdb.org/t/p/w185${movie.poster_path}` }}
      style={styles.trendingImage}
    />
    <Text style={styles.trendingTitle} numberOfLines={2}>{movie.title}</Text>
    {movie.vote_average > 0 && (
      <View style={styles.movieRatingRow}>
        <MaterialCommunityIcons name="star" size={14} color={COLORS.accent} />
        <Text style={styles.movieRating}>{movie.vote_average.toFixed(1)}</Text>
      </View>
    )}
  </TouchableOpacity>
));

const SongCard = memo(({ song, onPress, isLoading }) => (
  <TouchableOpacity 
    style={styles.trendingCard}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={isLoading}
  >
    <OptimizedImage source={{ uri: song.image }} style={styles.trendingImage} />
    <Text style={styles.trendingTitle} numberOfLines={2}>{song.title}</Text>
    <Text style={styles.trendingSubtitle} numberOfLines={1}>{song.artist}</Text>
  </TouchableOpacity>
));

const StyleCard = memo(({ style, onPress }) => (
  <TouchableOpacity
    style={styles.trendingCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <OptimizedImage source={{ uri: style.imageToUse }} style={styles.trendingImage} />
    <Text style={styles.trendingTitle} numberOfLines={2}>{style.title}</Text>
  </TouchableOpacity>
));

const BeautyCard = memo(({ look, onPress }) => (
  <TouchableOpacity
    style={styles.trendingCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <OptimizedImage source={{ uri: look.imageToUse }} style={styles.trendingImage} />
    <Text style={styles.trendingTitle} numberOfLines={2}>{look.title}</Text>
    {look.celebrity && (
      <Text style={styles.trendingSubtitle} numberOfLines={1}>{look.celebrity}</Text>
    )}
  </TouchableOpacity>
));

const ExploreCard = memo(({ category, onPress }) => (
  <TouchableOpacity
    style={styles.exploreCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name={category.icon} size={32} color={category.color} />
    <Text style={styles.exploreTitle}>{category.title}</Text>
    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
  </TouchableOpacity>
));

// Optimized horizontal list with getItemLayout
const HorizontalList = memo(({ data, renderItem, keyPrefix }) => {
  const getItemLayout = useCallback((data, index) => ({
    length: HORIZONTAL_CARD_WIDTH + 16,
    offset: (HORIZONTAL_CARD_WIDTH + 16) * index,
    index,
  }), []);

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${keyPrefix}-${item.id || index}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScroll}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={3}
      removeClippedSubviews={true}
      getItemLayout={getItemLayout}
    />
  );
});

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [trendingBeauty, setTrendingBeauty] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [loadingBeauty, setLoadingBeauty] = useState(true);
  const [loadingSongId, setLoadingSongId] = useState(null);

  // Static data - memoized
  const TRENDING_SONGS = useMemo(() => [
    { id: 1, title: 'SOAK CITY', artist: '310babii', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: 2, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400&q=80' },
    { id: 4, title: 'Too Sweet', artist: 'Hozier', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80' },
    { id: 5, title: 'Espresso', artist: 'Sabrina Carpenter', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80' },
  ], []);

  const EXPLORE_CATEGORIES = useMemo(() => [
    { id: 'styles', title: 'Discover New Styles', icon: 'hanger', color: COLORS.accent },
    { id: 'brands', title: 'Discover New Brands', icon: 'tag', color: '#FF6B6B' },
    { id: 'music', title: 'Discover New Music', icon: 'music', color: '#4ECDC4' },
    { id: 'genres', title: 'Movie Genres', icon: 'movie', color: '#95E1D3' },
  ], []);

  // Load data with cleanup
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [moviesRes, stylesRes, beautyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/discover/trending`),
          fetch(`${API_BASE_URL}/api/outfits/trending`),
          fetch(`${API_BASE_URL}/api/beauty/trending`)
        ]);
        
        const [moviesData, stylesData, beautyData] = await Promise.all([
          moviesRes.json(),
          stylesRes.json(),
          beautyRes.json()
        ]);
        
        if (isMounted) {
          setTrendingMovies(moviesData.results?.slice(0, 10) || []);
          setTrendingStyles((stylesData.outfits || []).slice(0, 10).map(asCardItem));
          setTrendingBeauty((beautyData.looks || []).slice(0, 10).map(asCardItem));
          setLoadingMovies(false);
          setLoadingStyles(false);
          setLoadingBeauty(false);
        }
      } catch (error) {
        console.error('❌ Error loading discover data:', error);
        if (isMounted) {
          setLoadingMovies(false);
          setLoadingStyles(false);
          setLoadingBeauty(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Handlers - memoized
  const handleSongTap = useCallback(async (song) => {
    try {
      setLoadingSongId(song.id);
      const response = await searchMusic(song.title, song.artist);
      setLoadingSongId(null);
      
      const songData = response.success && response.song 
        ? response.song 
        : { title: song.title, artist: song.artist, album_art: song.image };
      
      router.push({
        pathname: '/result',
        params: { songData: JSON.stringify(songData), returnPath: '/discover' }
      });
    } catch (error) {
      setLoadingSongId(null);
      router.push({
        pathname: '/result',
        params: { 
          songData: JSON.stringify({ title: song.title, artist: song.artist, album_art: song.image }),
          returnPath: '/discover'
        }
      });
    }
  }, []);

  const handleExplorePress = useCallback((categoryId) => {
    const routes = {
      styles: '/style',
      brands: '/style',
      music: '/trendingsongs',
      genres: '/comingsoon'
    };
    router.push(routes[categoryId] || '/comingsoon');
  }, []);

  // Render functions - memoized
  const renderMovieItem = useCallback(({ item }) => (
    <MovieCard 
      movie={item} 
      onPress={() => router.push({
        pathname: '/result',
        params: { movieId: item.id.toString(), returnPath: '/discover' }
      })}
    />
  ), []);

  const renderSongItem = useCallback(({ item }) => (
    <SongCard 
      song={item} 
      onPress={() => handleSongTap(item)}
      isLoading={loadingSongId === item.id}
    />
  ), [handleSongTap, loadingSongId]);

  const renderStyleItem = useCallback(({ item }) => (
    <StyleCard 
      style={item} 
      onPress={() => router.push({
        pathname: '/outfitdetail',
        params: { outfitData: JSON.stringify(item) }
      })}
    />
  ), []);

  const renderBeautyItem = useCallback(({ item }) => (
    <BeautyCard 
      look={item} 
      onPress={() => router.push({
        pathname: '/beautydetail',
        params: { lookData: JSON.stringify(item) }
      })}
    />
  ), []);

  // Main list header component
  const ListHeaderComponent = useCallback(() => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies, songs, styles..."
            placeholderTextColor={COLORS.textMuted}
            onFocus={() => router.push('/universal-search')}
          />
        </View>
      </View>

      <FadeInView style={styles.header}>
        <MaterialCommunityIcons name="compass" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Movies, music & cultural content</Text>
      </FadeInView>

      {/* MusicScan Feature Card */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.musicScanCard}
          onPress={() => router.push('/trendingsongs')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4ECDC430', '#4ECDC410']}
            style={styles.musicScanGradient}
          >
            <View style={styles.musicScanIcon}>
              <MaterialCommunityIcons name="music-circle" size={40} color="#4ECDC4" />
            </View>
            <View style={styles.musicScanContent}>
              <Text style={styles.musicScanTitle}>MusicScan</Text>
              <Text style={styles.musicScanSubtitle}>Identify any song playing around you</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Trending Movies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Movies</Text>
          <TouchableOpacity onPress={() => router.push('/comingsoon')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {loadingMovies ? (
          <SkeletonHorizontalScroll />
        ) : trendingMovies.length > 0 ? (
          <HorizontalList data={trendingMovies} renderItem={renderMovieItem} keyPrefix="movie" />
        ) : (
          <View style={styles.emptySection}>
            <MaterialCommunityIcons name="movie" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No trending movies yet</Text>
          </View>
        )}
      </View>

      {/* Trending Songs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Songs</Text>
          <TouchableOpacity onPress={() => router.push('/trendingsongs')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <HorizontalList data={TRENDING_SONGS} renderItem={renderSongItem} keyPrefix="song" />
      </View>

      {/* Trending Styles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Styles</Text>
          <TouchableOpacity onPress={() => router.push('/style')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {loadingStyles ? (
          <SkeletonHorizontalScroll />
        ) : trendingStyles.length > 0 ? (
          <HorizontalList data={trendingStyles} renderItem={renderStyleItem} keyPrefix="style" />
        ) : (
          <View style={styles.emptySection}>
            <MaterialCommunityIcons name="hanger" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No trending styles yet</Text>
          </View>
        )}
      </View>

      {/* Trending Beauty */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Beauty</Text>
          <TouchableOpacity onPress={() => router.push('/beauty')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {loadingBeauty ? (
          <SkeletonHorizontalScroll />
        ) : trendingBeauty.length > 0 ? (
          <HorizontalList data={trendingBeauty} renderItem={renderBeautyItem} keyPrefix="beauty" />
        ) : (
          <View style={styles.emptySection}>
            <MaterialCommunityIcons name="shimmer" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No trending beauty looks yet</Text>
          </View>
        )}
      </View>

      {/* Explore Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 16 }]}>Explore</Text>
        {EXPLORE_CATEGORIES.map((category) => (
          <ExploreCard 
            key={category.id} 
            category={category} 
            onPress={() => handleExplorePress(category.id)} 
          />
        ))}
      </View>
    </View>
  ), [
    loadingMovies, loadingStyles, loadingBeauty, loadingSongId,
    trendingMovies, trendingStyles, trendingBeauty, TRENDING_SONGS, EXPLORE_CATEGORIES,
    renderMovieItem, renderSongItem, renderStyleItem, renderBeautyItem, handleExplorePress
  ]);

  // Empty data for parent FlatList
  const emptyData = useMemo(() => [], []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={emptyData}
        renderItem={() => null}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={() => 'main'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        windowSize={5}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusInput,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  trendingCard: {
    marginRight: 16,
    width: HORIZONTAL_CARD_WIDTH,
  },
  trendingImage: {
    width: HORIZONTAL_CARD_WIDTH,
    height: HORIZONTAL_CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  trendingTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  trendingSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  movieRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  movieRating: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  exploreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  exploreTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});
