import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import { recognizeMusic, recognizeImage } from '../services/api';

export default function HomeScreen() {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleIdentifyTap = () => {
    setShowOptions(!showOptions);
  };

  const handleMusic = async () => {
    setShowOptions(false);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable microphone access');
        return;
      }

      setIsProcessing(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setTimeout(async () => {
        try {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          const response = await recognizeMusic(uri);

          if (response.success && response.song) {
            router.push({
              pathname: '/result',
              params: { songData: JSON.stringify(response.song) }
            });
          } else {
            Alert.alert('Not Found', 'Song not recognized. Try again.');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to identify music');
        } finally {
          setIsProcessing(false);
        }
      }, 10000);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handlePoster = async () => {
    setShowOptions(false);
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
          Alert.alert('Not Found', 'Movie not recognized from poster.');
        }
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to identify poster');
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="filmstrip" size={32} color={COLORS.textPrimary} />
        <Text style={styles.logo}>CINESCAN</Text>
      </View>

      <View style={styles.centerContent}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.identifyButton}
            onPress={handleIdentifyTap}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <MaterialCommunityIcons
              name="filmstrip-box"
              size={100}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </Animated.View>

        {showOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={handleMusic}>
              <MaterialCommunityIcons name="music" size={36} color={COLORS.textPrimary} />
              <Text style={styles.optionText}>Music</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={handlePoster}>
              <MaterialCommunityIcons name="image" size={36} color={COLORS.textPrimary} />
              <Text style={styles.optionText}>Poster</Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
          <Text style={styles.processingText}>Processing...</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
    letterSpacing: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identifyButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 5,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 30,
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  processingText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
  },
});