import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { recognizeImage, recognizeAudio, recognizeVideo } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
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
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
      
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
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

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Logo Section */}
      <View style={styles.logoSection}>
        {/* Film Reel with Flowing Strip */}
        <View style={styles.filmReelWithFlow}>
          {/* Circular Film Reel */}
          <View style={styles.filmReelCircle}>
            <View style={styles.reelHole} style={{ top: 8, left: 8 }} />
            <View style={styles.reelHole} style={{ top: 8, right: 8 }} />
            <View style={styles.reelHole} style={{ bottom: 8, left: 8 }} />
            <View style={styles.reelHole} style={{ bottom: 8, right: 8 }} />
            <View style={styles.reelCenterHole} />
          </View>
          {/* Flowing Film Strip */}
          <View style={styles.flowingStrip} />
        </View>
        
        <Text style={styles.logo}>CINESCAN</Text>
        <Text style={styles.tagline}>Identify any movie instantly</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Options (appear above main button) */}
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
              <Ionicons name="mic" size={32} color="#FFFFFF" />
              <Text style={styles.optionText}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleVideo}>
              <Ionicons name="videocam" size={32} color="#FFFFFF" />
              <Text style={styles.optionText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleImage}>
              <Ionicons name="image" size={32} color="#FFFFFF" />
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
          <Animated.View 
            style={[
              styles.filmStripBorder,
              { 
                transform: [
                  { scale: isListening ? pulseAnim : 1 },
                  { rotate: isListening ? rotate : '0deg' }
                ] 
              }
            ]}
          >
            <View style={styles.innerCircle}>
              <MaterialCommunityIcons 
                name="filmstrip" 
                size={100} 
                color="#FFFFFF" 
              />
            </View>
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
            <View style={styles.stopButtonContent}>
              <Ionicons name="stop-circle" size={24} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  logoSection: {
    paddingTop: 80,
    alignItems: 'center',
    marginBottom: 40,
  },
  filmReelIcon: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '300',
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonContainer: {
    marginBottom: 80,
  },
  filmStripBorder: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  innerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 60,
  },
  optionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 60,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stopButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#E22134',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 30,
    left: '25%',
    right: '25%',
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
