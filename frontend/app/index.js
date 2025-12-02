import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW, SIZES } from '../constants/theme';
import { recognizeImage, recognizeAudio, recognizeVideo } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [identifiedMovie, setIdentifiedMovie] = useState(null);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const handleAudio = async () => {
    try {
      console.log('Audio button clicked!');
      Alert.alert('Audio Recognition', 'Starting audio recognition...', [
        {
          text: 'Start',
          onPress: async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Microphone access needed');
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

            // Auto stop after 10 seconds
            setTimeout(async () => {
              if (newRecording) {
                await stopAndIdentifyAudio(newRecording);
              }
            }, 10000);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } catch (error) {
      console.error('Audio error:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsListening(false);
      setStatusText('');
    }
  };

  const stopAndIdentifyAudio = async (recordingToStop) => {
    try {
      setStatusText('Processing audio...');
      await recordingToStop.stopAndUnloadAsync();
      const uri = recordingToStop.getURI();
      setRecording(null);

      const response = await recognizeAudio(uri);
      
      if (response.success && response.movie) {
        setIdentifiedMovie(response.movie);
        setStatusText('');
        router.push({
          pathname: '/result',
          params: { movieData: JSON.stringify(response.movie) }
        });
      } else {
        Alert.alert('No Match', 'Could not identify the movie from audio');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      Alert.alert('Error', 'Failed to identify movie');
    } finally {
      setIsListening(false);
      setStatusText('');
    }
  };

  const handleVideo = async () => {
    try {
      setIsScanning(true);
      setStatusText('Select video...');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled) {
        setStatusText('Scanning video...');
        const response = await recognizeVideo(result.assets[0].uri);
        
        if (response.success && response.movie) {
          router.push({
            pathname: '/result',
            params: { movieData: JSON.stringify(response.movie) }
          });
        } else {
          Alert.alert('No Match', 'Could not identify the movie from video');
        }
      }
    } catch (error) {
      console.error('Video error:', error);
      Alert.alert('Error', 'Failed to process video');
    } finally {
      setIsScanning(false);
      setStatusText('');
    }
  };

  const handleImage = async () => {
    try {
      setIsScanning(true);
      setStatusText('Choose option...');

      Alert.alert(
        'Select Image Source',
        'Choose how to provide the image',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status === 'granted') {
                const result = await ImagePicker.launchCameraAsync({
                  quality: 0.8,
                });
                if (!result.canceled) {
                  await processImage(result.assets[0].uri);
                }
              } else {
                Alert.alert('Permission denied', 'Camera access needed');
              }
              setIsScanning(false);
              setStatusText('');
            },
          },
          {
            text: 'Library',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status === 'granted') {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.8,
                });
                if (!result.canceled) {
                  await processImage(result.assets[0].uri);
                }
              } else {
                Alert.alert('Permission denied', 'Photo library access needed');
              }
              setIsScanning(false);
              setStatusText('');
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsScanning(false);
              setStatusText('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Image error:', error);
      Alert.alert('Error', 'Failed to process image');
      setIsScanning(false);
      setStatusText('');
    }
  };

  const processImage = async (uri) => {
    try {
      setStatusText('Scanning image...');
      const response = await recognizeImage(uri);
      
      if (response.success && response.movie) {
        router.push({
          pathname: '/result',
          params: { movieData: JSON.stringify(response.movie) }
        });
      } else {
        Alert.alert('No Match', 'Could not identify the movie from image');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      Alert.alert('Error', 'Failed to identify movie');
    } finally {
      setStatusText('');
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

      {/* Main Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, isListening && styles.buttonActive]}
          onPress={handleAudio}
          disabled={isListening || isScanning}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={isListening ? "radio-button-on" : "mic"} 
              size={SIZES.iconSize} 
              color={COLORS.gold} 
            />
          </View>
          <Text style={styles.buttonText}>AUDIO</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isScanning && styles.buttonActive]}
          onPress={handleVideo}
          disabled={isListening || isScanning}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="videocam" 
              size={SIZES.iconSize} 
              color={COLORS.gold} 
            />
          </View>
          <Text style={styles.buttonText}>VIDEO</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isScanning && styles.buttonActive]}
          onPress={handleImage}
          disabled={isListening || isScanning}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="image" 
              size={SIZES.iconSize} 
              color={COLORS.gold} 
            />
          </View>
          <Text style={styles.buttonText}>IMAGE</Text>
        </TouchableOpacity>
      </View>

      {/* Status Text */}
      {statusText ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      ) : null}

      {/* Stop button when listening */}
      {isListening && recording && (
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={() => stopAndIdentifyAudio(recording)}
        >
          <Text style={styles.stopButtonText}>Stop & Identify</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 120,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  buttonActive: {
    ...GLOW.gold,
  },
  iconContainer: {
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    letterSpacing: 1,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  stopButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: SIZES.borderRadius,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});
