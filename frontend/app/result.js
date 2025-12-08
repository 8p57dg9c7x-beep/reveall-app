import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import CastImage from '../components/CastImage';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  
  // Get movieId from params or from legacy movieData
  const movieId = params.movieId || (params.movieData ? JSON.parse(params.movieData).id : null);
  const song = params.songData ? JSON.parse(params.songData) : null;
  const returnPath = params.returnPath || '/discover';
  
  const movie = movieDetails;

  useEffect(() => {
    if (movieId) {
      // Load all data in parallel but wait for movie details before checking watchlist
      const loadAllData = async () => {
        await loadMovieDetails();
        await Promise.all([
          loadSimilarMovies(),
          checkWatchlist()
        ]);
      };
      loadAllData();
    } else if (song) {
      // Lyrics feature temporarily disabled
      // fetchLyrics();
      setLyrics({
        lyrics: null,
        message: "Lyrics feature is temporarily unavailable. We're working on bringing it back soon!"
      });
    }
  }, [movieId, song]);

  const loadMovieDetails = async () => {
    if (!movieId) return;
    setLoadingDetails(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cinescan.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/movie/${movieId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      
      const data = await response.json();
      setMovieDetails(data);
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadSimilarMovies = async () => {
    if (!movieId) return;
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cinescan.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/movie/${movieId}/similar`);
      const data = await response.json();
      setSimilarMovies(data.results?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error loading similar movies:', error);
    }
  };

  const checkWatchlist = async () => {
    if (!movieDetails?.id) return;
    try {
      const stored = await AsyncStorage.getItem('watchlist');
      let watchlist = stored ? JSON.parse(stored) : [];
      setInWatchlist(watchlist.some(m => m.id === movieDetails.id));
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

  const fetchLyrics = async () => {
    if (!song) return;
    
    setLoadingLyrics(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cinescan.preview.emergentagent.com';
      const query = encodeURIComponent(`${song.title} ${song.artist}`);
      const res = await fetch(`${API_URL}/api/lyrics/${query}`);
      const data = await res.json();
      
      if (data.success && data.lyrics) {
        setLyrics({
          lyrics: data.lyrics,
          title: data.title,
          artist: data.artist
        });
      } else {
        setLyrics({
          lyrics: null,
          message: data.message || "No lyrics found for this song yet."
        });
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLyrics({
        lyrics: null,
        message: "Unable to fetch lyrics at this time."
      });
    } finally {
      setLoadingLyrics(false);
    }
  };

  if (song) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push(returnPath)}>
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

          {/* Lyrics Section */}
          <View style={styles.lyricsSection}>
            <Text style={styles.sectionTitle}>Lyrics</Text>
            {loadingLyrics ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : lyrics?.lyrics ? (
              <View style={styles.lyricsContainer}>
                <ScrollView 
                  style={styles.lyricsScroll} 
                  nestedScrollEnabled
                  removeClippedSubviews
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.lyricsText}>{lyrics.lyrics}</Text>
                </ScrollView>
              </View>
            ) : (
              <View style={styles.noLyricsContainer}>
                <MaterialCommunityIcons name="music-note-off" size={40} color={COLORS.textSecondary} />
                <Text style={styles.noLyricsText}>{lyrics?.message || "No lyrics found for this song yet."}</Text>
              </View>
            )}
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
        {/* Loading Indicator */}
        {loadingDetails && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push(returnPath)}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {movie.poster_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
              style={styles.poster}
            />
          )}

          <Text style={styles.title}>{movie.title}</Text>
          
          {/* Movie Meta Information */}
          <View style={styles.metaContainer}>
            {movie.release_date && (
              <Text style={styles.metaText}>
                <MaterialCommunityIcons name="calendar" size={16} color={COLORS.textSecondary} />
                {' '}{new Date(movie.release_date).getFullYear()}
              </Text>
            )}
            {movie.runtime && (
              <Text style={styles.metaText}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textSecondary} />
                {' '}{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </Text>
            )}
            {movie.vote_average && (
              <Text style={styles.metaText}>
                <MaterialCommunityIcons name="star" size={16} color={COLORS.accent} />
                {' '}{movie.vote_average.toFixed(1)}/10
              </Text>
            )}
          </View>

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

          {/* Cast Section */}
          {movie?.credits?.cast && Array.isArray(movie.credits.cast) && movie.credits.cast.length > 0 && (
            <View style={styles.castSection}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} removeClippedSubviews>
                {movie.credits.cast.slice(0, 10).map((actor, index) => (
                  <View key={actor.id || `actor-${index}`} style={styles.castCard}>
                    <CastImage 
                      profilePath={actor.profile_path} 
                      style={styles.castImage} 
                    />
                    <Text style={styles.castName} numberOfLines={2}>{actor.name || 'Unknown'}</Text>
                    <Text style={styles.castCharacter} numberOfLines={2}>{actor.character || 'Character'}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Director Section */}
          {movie?.credits?.crew && Array.isArray(movie.credits.crew) && (
            (() => {
              const director = movie.credits.crew.find(person => person?.job === 'Director');
              return director && director.name ? (
                <View style={styles.directorSection}>
                  <Text style={styles.directorLabel}>Director</Text>
                  <Text style={styles.directorName}>{director.name}</Text>
                </View>
              ) : null;
            })()
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

          {similarMovies.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.sectionTitle}>Similar Movies</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} removeClippedSubviews>
                {similarMovies.map(similarMovie => (
                  <TouchableOpacity
                    key={similarMovie.id}
                    style={styles.similarCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      router.push({
                        pathname: '/result',
                        params: { 
                          movieId: similarMovie.id.toString(),
                          returnPath: returnPath
                        }
                      });
                    }}
                  >
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w200${similarMovie.poster_path}` }}
                      style={styles.similarPoster}
                    />
                    <Text style={styles.similarTitle} numberOfLines={2}>{similarMovie.title}</Text>
                  </TouchableOpacity>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
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
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  castSection: {
    width: '100%',
    marginBottom: 24,
  },
  castCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  castImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  castCharacter: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  directorSection: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  directorLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  directorName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
    marginTop: 40,
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
  similarSection: {
    width: '100%',
    marginBottom: 40,
    paddingTop: 16,
  },
  similarCard: {
    width: 120,
    marginRight: 12,
  },
  similarPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  similarTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  lyricsSection: {
    width: '100%',
    marginBottom: 24,
  },
  lyricsContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  lyricsScroll: {
    maxHeight: 368,
  },
  lyricsText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'System',
  },
  noLyricsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLyricsText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});