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
                source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
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
    paddingTop: 20,
    paddingBottom: 120,
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
    paddingHorizontal: 20,
    paddingBottom: 28,
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
    paddingHorizontal: 20,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  poster: {
    width: 110,
    height: 165,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    marginBottom: 8,
  },
  rating: {
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: 4,
    fontWeight: '600',
  },
  overview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
});