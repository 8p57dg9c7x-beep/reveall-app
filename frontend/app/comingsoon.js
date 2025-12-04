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

export default function ComingSoonScreen() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://moviedetect.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/discover/upcoming`);
      const data = await response.json();
      setUpcoming(data.results?.slice(0, 20) || []);
    } catch (error) {
      console.error('Error loading upcoming:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Coming Soon</Text>
        <Text style={styles.subtitle}>New releases in theaters</Text>

        {upcoming.map(movie => (
          <TouchableOpacity
            key={movie.id}
            style={styles.movieItem}
            onPress={() => router.push({
              pathname: '/result',
              params: { movieData: JSON.stringify(movie) }
            })}
          >
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
              style={styles.poster}
            />
            <View style={styles.info}>
              <Text style={styles.title}>{movie.title}</Text>
              <Text style={styles.date}>Release: {movie.release_date}</Text>
              <Text style={styles.overview} numberOfLines={3}>{movie.overview}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  movieItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 150,
  },
  info: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: COLORS.accent,
    marginBottom: 8,
  },
  overview: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});