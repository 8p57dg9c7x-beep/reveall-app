import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { recognizeMusic } from '../services/api';

export default function HomeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [recentlyFound, setRecentlyFound] = useState([]);

  useEffect(() => {
    loadRecentlyFound();
  }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const loadRecentlyFound = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentlyFound');
      if (stored) {
        setRecentlyFound(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recently found:', error);
    }
  };

  const saveToRecentlyFound = async (item) => {
    try {
      const newRecent = [item, ...recentlyFound.slice(0, 9)];
      await AsyncStorage.setItem('recentlyFound', JSON.stringify(newRecent));
      setRecentlyFound(newRecent);
    } catch (error) {
      console.error('Error saving recently found:', error);
    }
  };

  const handleIdentify = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable microphone access');
        return;
      }

      setIsListening(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);

      setTimeout(async () => {
        if (newRecording && newRecording._canRecord) {
          await stopAndIdentify(newRecording);
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsListening(false);
    }
  };

  const stopAndIdentify = async (recordingToStop) => {
    try {
      await recordingToStop.stopAndUnloadAsync();
      const uri = recordingToStop.getURI();
      setRecording(null);
      setIsListening(false);

      const response = await recognizeMusic(uri);

      if (response.success && response.song) {
        await saveToRecentlyFound({
          ...response.song,
          timestamp: Date.now(),
        });
        router.push({
          pathname: '/result',
          params: { songData: JSON.stringify(response.song) }
        });
      } else {
        alert('Song not found - try again');
      }
    } catch (error) {
      console.error('Error identifying:', error);
      setIsListening(false);
      setRecording(null);
    }
  };

  const cancelListening = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsListening(false);
  };

  if (isListening) {
    return (
      <View style={styles.listeningContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelListening}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.listeningContent}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="music-note" size={80} color={COLORS.textPrimary} />
            </View>
          </Animated.View>

          <Text style={styles.listeningTitle}>Listening for music</Text>
          <Text style={styles.listeningSubtitle}>Make sure your device can hear the song clearly</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.tapText}>Tap to Identify</Text>

        <TouchableOpacity style={styles.identifyButton} onPress={handleIdentify} activeOpacity={0.8}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="music-note" size={80} color={COLORS.textPrimary} />
          </View>
        </TouchableOpacity>

        {recentlyFound.length > 0 && (
          <View style={styles.recentlyFoundSection}>
            <Text style={styles.sectionTitle}>Recently Found</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentlyFound.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentCard}
                  onPress={() => router.push({
                    pathname: '/result',
                    params: { songData: JSON.stringify(item) }
                  })}
                >
                  <View style={styles.recentCardContent}>
                    <MaterialCommunityIcons name="music" size={24} color={COLORS.primary} />
                    <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 100,
    alignItems: 'center',
  },
  tapText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 60,
  },
  identifyButton: {
    marginBottom: 80,
  },
  logoCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  recentlyFoundSection: {
    width: '100%',
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  recentScroll: {
    paddingRight: 24,
  },
  recentCard: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  recentCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  recentArtist: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  listeningContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cancelButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 8,
    fontWeight: '600',
  },
  listeningContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pulseCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  listeningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  listeningSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
