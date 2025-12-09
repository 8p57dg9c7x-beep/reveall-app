import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import OptimizedImage from '../components/OptimizedImage';

export default function ComingSoonScreen() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://bugfix-champs.preview.emergentagent.com';
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
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('/discover')}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
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
                  movieId: movie.id.toString(),
                  returnPath: '/comingsoon'
                }
              })}
            >
              <OptimizedImage
                source={{ uri: `https://image.tmdb.org/t/p/w185${movie.poster_path}` }}
                style={styles.poster}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
                </View>
                
                <View style={styles.metadataSection}>
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
                </View>

                {movie.genre_ids && movie.genre_ids.length > 0 && (
                  <View style={styles.genresRow}>
                    {movie.genre_ids.slice(0, 2).map((genreId, index) => {
                      const genreNames = {
                        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
                        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
                        14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                        9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV',
                        53: 'Thriller', 10752: 'War', 37: 'Western'
                      };
                      return (
                        <View key={index} style={styles.genreTag}>
                          <Text style={styles.genreText}>{genreNames[genreId] || 'Movie'}</Text>
                        </View>
                      );
                    })}
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 140,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  moviesContainer: {
    paddingHorizontal: 24,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 180,
  },
  poster: {
    width: 120,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  metadataSection: {
    marginBottom: 10,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: 6,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: 4,
    fontWeight: '600',
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  overview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 16,
  },
});