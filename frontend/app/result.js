import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import GradientBackground from '../components/GradientBackground';
import { Ionicons } from '@expo/vector-icons';
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
      <GradientBackground>
        <View style={styles.container}>
          <Text style={styles.errorText}>No movie data available</Text>
        </View>
      </GradientBackground>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;

  return (
    <GradientBackground>
      <ScrollView style={styles.scrollView}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Backdrop Image */}
        {backdropUrl && (
          <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Poster */}
          {posterUrl && (
            <Image source={{ uri: posterUrl }} style={styles.poster} />
          )}

          {/* Title */}
          <Text style={styles.title}>{movie.title}</Text>

          {/* Year & Rating */}
          <View style={styles.metaContainer}>
            {movie.release_date && (
              <Text style={styles.year}>{movie.release_date.substring(0, 4)}</Text>
            )}
            {movie.vote_average && (
              <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
            )}
            {movie.runtime && (
              <Text style={styles.runtime}>{movie.runtime} min</Text>
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
              <Text style={styles.overviewTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {!inWatchlist ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAddToWatchlist}
              >
                <Ionicons name="star" size={24} color="#667eea" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Add to Watchlist</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inWatchlistContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.inWatchlistText}>In Watchlist</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/identify')}
            >
              <Ionicons name="search" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Search Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  backdrop: {
    width: '100%',
    height: 250,
    opacity: 0.4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    marginTop: -50,
  },
  poster: {
    width: 200,
    height: 300,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  year: {
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  rating: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  runtime: {
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  overviewContainer: {
    marginBottom: 32,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'justify',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  inWatchlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  inWatchlistText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
