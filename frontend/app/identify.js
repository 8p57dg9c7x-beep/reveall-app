import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import GradientBackground from '../components/GradientBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { recognizeImage, recognizeAudio, recognizeVideo } from '../services/api';

export default function IdentifyScreen() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // 'image', 'audio', 'video'
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Identifying movie...');

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setSelectedFile(null);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'CINESCAN needs camera access to identify movies. Please enable in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          type: 'image',
          name: 'photo.jpg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'CINESCAN needs photo access to identify movies. Please enable in Settings.',
          [{ text: 'Cancel', style: 'cancel' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          type: 'image',
          name: 'image.jpg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to choose image: ' + error.message);
    }
  };

  const handleStartRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'CINESCAN needs microphone access to record audio. Please enable in Settings.',
          [{ text: 'Cancel', style: 'cancel' }]
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording: ' + error.message);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setSelectedFile({
        uri: uri,
        type: 'audio',
        name: 'recording.m4a',
      });
      
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording: ' + error.message);
    }
  };

  const handleUploadAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          type: 'audio',
          name: result.assets[0].name,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload audio: ' + error.message);
    }
  };

  const handleUploadVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          type: 'video',
          name: result.assets[0].name,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video: ' + error.message);
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      let response;
      
      if (selectedFile.type === 'image') {
        setLoadingMessage('Identifying movie from image...');
        response = await recognizeImage(selectedFile.uri);
      } else if (selectedFile.type === 'audio') {
        setLoadingMessage('Identifying movie from audio... This may take a moment.');
        response = await recognizeAudio(selectedFile.uri);
      } else if (selectedFile.type === 'video') {
        setLoadingMessage('Identifying movie from video... This may take a moment.');
        response = await recognizeVideo(selectedFile.uri);
      }

      if (response.success && response.movie) {
        // Navigate to result screen with movie data
        router.push({
          pathname: '/result',
          params: { movieData: JSON.stringify(response.movie) }
        });
      } else {
        Alert.alert(
          'No Match Found',
          response.error || 'Could not identify the movie. Please try another image, audio, or video.'
        );
      }
    } catch (error) {
      console.error('Identification error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to identify movie. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Identify Movie</Text>

        {/* Mode Selection */}
        {!mode && (
          <View style={styles.modeContainer}>
            <Text style={styles.subtitle}>Choose identification method:</Text>
            
            <TouchableOpacity 
              style={styles.modeButton}
              onPress={() => handleModeSelect('image')}
            >
              <Ionicons name="camera" size={40} color="#667eea" />
              <Text style={styles.modeButtonText}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modeButton}
              onPress={() => handleModeSelect('audio')}
            >
              <Ionicons name="musical-notes" size={40} color="#667eea" />
              <Text style={styles.modeButtonText}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modeButton}
              onPress={() => handleModeSelect('video')}
            >
              <Ionicons name="videocam" size={40} color="#667eea" />
              <Text style={styles.modeButtonText}>Video</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image Mode Options */}
        {mode === 'image' && !selectedFile && (
          <View style={styles.optionsContainer}>
            <Text style={styles.subtitle}>Select image source:</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleChooseFromGallery}>
              <Ionicons name="images" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeButton} onPress={() => setMode(null)}>
              <Text style={styles.changeButtonText}>← Change Method</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Audio Mode Options */}
        {mode === 'audio' && !selectedFile && (
          <View style={styles.optionsContainer}>
            <Text style={styles.subtitle}>Select audio source:</Text>
            
            {!isRecording ? (
              <>
                <TouchableOpacity style={styles.optionButton} onPress={handleStartRecording}>
                  <Ionicons name="mic" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.optionButtonText}>Record Audio</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton} onPress={handleUploadAudio}>
                  <Ionicons name="folder-open" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.optionButtonText}>Upload Audio File</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.recordingContainer}>
                <Ionicons name="radio-button-on" size={60} color="#ff4444" />
                <Text style={styles.recordingText}>Recording...</Text>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
                  <Text style={styles.stopButtonText}>Stop Recording</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isRecording && (
              <TouchableOpacity style={styles.changeButton} onPress={() => setMode(null)}>
                <Text style={styles.changeButtonText}>← Change Method</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Video Mode Options */}
        {mode === 'video' && !selectedFile && (
          <View style={styles.optionsContainer}>
            <Text style={styles.subtitle}>Select video:</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleUploadVideo}>
              <Ionicons name="folder-open" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>Upload Video File</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeButton} onPress={() => setMode(null)}>
              <Text style={styles.changeButtonText}>← Change Method</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* File Preview & Identify */}
        {selectedFile && (
          <View style={styles.previewContainer}>
            <Text style={styles.subtitle}>Selected file:</Text>
            
            {selectedFile.type === 'image' && (
              <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
            )}
            
            <Text style={styles.fileName}>{selectedFile.name}</Text>

            <TouchableOpacity style={styles.identifyButton} onPress={handleIdentify}>
              <Ionicons name="search" size={24} color="#667eea" style={styles.buttonIcon} />
              <Text style={styles.identifyButtonText}>Identify Movie</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.changeButton} 
              onPress={() => setSelectedFile(null)}
            >
              <Text style={styles.changeButtonText}>← Change File</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  modeContainer: {
    alignItems: 'center',
  },
  modeButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 8,
  },
  optionsContainer: {
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 16,
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  recordingText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
  stopButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeButton: {
    marginTop: 16,
  },
  changeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 14,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  identifyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
});
