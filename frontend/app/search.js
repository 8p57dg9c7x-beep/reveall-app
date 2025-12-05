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
  KeyboardAvoidingView,
  Platform,
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
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const API_KEY = '04253a70fe55d02b56ecc5f48e52b255';
      console.log('Searching for:', searchQuery);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      // Check for API errors
      if (!data.success && data.status_code) {
        console.error('TMDB API error:', data.status_message);
        Alert.alert('Search Error', data.status_message || 'Unable to search movies');
        setLoading(false);
        return;
      }
      
      console.log('Search results:', data.results?.length || 0, 'movies');
      setResults(data.results?.slice(0, 20) || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Unable to search movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchMovies(query);
  };

  const pickImage = async () => {
    try {
      console.log('📸 Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable photo library access');
        return;
      }

      console.log('📸 Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      console.log('📸 Picker result:', JSON.stringify(result, null, 2));
      
      // Check if user canceled
      if (result.canceled) {
        console.log('📸 User canceled image selection');
        return;
      }
      
      // Check if assets exist
      if (!result.assets || result.assets.length === 0) {
        console.log('❌ No assets in picker result');
        Alert.alert('Error', 'No image was selected. Please try again.');
        return;
      }
      
      // Check if first asset has URI
      if (!result.assets[0].uri) {
        console.log('❌ No URI in asset:', result.assets[0]);
        Alert.alert('Error', 'Invalid image selected. Please try another image.');
        return;
      }

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        console.log('🖼️ Starting image recognition for:', result.assets[0].uri);
        
        const response = await recognizeImage(result.assets[0].uri);
        console.log('🖼️ Recognition response:', response);

        if (response.success && response.movie) {
          console.log('✅ Movie found:', response.movie.title);
          router.push({
            pathname: '/result',
            params: { 
              movieData: JSON.stringify(response.movie),
              returnPath: '/search'
            }
          });
        } else {
          console.log('❌ No movie found:', response.error || 'Unknown error');
          Alert.alert('Not Found', response.error || 'Movie not recognized. Try a clearer poster.');
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
      console.log('📸 Requesting camera permissions...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📸 Camera permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable camera access');
        return;
      }

      console.log('📸 Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      console.log('📸 Camera result:', JSON.stringify(result, null, 2));
      
      // Check if user canceled
      if (result.canceled) {
        console.log('📸 User canceled camera');
        return;
      }
      
      // Check if assets exist
      if (!result.assets || result.assets.length === 0) {
        console.log('❌ No assets in camera result');
        Alert.alert('Error', 'No photo was captured. Please try again.');
        return;
      }
      
      // Check if first asset has URI
      if (!result.assets[0].uri) {
        console.log('❌ No URI in camera asset:', result.assets[0]);
        Alert.alert('Error', 'Invalid photo captured. Please try again.');
        return;
      }

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        console.log('🖼️ Starting image recognition for:', result.assets[0].uri);
        
        const response = await recognizeImage(result.assets[0].uri);
        console.log('🖼️ Recognition response:', response);

        if (response.success && response.movie) {
          console.log('✅ Movie found:', response.movie.title);
          router.push({
            pathname: '/result',
            params: { 
              movieData: JSON.stringify(response.movie),
              returnPath: '/search'
            }
          });
        } else {
          console.log('❌ No movie found:', response.error || 'Unknown error');
          Alert.alert('Not Found', response.error || 'Movie not recognized. Try a clearer poster.');
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
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
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <>
                <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }} style={styles.iconButton}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                  <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </>
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

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                  params: { 
                    movieData: JSON.stringify(movie),
                    returnPath: '/search'
                  }
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
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginLeft: 12,
  },
  iconButton: {
    padding: 4,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    paddingHorizontal: 20,
    paddingBottom: 120,
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
