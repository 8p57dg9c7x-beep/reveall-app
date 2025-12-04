import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import { recognizeMusic } from '../services/api';

export default function HomeScreen() {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const startListening = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

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
        if (newRecording) {
          try {
            await newRecording.stopAndUnloadAsync();
            const uri = newRecording.getURI();
            setIsListening(false);
            const response = await recognizeMusic(uri);

            if (response.success && response.song) {
              // Save to playlist
              try {
                const stored = await AsyncStorage.getItem('playlist');
                let playlist = stored ? JSON.parse(stored) : [];
                playlist.unshift(response.song);
                await AsyncStorage.setItem('playlist', JSON.stringify(playlist.slice(0, 50)));
              } catch (e) {
                console.error('Error saving to playlist:', e);
              }
              
              router.push({
                pathname: '/result',
                params: { songData: JSON.stringify(response.song) }
              });
            }
          } catch (error) {
            setIsListening(false);
          }
        }
      }, 10000);
    } catch (error) {
      setIsListening(false);
    }
  };

  if (isListening) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <View style={styles.listeningContent}>
          <Text style={styles.listeningTitle}>Listening...</Text>
          <Text style={styles.listeningSubtitle}>Hold your device near the music</Text>
          
          <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.pulseMiddle}>
              <View style={styles.pulseInner}>
                <MaterialCommunityIcons name="music-note" size={100} color={COLORS.textPrimary} />
              </View>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

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
        <Text style={styles.tapText}>Tap to Identify</Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={startListening}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="music" size={100} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
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
  tapText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 60,
  },
  mainButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 5,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  listeningSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 60,
  },
  pulseOuter: {
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(159, 91, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseMiddle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(159, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(159, 91, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});