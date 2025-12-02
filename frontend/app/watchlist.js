import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import MovieCard from '../components/MovieCard';
import { Ionicons } from '@expo/vector-icons';
import { getWatchlist, removeFromWatchlist } from '../services/storage';

export default function WatchlistScreen() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = async () => {
    setLoading(true);
    const data = await getWatchlist();
    setWatchlist(data);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const handleRemove = async (movieId, movieTitle) => {
    Alert.alert(
      'Remove from Watchlist',
      `Remove "${movieTitle}" from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFromWatchlist(movieId);
            loadWatchlist();
          },
        },
      ]
    );
  };

  const handleMoviePress = (movie) => {
    router.push({
      pathname: '/result',
      params: { movieData: JSON.stringify(movie) }
    });
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="film-outline" size={80} color="#FFFFFF" />
      <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
      <Text style={styles.emptyText}>Start identifying movies!</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/identify')}
      >
        <Text style={styles.emptyButtonText}>Identify Movies</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>My Watchlist</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Watchlist */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : watchlist.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={watchlist}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MovieCard
                movie={item}
                onPress={() => handleMoviePress(item)}
                onRemove={() => handleRemove(item.id, item.title)}
              />
            )}
          />
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});
