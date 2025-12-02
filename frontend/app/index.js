import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { COLORS, GLOW, SIZES } from '../constants/theme';
import { recognizeImage, recognizeAudio, recognizeVideo } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    return () => {
      if (recording && recording._canRecord) {
        recording.stopAndUnloadAsync().catch(err => {
          console.log('Cleanup error:', err);
        });
      }
    };
  }, [recording]);

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

      // Auto stop after 10 seconds
      setTimeout(async () => {
        if (newRecording) {
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
      setStatusText('Processing audio...');
      setIsListening(false);
      setIsProcessing(true);
      
      // Stop and get URI
      await recordingToStop.stopAndUnloadAsync();
      const uri = recordingToStop.getURI();
      
      // Clear recording state immediately to prevent double-unload
      setRecording(null);

      console.log('Calling audio recognition API with URI:', uri);
      const response = await recognizeAudio(uri);
      console.log('Audio recognition response:', response);
      
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
      setStatusText('Failed to identify movie');
      setTimeout(() => setStatusText(''), 3000);
      setRecording(null); // Clear recording on error too
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
        
        console.log('Calling video recognition API...');
        const response = await recognizeVideo(result.assets[0].uri);
        console.log('Video recognition response:', response);
        
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
        
        console.log('Calling image recognition API...');
        const response = await recognizeImage(result.assets[0].uri);
        console.log('Image recognition response:', response);
        
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

      {/* Main Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, isListening && styles.buttonActive]}
          onPress={handleAudio}
          disabled={isListening || isProcessing}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>AUDIO</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isProcessing && styles.buttonActive]}
          onPress={handleVideo}
          disabled={isListening || isProcessing}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>VIDEO</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isProcessing && styles.buttonActive]}
          onPress={handleImage}
          disabled={isListening || isProcessing}
          activeOpacity={0.7}
        >
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
    color: COLORS.blue,
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
    borderColor: COLORS.blue,
    backgroundColor: 'rgba(30, 144, 255, 0.05)',
  },
  buttonActive: {
    backgroundColor: 'rgba(30, 144, 255, 0.15)',
    ...GLOW.blue,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blue,
    letterSpacing: 1.5,
    textAlign: 'center',
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
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: SIZES.borderRadius,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});
