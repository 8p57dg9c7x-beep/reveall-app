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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-app.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/discover/upcoming`);
      const data = await response.json();
      setUpcoming(data.results?.slice(0, 20) || []);
    } catch (error) {
      console.error('Error loading upcoming:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading upcoming movies...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-star" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Coming Soon</Text>
          <Text style={styles.subtitle}>New releases in theaters</Text>
        </View>

        <View style={styles.moviesContainer}>
          {upcoming.map(movie => (
            <TouchableOpacity
              key={movie.id}
              style={styles.movieCard}
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/result',
                params: { 
                  movieData: JSON.stringify(movie),
                  returnPath: '/comingsoon'
                }
              })}
            >
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w300${movie.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
                
                <View style={styles.metadata}>
                  <MaterialCommunityIcons name="calendar" size={14} color={COLORS.accent} />
                  <Text style={styles.date}>{formatReleaseDate(movie.release_date)}</Text>
                </View>

                {movie.vote_average > 0 && (
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={14} color={COLORS.accent} />
                    <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
                  </View>
                )}

                {movie.overview && (
                  <Text style={styles.overview} numberOfLines={3}>
                    {movie.overview}
                  </Text>
                )}
              </View>

              <View style={styles.chevronContainer}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 120,
    paddingHorizontal: 20,
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