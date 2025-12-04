import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { recognizeImage } from '../services/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const searchMovies = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const API_KEY = '7e6817a0af67d296b7bd60bdf2ffc3a6';
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.results?.slice(0, 20) || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        const response = await recognizeImage(result.assets[0].uri);

        if (response.success && response.movie) {
          router.push({
            pathname: '/result',
            params: { movieData: JSON.stringify(response.movie) }
          });
        } else {
          Alert.alert('Not Found', 'Movie not recognized. Try a clearer poster.');
        }
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        const response = await recognizeImage(result.assets[0].uri);

        if (response.success && response.movie) {
          router.push({
            pathname: '/result',
            params: { movieData: JSON.stringify(response.movie) }
          });
        } else {
          Alert.alert('Not Found', 'Movie not recognized. Try a clearer poster.');
        }
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Movies</Text>
        
        {/* Text Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title..."
            placeholderTextColor={COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => searchMovies(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Image Upload Options */}
        <View style={styles.uploadSection}>
          <Text style={styles.orText}>Or identify by poster:</Text>
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={takePhoto}
              disabled={isProcessing}
            >
              <MaterialCommunityIcons name="camera" size={32} color={COLORS.textPrimary} />
              <Text style={styles.uploadText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={isProcessing}
            >
              <MaterialCommunityIcons name="image-multiple" size={32} color={COLORS.textPrimary} />
              <Text style={styles.uploadText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading || isProcessing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="movie-search" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Search or Upload</Text>
            <Text style={styles.emptySubtext}>Find movies by title or poster</Text>
          </View>
        ) : (
          results.map(movie => (
            <TouchableOpacity
              key={movie.id}
              style={styles.movieItem}
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
                <Text style={styles.year}>{movie.release_date?.substring(0, 4)}</Text>
                <Text style={styles.rating}>⭐ {movie.vote_average?.toFixed(1)}</Text>
              </View>
            </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginLeft: 12,
  },
  uploadSection: {
    marginTop: 8,
  },
  orText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    height: 80,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  scrollContent: {
    padding: 20,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
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
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: COLORS.accent,
  },
});