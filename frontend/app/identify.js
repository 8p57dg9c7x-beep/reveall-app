import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW, SIZES } from '../constants/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import { recognizeImage, recognizeAudio, recognizeVideo } from '../services/api';

export default function IdentifyScreen() {
  const router = useRouter();
  const [mode, setMode] = useState(null);
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
        Alert.alert('Permission Required', 'Camera access is needed to identify movies.');
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
        Alert.alert('Permission Required', 'Photo access is needed to identify movies.');
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
        Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
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
        setLoadingMessage('Analyzing image...');
        response = await recognizeImage(selectedFile.uri);
      } else if (selectedFile.type === 'audio') {
        setLoadingMessage('Processing audio...');
        response = await recognizeAudio(selectedFile.uri);
      } else if (selectedFile.type === 'video') {
        setLoadingMessage('Extracting audio from video...');
        response = await recognizeVideo(selectedFile.uri);
      }

      if (response.success && response.movie) {
        router.push({
          pathname: '/result',
          params: { movieData: JSON.stringify(response.movie) }
        });
      } else {
        Alert.alert('No Match Found', response.error || 'Could not identify the movie.');
      }
    } catch (error) {
      console.error('Identification error:', error);
      Alert.alert('Error', 'Failed to identify movie. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Identify Movie</Text>
        </View>

        {/* Mode Selection */}
        {!mode && (
          <View style={styles.modeContainer}>
            <Text style={styles.subtitle}>Choose recognition method:</Text>
            
            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModeSelect('image')}
            >
              <View style={styles.modeIconCircle}>
                <Ionicons name="camera" size={32} color={COLORS.neonBlue} />
              </View>
              <Text style={styles.modeTitle}>Image</Text>
              <Text style={styles.modeDescription}>Scan posters or scenes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModeSelect('audio')}
            >
              <View style={styles.modeIconCircle}>
                <Ionicons name="mic" size={32} color={COLORS.neonBlue} />
              </View>
              <Text style={styles.modeTitle}>Audio</Text>
              <Text style={styles.modeDescription}>Record or upload audio</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModeSelect('video')}
            >
              <View style={styles.modeIconCircle}>
                <Ionicons name="videocam" size={32} color={COLORS.neonBlue} />
              </View>
              <Text style={styles.modeTitle}>Video</Text>
              <Text style={styles.modeDescription}>Upload video clips</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image Mode */}
        {mode === 'image' && !selectedFile && (
          <View style={styles.optionsContainer}>
            <View style={styles.uploadBox}>
              <Ionicons name="cloud-upload-outline" size={60} color={COLORS.metallicSilver} />
              <Text style={styles.uploadText}>Upload Image</Text>
            </View>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={20} color={COLORS.textPrimary} />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleChooseFromGallery}>
              <Ionicons name="images" size={20} color={COLORS.textPrimary} />
              <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => setMode(null)}>
              <Text style={styles.backLinkText}>← Change Method</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Audio Mode */}
        {mode === 'audio' && !selectedFile && (
          <View style={styles.optionsContainer}>
            {!isRecording ? (
              <>
                <View style={styles.waveformContainer}>
                  <Ionicons name="mic" size={60} color={COLORS.neonBlue} />
                  <Text style={styles.waveformText}>Ready to Record</Text>
                </View>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleStartRecording}>
                  <Ionicons name="mic" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.actionButtonText}>Start Recording</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleUploadAudio}>
                  <Ionicons name="folder-open" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.actionButtonText}>Upload Audio File</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.recordingContainer}>
                <View style={[styles.waveformContainer, styles.waveformActive]}>
                  <Ionicons name="radio-button-on" size={80} color={COLORS.neonBlue} />
                  <Text style={styles.recordingText}>Recording...</Text>
                </View>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
                  <Text style={styles.stopButtonText}>Stop Recording</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isRecording && (
              <TouchableOpacity style={styles.backLink} onPress={() => setMode(null)}>
                <Text style={styles.backLinkText}>← Change Method</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Video Mode */}
        {mode === 'video' && !selectedFile && (
          <View style={styles.optionsContainer}>
            <View style={styles.uploadBox}>
              <Ionicons name="videocam-outline" size={60} color={COLORS.metallicSilver} />
              <Text style={styles.uploadText}>Upload Video</Text>
            </View>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleUploadVideo}>
              <Ionicons name="folder-open" size={20} color={COLORS.textPrimary} />
              <Text style={styles.actionButtonText}>Choose Video File</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => setMode(null)}>
              <Text style={styles.backLinkText}>← Change Method</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* File Preview & Identify */}
        {selectedFile && (
          <View style={styles.previewContainer}>
            {selectedFile.type === 'image' && (
              <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
            )}
            
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileType}>{selectedFile.type.toUpperCase()}</Text>
            </View>

            <TouchableOpacity style={styles.identifyButton} onPress={handleIdentify}>
              <Ionicons name="scan" size={20} color={COLORS.background} />
              <Text style={styles.identifyButtonText}>Identify Movie</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => setSelectedFile(null)}>
              <Text style={styles.backLinkText}>← Change File</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SIZES.spacingLarge,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  modeContainer: {
    paddingHorizontal: SIZES.spacingLarge,
  },
  modeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '30',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  modeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.neonBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  optionsContainer: {
    paddingHorizontal: SIZES.spacingLarge,
  },
  uploadBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.metallicSilver,
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  waveformContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '30',
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  waveformActive: {
    borderColor: COLORS.neonBlue,
    ...GLOW.neonBlue,
  },
  waveformText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '50',
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    color: COLORS.neonBlue,
    fontWeight: 'bold',
    marginTop: 16,
  },
  stopButton: {
    backgroundColor: COLORS.error,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    paddingHorizontal: 40,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  backLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  previewContainer: {
    paddingHorizontal: SIZES.spacingLarge,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: SIZES.borderRadius,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '30',
  },
  fileInfo: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 20,
  },
  fileName: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  fileType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neonBlue,
    borderRadius: SIZES.borderRadius,
    padding: 18,
    ...GLOW.neonBlue,
  },
  identifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: 12,
  },
});
