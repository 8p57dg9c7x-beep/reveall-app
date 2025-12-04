import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);
  const movie = params.movieData ? JSON.parse(params.movieData) : null;
  const song = params.songData ? JSON.parse(params.songData) : null;

  useEffect(() => {
    if (movie) {
      checkWatchlist();
      loadSimilarMovies();
    }
  }, [movie]);

  const loadSimilarMovies = async () => {
    if (!movie?.id) return;
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cinescan-app-2.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/movie/${movie.id}/similar`);
      const data = await response.json();
      setSimilarMovies(data.results?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error loading similar movies:', error);
    }
  };

  const checkWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchlist');
      if (stored) {
        const watchlist = JSON.parse(stored);
        setInWatchlist(watchlist.some(m => m.id === movie.id));
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchlist');
      let watchlist = stored ? JSON.parse(stored) : [];

      if (inWatchlist) {
        watchlist = watchlist.filter(m => m.id !== movie.id);
      } else {
        watchlist.unshift(movie);
      }

      await AsyncStorage.setItem('watchlist', JSON.stringify(watchlist));
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (song) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.musicIcon}>
            <MaterialCommunityIcons name="music-circle" size={120} color={COLORS.accent} />
          </View>

          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.artist}</Text>
          {song.album && <Text style={styles.album}>{song.album}</Text>}

          <View style={styles.listenSection}>
            <Text style={styles.sectionTitle}>Listen On:</Text>
            <View style={styles.platformButtons}>
              {song.spotify?.external_urls?.spotify && (
                <TouchableOpacity
                  style={styles.platformButton}
                  onPress={() => Linking.openURL(song.spotify.external_urls.spotify)}
                >
                  <MaterialCommunityIcons name="spotify" size={40} color="#1DB954" />
                  <Text style={styles.platformText}>Spotify</Text>
                </TouchableOpacity>
              )}
              {song.apple_music?.url && (
                <TouchableOpacity
                  style={styles.platformButton}
                  onPress={() => Linking.openURL(song.apple_music.url)}
                >
                  <MaterialCommunityIcons name="apple" size={40} color="#FC3C44" />
                  <Text style={styles.platformText}>Apple Music</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.platformButton}
                onPress={() => {
                  const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`);
                  Linking.openURL(`https://www.youtube.com/results?search_query=${searchQuery}`);
                }}
              >
                <MaterialCommunityIcons name="youtube" size={40} color="#FF0000" />
                <Text style={styles.platformText}>YouTube</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (movie) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {movie.poster_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
              style={styles.poster}
            />
          )}

          <Text style={styles.title}>{movie.title}</Text>
          
          {movie.vote_average && (
            <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
          )}

          {movie.genres && (
            <View style={styles.genres}>
              {movie.genres.slice(0, 3).map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          {movie.overview && (
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>
          )}

          {movie['watch/providers']?.results?.US && (
            <View style={styles.watchSection}>
              <Text style={styles.sectionTitle}>Where to Watch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {movie['watch/providers'].results.US.flatrate?.map(provider => (
                  <View key={provider.provider_id} style={styles.providerCard}>
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/original${provider.logo_path}` }}
                      style={styles.providerLogo}
                    />
                    <Text style={styles.providerName}>{provider.provider_name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={[styles.watchlistButton, inWatchlist && styles.watchlistButtonActive]}
            onPress={toggleWatchlist}
          >
            <MaterialCommunityIcons
              name={inWatchlist ? "bookmark" : "bookmark-outline"}
              size={24}
              color={COLORS.textPrimary}
            />
            <Text style={styles.watchlistText}>
              {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  musicIcon: {
    marginVertical: 40,
  },
  poster: {
    width: 300,
    height: 450,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  artist: {
    fontSize: 20,
    color: COLORS.accent,
    marginBottom: 8,
  },
  album: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  rating: {
    fontSize: 18,
    color: COLORS.accent,
    marginBottom: 16,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  genreText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  overviewSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  overview: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  listenSection: {
    width: '100%',
    marginTop: 24,
  },
  platformButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  platformButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    width: 140,
  },
  platformText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  watchSection: {
    width: '100%',
    marginBottom: 24,
  },
  providerCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  providerLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  providerName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  watchlistButtonActive: {
    backgroundColor: COLORS.accent,
  },
  watchlistText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});