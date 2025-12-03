import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { recognizeImage, recognizeAudio, recognizeVideo } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    return () => {
      if (recording && recording._canRecord) {
        recording.stopAndUnloadAsync().catch(err => console.log('Cleanup:', err));
      }
    };
  }, [recording]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleAudio = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable microphone access');
        return;
      }

      setIsListening(true);
      setStatusText('Listening...');

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
          await stopAndIdentifyAudio(newRecording);
        }
      }, 10000);
    } catch (error) {
      console.error('Audio error:', error);
      setStatusText('Failed to start recording');
      setIsListening(false);
      setTimeout(() => setStatusText(''), 2000);
    }
  };

  const stopAndIdentifyAudio = async (recordingToStop) => {
    try {
      setStatusText('Identifying...');
      setIsListening(false);
      setIsProcessing(true);
      
      await recordingToStop.stopAndUnloadAsync();
      const uri = recordingToStop.getURI();
      setRecording(null);

      const response = await recognizeAudio(uri);
      
      if (response.success && response.movie) {
        setStatusText('');
        router.push({
          pathname: '/result',
          params: { movieData: JSON.stringify(response.movie) }
        });
      } else {
        setStatusText(response.error || 'No movie found');
        setTimeout(() => setStatusText(''), 3000);
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setStatusText('Failed to identify');
      setTimeout(() => setStatusText(''), 3000);
      setRecording(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideo = async () => {
    try {
      setStatusText('Select video...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled) {
        setIsProcessing(true);
        setStatusText('Scanning video...');
        
        const response = await recognizeVideo(result.assets[0].uri);
        
        if (response.success && response.movie) {
          setStatusText('');
          router.push({
            pathname: '/result',
            params: { movieData: JSON.stringify(response.movie) }
          });
        } else {
          setStatusText(response.error || 'No movie found');
          setTimeout(() => setStatusText(''), 3000);
        }
      } else {
        setStatusText('');
      }
    } catch (error) {
      console.error('Video error:', error);
      setStatusText('Failed to process video');
      setTimeout(() => setStatusText(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable photo access');
        return;
      }

      setStatusText('Choose image...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        setStatusText('Scanning image...');
        
        const response = await recognizeImage(result.assets[0].uri);
        
        if (response.success && response.movie) {
          setStatusText('');
          router.push({
            pathname: '/result',
            params: { movieData: JSON.stringify(response.movie) }
          });
        } else {
          setStatusText(response.error || 'No movie found');
          setTimeout(() => setStatusText(''), 3000);
        }
      } else {
        setStatusText('');
      }
    } catch (error) {
      console.error('Image error:', error);
      setStatusText('Failed to process image');
      setTimeout(() => setStatusText(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3D']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.logoGradient}
          >
            <Ionicons name="film" size={32} color={COLORS.textPrimary} />
          </LinearGradient>
        </View>
        <Text style={styles.logo}>CINESCAN</Text>
        <Text style={styles.tagline}>Identify movies, shows & anime instantly</Text>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.buttonWrapper}
          onPress={handleAudio}
          disabled={isListening || isProcessing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isListening ? [COLORS.accent, COLORS.primary] : [COLORS.primary, COLORS.primaryDark]}
            style={[styles.button, isListening && SHADOWS.glow]}
          >
            <Animated.View style={{ transform: [{ scale: isListening ? pulseAnim : 1 }] }}>
              <Ionicons 
                name={isListening ? "radio-button-on" : "mic"} 
                size={SIZES.iconSizeLarge} 
                color={COLORS.textPrimary} 
              />
            </Animated.View>
            <Text style={styles.buttonText}>AUDIO</Text>
            <Text style={styles.buttonSubtext}>Record & identify</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonWrapper}
          onPress={handleVideo}
          disabled={isListening || isProcessing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.button}
          >
            <Ionicons 
              name="videocam" 
              size={SIZES.iconSizeLarge} 
              color={COLORS.textPrimary} 
            />
            <Text style={styles.buttonText}>VIDEO</Text>
            <Text style={styles.buttonSubtext}>Upload clip</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonWrapper}
          onPress={handleImage}
          disabled={isListening || isProcessing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.button}
          >
            <Ionicons 
              name="image" 
              size={SIZES.iconSizeLarge} 
              color={COLORS.textPrimary} 
            />
            <Text style={styles.buttonText}>IMAGE</Text>
            <Text style={styles.buttonSubtext}>Scan poster</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Status Text */}
      {statusText ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      ) : null}

      {/* Stop button */}
      {isListening && recording && (
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={() => stopAndIdentifyAudio(recording)}
        >
          <LinearGradient
            colors={[COLORS.error, '#CC0000']}
            style={styles.stopButtonGradient}
          >
            <Ionicons name="stop-circle" size={24} color={COLORS.textPrimary} />
            <Text style={styles.stopButtonText}>Stop & Identify</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>⚡ Powered by AI • Faster than Shazam</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    flex: 1,
    maxWidth: 120,
  },
  button: {
    aspectRatio: 1,
    borderRadius: SIZES.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...SHADOWS.card,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
    letterSpacing: 1,
  },
  buttonSubtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  stopButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
