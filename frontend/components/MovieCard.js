import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MovieCard({ movie, onPress, onRemove }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.noPoster]}>
          <Ionicons name="film-outline" size={40} color="#999" />
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
      <Text style={styles.year}>
        {movie.release_date?.substring(0, 4) || 'N/A'}
      </Text>
      {movie.vote_average ? (
        <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
      ) : null}
      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  poster: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  noPoster: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginHorizontal: 8,
  },
  year: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
});
