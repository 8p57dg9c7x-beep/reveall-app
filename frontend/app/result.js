import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
      console.log('Movie data:', movieData);
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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

        {/* Movie Title & Year */}
        <Text style={styles.title}>{movie.title}</Text>
        {movie.release_date && (
          <Text style={styles.year}>{movie.release_date.substring(0, 4)}</Text>
        )}

        {/* Rating */}
        {movie.vote_average && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color={COLORS.blue} />
            <Text style={styles.rating}> {movie.vote_average.toFixed(1)}/10</Text>
          </View>
        )}

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
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.detailsButton, inWatchlist && styles.detailsButtonDisabled]}
            onPress={handleAddToWatchlist}
            disabled={inWatchlist}
          >
            <Text style={styles.detailsButtonText}>
              {inWatchlist ? '✓ In Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  posterContainer: {
    marginBottom: 24,
  },
  poster: {
    width: 200,
    height: 300,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  noPoster: {
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  year: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  genreTag: {
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 4,
  },
  genreText: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
  },
  overviewContainer: {
    marginBottom: 32,
  },
  overview: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
  },
  detailsButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    ...GLOW.blue,
  },
  detailsButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.borderRadius,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});
