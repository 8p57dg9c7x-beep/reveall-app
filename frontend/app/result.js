import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW, SIZES } from '../constants/theme';
import { addToWatchlist, isInWatchlist } from '../services/storage';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [movie, setMovie] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (params.movieData) {
      const movieData = JSON.parse(params.movieData);
      setMovie(movieData);
      checkWatchlist(movieData.id);
    }
  }, [params.movieData]);

  const checkWatchlist = async (movieId) => {
    const exists = await isInWatchlist(movieId);
    setInWatchlist(exists);
  };

  const handleAddToWatchlist = async () => {
    if (!movie) return;

    const result = await addToWatchlist(movie);
    if (result.success) {
      setInWatchlist(true);
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Info', result.message);
    }
  };

  if (!movie) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>No movie data available</Text>
      </View>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const matchPercentage = movie.vote_average ? Math.round((movie.vote_average / 10) * 100) : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Found</Text>
        </View>

        {/* Match Percentage Badge */}
        {matchPercentage && (
          <View style={styles.matchBadge}>
            <LinearGradient
              colors={[COLORS.neonBlue, COLORS.neonBlueDark]}
              style={styles.matchBadgeGradient}
            >
              <Text style={styles.matchPercentage}>{matchPercentage}%</Text>
              <Text style={styles.matchLabel}>MATCH</Text>
            </LinearGradient>
          </View>
        )}

        {/* Movie Poster */}
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, styles.noPoster]}>
              <Ionicons name="film-outline" size={80} color={COLORS.textSecondary} />
            </View>
          )}
        </View>

        {/* Movie Info */}
        <View style={styles.infoContainer}>
          {/* Title */}
          <Text style={styles.title}>{movie.title}</Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            {movie.release_date && (
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>{movie.release_date.substring(0, 4)}</Text>
              </View>
            )}
            {movie.vote_average && (
              <View style={styles.metaBadge}>
                <Ionicons name="star" size={14} color={COLORS.neonBlue} />
                <Text style={styles.metaText}> {movie.vote_average.toFixed(1)}/10</Text>
              </View>
            )}
            {movie.runtime && (
              <View style={styles.metaBadge}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.metaText}> {movie.runtime} min</Text>
              </View>
            )}
          </View>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {movie.genres.map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Overview */}
          {movie.overview && (
            <View style={styles.overviewContainer}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {!inWatchlist ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAddToWatchlist}
              >
                <LinearGradient
                  colors={[COLORS.neonBlue, COLORS.neonBlueDark]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="bookmark" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.primaryButtonText}>Add to Watchlist</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.inWatchlistContainer}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.inWatchlistText}>In Watchlist</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/identify')}
            >
              <Ionicons name="scan" size={20} color={COLORS.textPrimary} />
              <Text style={styles.secondaryButtonText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SIZES.spacingLarge,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  matchBadge: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  matchBadgeGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  matchPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  matchLabel: {
    fontSize: 10,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  posterContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  poster: {
    width: 250,
    height: 375,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.metallicSilver + '50',
    ...GLOW.metallicSilver,
  },
  noPoster: {
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: SIZES.spacingLarge,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  genreTag: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.neonBlue + '50',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 4,
  },
  genreText: {
    fontSize: 12,
    color: COLORS.neonBlue,
    fontWeight: '600',
  },
  overviewContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  overview: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    ...GLOW.neonBlue,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '50',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  inWatchlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  inWatchlistText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
