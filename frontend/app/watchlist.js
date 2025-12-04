import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function WatchlistScreen() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    loadWatchlist();
    const interval = setInterval(loadWatchlist, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const updated = watchlist.filter(m => m.id !== movieId);
      await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
      setWatchlist(updated);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>My Watchlist</Text>
        <Text style={styles.subtitle}>{watchlist.length} movies saved</Text>

        {watchlist.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bookmark-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No movies yet</Text>
            <Text style={styles.emptySubtext}>Save movies you want to watch</Text>
          </View>
        ) : (
          watchlist.map(movie => (
            <View key={movie.id} style={styles.movieItem}>
              <TouchableOpacity
                style={styles.movieContent}
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
                  <Text style={styles.rating}>⭐ {movie.vote_average?.toFixed(1)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromWatchlist(movie.id)}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  movieItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  movieContent: {
    flexDirection: 'row',
    flex: 1,
  },
  poster: {
    width: 80,
    height: 120,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  removeButton: {
    padding: 12,
    justifyContent: 'center',
  },
});