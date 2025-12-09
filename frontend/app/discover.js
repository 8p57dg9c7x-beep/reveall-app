import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { COLORS, ANIMATIONS } from '../constants/theme';
import { API_BASE_URL } from '../config';
import { searchMusic } from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import { SkeletonHorizontalScroll } from '../components/SkeletonLoader';
import AnimatedPressable from '../components/AnimatedPressable';
import FadeInView from '../components/FadeInView';

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [trendingBeauty, setTrendingBeauty] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [loadingBeauty, setLoadingBeauty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // FIX 1: Prevent infinite re-renders with cleanup
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        setLoadingMovies(true);
        setLoadingStyles(true);
        setLoadingBeauty(true);
      }
      try {
        console.log('🎬 Loading discover data from:', API_BASE_URL);
        
        // Load all trending data in parallel
        const [moviesRes, stylesRes, beautyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/discover/trending`),
          fetch(`${API_BASE_URL}/api/outfits/trending`),
          fetch(`${API_BASE_URL}/api/beauty/trending`)
        ]);

        console.log('📊 Movies response status:', moviesRes.status);
        console.log('👗 Styles response status:', stylesRes.status);
        console.log('💄 Beauty response status:', beautyRes.status);
        
        const moviesData = await moviesRes.json();
        const stylesData = await stylesRes.json();
        const beautyData = await beautyRes.json();
        
        console.log('✅ Loaded movies:', moviesData.results?.length || 0);
        console.log('✅ Loaded styles:', stylesData.outfits?.length || 0);
        console.log('✅ Loaded beauty:', beautyData.looks?.length || 0);
        
        if (isMounted) {
          setTrendingMovies(moviesData.results?.slice(0, 10) || []);
          setTrendingStyles(stylesData.outfits?.slice(0, 10) || []);
          setTrendingBeauty(beautyData.looks?.slice(0, 10) || []);
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
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // FIX 3: Fix back button freeze after opening YouTube
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 50);
    });

    return unsubscribe;
  }, [navigation]);

  // Updated with working Unsplash placeholder images - v2.1
  const TRENDING_SONGS = [
    { id: 1, title: 'SOAK CITY', artist: '310babii', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: 2, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400&q=80' },
    { id: 4, title: 'Too Sweet', artist: 'Hozier', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80' },
    { id: 5, title: 'Espresso', artist: 'Sabrina Carpenter', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80' },
  ];
  console.log('🎵 Discover Songs loaded with Unsplash URLs');

  const EXPLORE_CATEGORIES = [
    { id: 'styles', title: 'Discover New Styles', icon: 'hanger', color: COLORS.accent },
    { id: 'brands', title: 'Discover New Brands', icon: 'tag', color: '#FF6B6B' },
    { id: 'music', title: 'Discover New Music', icon: 'music', color: '#4ECDC4' },
    { id: 'genres', title: 'Movie Genres', icon: 'movie', color: '#95E1D3' },
  ];

  const [loadingSongId, setLoadingSongId] = useState(null);

  const renderMovieCard = useCallback((movie) => (
    <AnimatedPressable
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
    </AnimatedPressable>
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
    <AnimatedPressable 
      key={song.id} 
      style={styles.trendingCard}
      onPress={() => handleSongTap(song)}
      onLongPress={() => alert(`Song: ${song.title}\nImage URL: ${song.image?.substring(0, 60)}...`)}
    >
      <OptimizedImage source={{ uri: song.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{song.title}</Text>
      <Text style={styles.trendingSubtitle} numberOfLines={1}>{song.artist}</Text>
      <Text style={[styles.debugText, {fontSize: 8, color: '#888'}]} numberOfLines={1}>
        {song.image?.includes('unsplash') ? '✓ Unsplash' : '✗ OLD URL'}
      </Text>
    </AnimatedPressable>
  ), [handleSongTap]);

  const renderStyleCard = useCallback((style) => (
    <AnimatedPressable
      key={style.id}
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: '/outfitdetail',
        params: { outfitData: JSON.stringify(style) }
      })}
    >
      <OptimizedImage source={{ uri: style.image_url || style.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{style.title}</Text>
    </AnimatedPressable>
  ), []);

  const renderBeautyCard = useCallback((look) => (
    <AnimatedPressable
      key={look.id}
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: '/beautydetail',
        params: { lookData: JSON.stringify(look) }
      })}
    >
      <OptimizedImage source={{ uri: look.image_url || look.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{look.title}</Text>
      {look.celebrity && (
        <Text style={styles.trendingSubtitle} numberOfLines={1}>{look.celebrity}</Text>
      )}
    </AnimatedPressable>
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
        ref={scrollRef}
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
          {loadingStyles ? (
            <SkeletonHorizontalScroll />
          ) : trendingStyles.length > 0 ? (
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              removeClippedSubviews
            >
              {trendingBeauty.map(renderBeautyCard)}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <MaterialCommunityIcons name="shimmer" size={40} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No trending beauty looks yet</Text>
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
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