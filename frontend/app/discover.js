import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function DiscoverScreen() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  const loadDiscoverData = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cinescan-app-2.preview.emergentagent.com';
      
      // Load trending movies
      const moviesRes = await fetch(`${API_URL}/api/discover/trending`);
      const moviesData = await moviesRes.json();
      setTrendingMovies(moviesData.results?.slice(0, 10) || []);

      // Load trending styles (from all categories)
      const stylesRes = await fetch(`${API_URL}/api/outfits/trending`);
      const stylesData = await stylesRes.json();
      setTrendingStyles(stylesData.outfits || []);
    } catch (error) {
      console.error('Error loading discover data:', error);
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

  const renderMovieCard = (movie) => (
    <TouchableOpacity
      key={movie.id}
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: '/result',
        params: { movieData: JSON.stringify(movie) }
      })}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w300${movie.poster_path}` }}
        style={styles.trendingImage}
      />
      <Text style={styles.trendingTitle} numberOfLines={2}>{movie.title}</Text>
    </TouchableOpacity>
  );

  const renderSongCard = (song) => (
    <TouchableOpacity key={song.id} style={styles.trendingCard}>
      <Image source={{ uri: song.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{song.title}</Text>
      <Text style={styles.trendingSubtitle} numberOfLines={1}>{song.artist}</Text>
    </TouchableOpacity>
  );

  const renderStyleCard = (style) => (
    <TouchableOpacity
      key={style.id}
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: '/outfitdetail',
        params: { outfitData: JSON.stringify(style) }
      })}
    >
      <Image source={{ uri: style.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle} numberOfLines={2}>{style.title}</Text>
    </TouchableOpacity>
  );

  const renderExploreCard = (category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.exploreCard}
      onPress={() => {
        if (category.id === 'styles') router.push('/style');
        // Other categories can be implemented later
      }}
    >
      <MaterialCommunityIcons name={category.icon} size={32} color={category.color} />
      <Text style={styles.exploreTitle}>{category.title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="compass" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Trending content across movies, music & style</Text>
        </View>

        {/* Trending Movies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {trendingMovies.map(renderMovieCard)}
          </ScrollView>
        </View>

        {/* Trending Songs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Songs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  trendingCard: {
    width: 140,
    marginRight: 16,
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
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 18,
  },
  trendingSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  exploreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    padding: 32,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
});