import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import MovieCard from '../components/MovieCard';
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
      `Remove "${movieTitle}"?`,
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
      <View style={styles.emptyIconContainer}>
        <Ionicons name="film-outline" size={80} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Your Watchlist is Empty</Text>
      <Text style={styles.emptyText}>Start identifying movies to build your collection</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/scan')}
      >
        <Ionicons name="scan" size={20} color={COLORS.textPrimary} />
        <Text style={styles.emptyButtonText}>Scan Movies</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Watchlist</Text>
        <Text style={styles.count}>{watchlist.length} movies</Text>
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SIZES.spacingLarge,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SIZES.spacingLarge,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neonBlue,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
});
