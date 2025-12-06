import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import { searchMusic } from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import { SkeletonHorizontalCard } from '../components/SkeletonLoader';

export default function DiscoverScreen() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  const loadDiscoverData = async () => {
    setLoadingMovies(true);
    setLoadingStyles(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-mvp.preview.emergentagent.com';
      
      // Load trending movies
      const moviesRes = await fetch(`${API_URL}/api/discover/trending`);
      const moviesData = await moviesRes.json();
      setTrendingMovies(moviesData.results?.slice(0, 10) || []);
      setLoadingMovies(false);

      // Load trending styles (from all categories)
      const stylesRes = await fetch(`${API_URL}/api/outfits/trending`);
      const stylesData = await stylesRes.json();
      setTrendingStyles(stylesData.outfits || []);
      setLoadingStyles(false);
    } catch (error) {
      console.error('Error loading discover data:', error);
      setLoadingMovies(false);
      setLoadingStyles(false);
    } finally {
      setLoading(false);
    }
  };

  const TRENDING_SONGS = [
    { id: 1, title: 'SOAK CITY', artist: '310babii', image: 'https://i.scdn.co/image/ab67616d0000b2738b5e3c8b6d8e6e7b9c5f8e0a' },
    { id: 2, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', image: 'https://i.scdn.co/image/ab67616d0000b273c015d2f73b144e0e0c4e7b9f' },
    { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', image: 'https://i.scdn.co/image/ab67616d0000b273ef2d4ed7e8e8e3c8d9f0f8a3' },
    { id: 4, title: 'Too Sweet', artist: 'Hozier', image: 'https://i.scdn.co/image/ab67616d0000b273b8c8e8e7f9c5d8e0e0c4e7b9' },
    { id: 5, title: 'Espresso', artist: 'Sabrina Carpenter', image: 'https://i.scdn.co/image/ab67616d0000b273c5d8e0e0c4e7b9f8e8e7f9c5' },
  ];

  const EXPLORE_CATEGORIES = [
    { id: 'styles', title: 'Discover New Styles', icon: 'hanger', color: COLORS.accent },
    { id: 'brands', title: 'Discover New Brands', icon: 'tag', color: '#FF6B6B' },
    { id: 'music', title: 'Discover New Music', icon: 'music', color: '#4ECDC4' },
    { id: 'genres', title: 'Movie Genres', icon: 'movie', color: '#95E1D3' },
  ];

  const [loadingSongId, setLoadingSongId] = useState(null);

  const renderMovieCard = useCallback((movie) => (
    <TouchableOpacity
      key={movie.id}
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: '/result',
        params: { 
          movieId: movie.id.toString(),
          returnPath: '/discover'
        }
      })}
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
      {movie.release_date && (
        <Text style={styles.movieYear}>
          {new Date(movie.release_date).getFullYear()}
        </Text>
      )}
    </TouchableOpacity>
  ), []);

  const handleSongTap = useCallback(async (song) => {
    try {
      setLoadingSongId(song.id);
      
      // Call AudD search API
      const response = await searchMusic(song.title, song.artist);
      
      setLoadingSongId(null);
      
      if (response.success && response.song) {
        // Use full data from AudD
        router.push({
          pathname: '/result',
          params: { 
            songData: JSON.stringify(response.song),
            returnPath: '/discover'
          }
        });
      } else {
        // Fallback to basic data
        const songData = {
          title: song.title,
          artist: song.artist,
          album: song.title,
          album_art: song.image,
          spotify: null,
          apple_music: null,
          lyrics: null,
        };
        
        router.push({
          pathname: '/result',
          params: { 
            songData: JSON.stringify(songData),
            returnPath: '/discover'
          }
        });
      }
    } catch (error) {
      setLoadingSongId(null);
      console.error('Error searching song:', error);
      
      // Fallback on error
      const songData = {
        title: song.title,
        artist: song.artist,
        album: song.title,
        album_art: song.image,
        spotify: null,
        apple_music: null,
        lyrics: null,
      };
      
      router.push({
        pathname: '/result',
        params: { 
          songData: JSON.stringify(songData),
          returnPath: '/discover'
        }
      });
    }
  }, []);

  const renderSongCard = useCallback((song) => (
    <TouchableOpacity 
      key={song.id} 
      style={styles.trendingCard}
      onPress={() => handleSongTap(song)}
    >
      <OptimizedImage source={{ uri: song.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{song.title}</Text>
      <Text style={styles.trendingSubtitle} numberOfLines={1}>{song.artist}</Text>
    </TouchableOpacity>
  ), [handleSongTap]);

  const renderStyleCard = useCallback((style) => (
    <TouchableOpacity
      key={style.id}
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: '/outfitdetail',
        params: { outfitData: JSON.stringify(style) }
      })}
    >
      <OptimizedImage source={{ uri: style.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{style.title}</Text>
    </TouchableOpacity>
  ), []);

  const handleExplorePress = useCallback((categoryId) => {
    console.log('Explore card pressed:', categoryId);
    try {
      if (categoryId === 'styles') {
        console.log('Navigating to Style tab');
        router.replace('/style');
      } else if (categoryId === 'brands') {
        console.log('Navigating to Style tab (brands)');
        router.replace('/style');
      } else if (categoryId === 'music') {
        console.log('Navigating to Trending Songs');
        router.push({
          pathname: '/trendingsongs'
        });
      } else if (categoryId === 'genres') {
        console.log('Navigating to Coming Soon');
        router.replace('/comingsoon');
      }
      console.log('Navigation command executed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  const renderExploreCard = useCallback((category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.exploreCard}
      onPress={() => handleExplorePress(category.id)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={category.icon} size={32} color={category.color} />
      <Text style={styles.exploreTitle}>{category.title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  ), [handleExplorePress]);

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="compass" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Trending content across movies, music & style</Text>
        </View>

        {/* Trending Movies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>
            <TouchableOpacity onPress={() => router.push('/comingsoon')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            removeClippedSubviews
          >
            {trendingMovies.map(renderMovieCard)}
          </ScrollView>
        </View>

        {/* Trending Songs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Songs</Text>
            <TouchableOpacity onPress={() => router.push('/trendingsongs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            removeClippedSubviews
          >
            {TRENDING_SONGS.map(renderSongCard)}
          </ScrollView>
        </View>

        {/* Trending Styles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Styles</Text>
            <TouchableOpacity onPress={() => router.push('/style')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {trendingStyles.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              removeClippedSubviews
            >
              {trendingStyles.map(renderStyleCard)}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <MaterialCommunityIcons name="hanger" size={40} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No trending styles yet</Text>
            </View>
          )}
        </View>

        {/* Explore Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          {EXPLORE_CATEGORIES.map(renderExploreCard)}
        </View>
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
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
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
    marginBottom: 40,
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  },
  trendingCard: {
    marginRight: 16,
    width: 140,
  },
  trendingImage: {
    width: 140,
    height: 140,
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
  movieYear: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
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
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 16,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});