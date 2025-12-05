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
  const [playlist, setPlaylist] = useState([]);
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' or 'music'

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [moviesStored, musicStored] = await Promise.all([
        AsyncStorage.getItem('watchlist'),
        AsyncStorage.getItem('playlist')
      ]);
      if (moviesStored) setWatchlist(JSON.parse(moviesStored));
      if (musicStored) setPlaylist(JSON.parse(musicStored));
    } catch (error) {
      console.error('Error loading data:', error);
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

  const removeFromPlaylist = async (songId) => {
    try {
      const updated = playlist.filter(s => s.title !== songId);
      await AsyncStorage.setItem('playlist', JSON.stringify(updated));
      setPlaylist(updated);
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'movies' && styles.tabButtonActive]}
            onPress={() => setActiveTab('movies')}
          >
            <Text style={[styles.tabText, activeTab === 'movies' && styles.tabTextActive]}>
              Movies ({watchlist.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'music' && styles.tabButtonActive]}
            onPress={() => setActiveTab('music')}
          >
            <Text style={[styles.tabText, activeTab === 'music' && styles.tabTextActive]}>
              Music ({playlist.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'movies' ? (
          watchlist.length === 0 ? (
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
                    params: { 
                      movieData: JSON.stringify(movie),
                      returnPath: '/watchlist'
                    }
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
          )
        ) : (
          playlist.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="music-note" size={80} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No songs yet</Text>
              <Text style={styles.emptySubtext}>Identified songs will appear here</Text>
            </View>
          ) : (
            playlist.map((song, index) => (
              <View key={index} style={styles.songItem}>
                <TouchableOpacity
                  style={styles.songContent}
                  onPress={() => router.push({
                    pathname: '/result',
                    params: { 
                      songData: JSON.stringify(song),
                      returnPath: '/watchlist'
                    }
                  })}
                >
                  <MaterialCommunityIcons name="music-circle" size={60} color={COLORS.accent} />
                  <View style={styles.info}>
                    <Text style={styles.title}>{song.title}</Text>
                    <Text style={styles.artist}>{song.artist}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromPlaylist(song.title)}
                >
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))
          )
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 140,
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  songItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  movieContent: {
    flexDirection: 'row',
    flex: 1,
  },
  songContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  poster: {
    width: 90,
    height: 135,
  },
  info: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  artist: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  rating: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  removeButton: {
    padding: 16,
    justifyContent: 'center',
  },
});