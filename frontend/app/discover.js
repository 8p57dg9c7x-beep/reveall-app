import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function DiscoverScreen() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://moviedetect.preview.emergentagent.com';
      
      const [trendingRes, popularRes] = await Promise.all([
        fetch(`${API_URL}/api/discover/trending`),
        fetch(`${API_URL}/api/discover/popular`),
      ]);

      const trendingData = await trendingRes.json();
      const popularData = await popularRes.json();

      setTrending(trendingData.results?.slice(0, 10) || []);
      setPopular(popularData.results?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const MovieCard = ({ movie }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => router.push({
        pathname: '/result',
        params: { movieData: JSON.stringify(movie) }
      })}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
        style={styles.poster}
      />
      <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Discover Movies</Text>

        <Text style={styles.sectionTitle}>Trending This Week</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {trending.map(movie => <MovieCard key={movie.id} movie={movie} />)}
        </ScrollView>

        <Text style={styles.sectionTitle}>Popular Now</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {popular.map(movie => <MovieCard key={movie.id} movie={movie} />)}
        </ScrollView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  row: {
    marginBottom: 16,
  },
  movieCard: {
    width: 120,
    marginRight: 12,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  movieTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});