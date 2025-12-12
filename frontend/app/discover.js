import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import { API_BASE_URL } from '../config';
import OptimizedImage from '../components/OptimizedImage';
import { SkeletonHorizontalScroll } from '../components/SkeletonLoader';
import FadeInView from '../components/FadeInView';

// Constants
const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

// Memoized components
const CategoryCard = memo(({ category, onPress }) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={[`${category.color}30`, `${category.color}10`]}
      style={styles.categoryGradient}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}40` }]}>
        <MaterialCommunityIcons name={category.icon} size={28} color={category.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </LinearGradient>
  </TouchableOpacity>
));

const MovieCard = memo(({ movie, onPress }) => (
  <TouchableOpacity style={styles.contentCard} onPress={onPress} activeOpacity={0.8}>
    <OptimizedImage
      source={{ uri: `https://image.tmdb.org/t/p/w185${movie.poster_path}` }}
      style={styles.contentImage}
    />
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.contentOverlay}>
      <Text style={styles.contentTitle} numberOfLines={2}>{movie.title}</Text>
      {movie.vote_average > 0 && (
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={12} color={COLORS.accent} />
          <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
));

const SongCard = memo(({ song, onPress }) => (
  <TouchableOpacity style={styles.contentCard} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: song.image }} style={styles.contentImage} />
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.contentOverlay}>
      <Text style={styles.contentTitle} numberOfLines={1}>{song.title}</Text>
      <Text style={styles.contentSubtitle} numberOfLines={1}>{song.artist}</Text>
    </LinearGradient>
  </TouchableOpacity>
));

export default function DiscoverScreen() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  // Trending songs - static
  const TRENDING_SONGS = useMemo(() => [
    { id: 1, title: 'SOAK CITY', artist: '310babii', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: 2, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400&q=80' },
    { id: 4, title: 'Too Sweet', artist: 'Hozier', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80' },
  ], []);

  // Discover categories
  const CATEGORIES = useMemo(() => [
    { 
      id: 'musicscan', 
      title: 'MusicScan', 
      subtitle: 'Identify any song',
      icon: 'music-circle', 
      color: '#4ECDC4',
      route: '/musicscan',
      params: { returnPath: '/discover' }
    },
    { 
      id: 'movies', 
      title: 'Movies & TV', 
      subtitle: 'Browse trending movies',
      icon: 'movie', 
      color: '#FF6B6B',
      route: '/comingsoon'
    },
    { 
      id: 'music', 
      title: 'Music', 
      subtitle: 'Trending songs & artists',
      icon: 'music', 
      color: '#B14CFF',
      route: '/trendingsongs'
    },
  ], []);

  // Load data
  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/discover/trending`);
        const data = await response.json();
        if (isMounted) {
          setTrendingMovies(data.results?.slice(0, 6) || []);
          setLoadingMovies(false);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        if (isMounted) setLoadingMovies(false);
      }
    };

    loadMovies();
    return () => { isMounted = false; };
  }, []);

  // Handlers
  const handleCategoryPress = useCallback((category) => {
    if (category.params) {
      router.push({ pathname: category.route, params: category.params });
    } else {
      router.push(category.route);
    }
  }, []);

  const handleMoviePress = useCallback((movie) => {
    router.push({
      pathname: '/result',
      params: { movieId: movie.id.toString(), returnPath: '/discover' }
    });
  }, []);

  const handleSongPress = useCallback((song) => {
    router.push({
      pathname: '/result',
      params: { 
        songData: JSON.stringify({ title: song.title, artist: song.artist, album_art: song.image }),
        returnPath: '/discover'
      }
    });
  }, []);

  // Render functions
  const renderCategoryItem = useCallback(({ item }) => (
    <CategoryCard category={item} onPress={() => handleCategoryPress(item)} />
  ), [handleCategoryPress]);

  const renderMovieItem = useCallback(({ item }) => (
    <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
  ), [handleMoviePress]);

  const renderSongItem = useCallback(({ item }) => (
    <SongCard song={item} onPress={() => handleSongPress(item)} />
  ), [handleSongPress]);

  // List header
  const ListHeaderComponent = useCallback(() => (
    <View>
      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => router.push('/universal-search')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} />
        <Text style={styles.searchPlaceholder}>Search movies, songs...</Text>
      </TouchableOpacity>

      {/* Header */}
      <FadeInView style={styles.header}>
        <MaterialCommunityIcons name="compass" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Movies, music & more</Text>
      </FadeInView>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        {CATEGORIES.map((category) => (
          <CategoryCard 
            key={category.id} 
            category={category} 
            onPress={() => handleCategoryPress(category)} 
          />
        ))}
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
          <FlatList
            horizontal
            data={trendingMovies}
            keyExtractor={(item) => `movie-${item.id}`}
            renderItem={renderMovieItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            initialNumToRender={4}
            removeClippedSubviews={true}
          />
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No movies available</Text>
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
        <FlatList
          horizontal
          data={TRENDING_SONGS}
          keyExtractor={(item) => `song-${item.id}`}
          renderItem={renderSongItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          initialNumToRender={4}
          removeClippedSubviews={true}
        />
      </View>
    </View>
  ), [CATEGORIES, TRENDING_SONGS, loadingMovies, trendingMovies, handleCategoryPress, renderMovieItem, renderSongItem]);

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginTop: 60,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadiusCard,
    gap: 12,
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryCard: {
    marginBottom: 12,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.1)',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  categorySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    gap: 12,
  },
  contentCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contentSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  emptySection: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
