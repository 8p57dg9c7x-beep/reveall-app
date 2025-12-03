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
  const [showOptions, setShowOptions] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [optionsAnim] = useState(new Animated.Value(0));

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
            toValue: 1.15,
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

  useEffect(() => {
    if (showOptions) {
      Animated.spring(optionsAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(optionsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showOptions]);

  const handleMainButton = () => {
    if (!isListening && !isProcessing) {
      setShowOptions(!showOptions);
    }
  };

  const handleAudio = async () => {
    setShowOptions(false);
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
    setShowOptions(false);
    try {
      setStatusText('Select video...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled) {
        setIsProcessing(true);
        setStatusText('Scanning...');
        
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
    setShowOptions(false);
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
        setStatusText('Scanning...');
        
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>CINESCAN</Text>
        <Text style={styles.tagline}>Identify any movie instantly</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Option Buttons (appear above main button) */}
        {showOptions && (
          <Animated.View 
            style={[
              styles.optionsContainer,
              {
                opacity: optionsAnim,
                transform: [
                  {
                    translateY: optionsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={styles.optionButton} onPress={handleAudio}>
              <Ionicons name="mic" size={28} color={COLORS.textPrimary} />
              <Text style={styles.optionText}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleVideo}>
              <Ionicons name="videocam" size={28} color={COLORS.textPrimary} />
              <Text style={styles.optionText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleImage}>
              <Ionicons name="image" size={28} color={COLORS.textPrimary} />
              <Text style={styles.optionText}>Image</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Main Circle Button */}
        <TouchableOpacity 
          style={styles.mainButtonContainer}
          onPress={handleMainButton}
          disabled={isListening || isProcessing}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: isListening ? pulseAnim : 1 }] }}>
            <LinearGradient
              colors={isListening ? ['#E22134', '#C41C2B'] : [COLORS.primary, COLORS.primaryDark]}
              style={[styles.mainButton, SHADOWS.button]}
            >
              <Ionicons 
                name={isListening ? "radio-button-on" : showOptions ? "close" : "scan"} 
                size={80} 
                color={COLORS.textPrimary} 
              />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

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
              colors={['#E22134', '#C41C2B']}
              style={styles.stopButtonGradient}
            >
              <Ionicons name="stop-circle" size={24} color={COLORS.textPrimary} />
              <Text style={styles.stopButtonText}>Stop</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 70,
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonContainer: {
    marginBottom: 100,
  },
  mainButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 60,
  },
  optionButton: {
    backgroundColor: COLORS.card,
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  optionText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 6,
    fontWeight: '600',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 80,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  stopButton: {
    position: 'absolute',
    bottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
});
