import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { recognizeImage } from '../services/api';

export default function UploadPosterScreen() {
  const [isProcessing, setIsProcessing] = useState(false);

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Identify Movie Poster</Text>
        <Text style={styles.subtitle}>Take a photo or upload from gallery</Text>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={takePhoto}
          disabled={isProcessing}
        >
          <MaterialCommunityIcons name="camera" size={60} color={COLORS.textPrimary} />
          <Text style={styles.optionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={pickImage}
          disabled={isProcessing}
        >
          <MaterialCommunityIcons name="image-multiple" size={60} color={COLORS.textPrimary} />
          <Text style={styles.optionText}>Upload from Gallery</Text>
        </TouchableOpacity>

        {isProcessing && (
          <Text style={styles.processing}>Identifying...</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 60,
  },
  optionButton: {
    width: '80%',
    height: 160,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  processing: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
  },
});