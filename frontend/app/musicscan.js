import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';
import { recognizeMusic } from '../services/api';

export default function MusicScanScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/discover';
  
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, listening, processing, error
  const [statusText, setStatusText] = useState('Tap to identify a song');
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(0)).current;
  const ringAnim2 = useRef(new Animated.Value(0)).current;
  const ringAnim3 = useRef(new Animated.Value(0)).current;

  // Pulse animation for the main button
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ring animations
      const createRingAnimation = (anim, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createRingAnimation(ringAnim1, 0).start();
      createRingAnimation(ringAnim2, 666).start();
      createRingAnimation(ringAnim3, 1333).start();
    } else {
      pulseAnim.setValue(1);
      ringAnim1.setValue(0);
      ringAnim2.setValue(0);
      ringAnim3.setValue(0);
    }
  }, [isListening]);

  const handleBack = () => {
    // Use explicit navigation to returnPath for reliable back navigation
    router.push(returnPath);
  };

  const startListening = async () => {
    try {
      // Request permissions
      const { status: permissionStatus } = await Audio.requestPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to identify songs.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsListening(true);
      setStatus('listening');
      setStatusText('Listening...');

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);

      // Auto-stop after 10 seconds
      setTimeout(async () => {
        if (newRecording) {
          await stopListening(newRecording);
        }
      }, 10000);

    } catch (error) {
      console.error('Start listening error:', error);
      setIsListening(false);
      setStatus('error');
      setStatusText('Error starting audio. Tap to try again.');
    }
  };

  const stopListening = async (recordingToStop = recording) => {
    if (!recordingToStop) return;

    try {
      setStatus('processing');
      setStatusText('Identifying song...');

      await recordingToStop.stopAndUnloadAsync();
      const uri = recordingToStop.getURI();
      setRecording(null);
      setIsListening(false);

      if (uri) {
        // Send to recognition API
        const result = await recognizeMusic(uri);

        if (result.success && result.song) {
          // Navigate to result screen with song data
          router.push({
            pathname: '/result',
            params: {
              songData: JSON.stringify(result.song),
              returnPath: '/musicscan',
            },
          });
          setStatus('idle');
          setStatusText('Tap to identify a song');
        } else {
          setStatus('error');
          setStatusText('Song not found. Tap to try again.');
          
          // Show alert with more info
          Alert.alert(
            'Song Not Found',
            'We couldn\'t identify the song. Try again with clearer audio or closer to the speaker.',
            [{ text: 'OK', onPress: () => {
              setStatus('idle');
              setStatusText('Tap to identify a song');
            }}]
          );
        }
      }
    } catch (error) {
      console.error('Stop listening error:', error);
      setIsListening(false);
      setStatus('error');
      setStatusText('Error processing audio. Tap to try again.');
    }
  };

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return '#4ECDC4';
      case 'processing':
        return COLORS.primary;
      case 'error':
        return '#FF6B6B';
      default:
        return COLORS.primary;
    }
  };

  const renderRing = (anim, size) => {
    return (
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 0],
            }),
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                }),
              },
            ],
          },
        ]}
      />
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header with Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MusicScan</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Identify Any Song</Text>
          <Text style={styles.subtitle}>
            Play a song nearby and tap the button to identify it
          </Text>

          {/* Listening Animation Area */}
          <View style={styles.animationContainer}>
            {isListening && (
              <>
                {renderRing(ringAnim1, 200)}
                {renderRing(ringAnim2, 200)}
                {renderRing(ringAnim3, 200)}
              </>
            )}
            
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  isListening && styles.scanButtonActive,
                  { borderColor: getStatusColor() }
                ]}
                onPress={handlePress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isListening 
                    ? ['rgba(78, 205, 196, 0.3)', 'rgba(78, 205, 196, 0.1)']
                    : ['rgba(177, 76, 255, 0.3)', 'rgba(177, 76, 255, 0.1)']}
                  style={styles.scanButtonGradient}
                >
                  <MaterialCommunityIcons
                    name={isListening ? 'waveform' : 'music-circle'}
                    size={64}
                    color={getStatusColor()}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Status Text */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {statusText}
            </Text>
            {status === 'processing' && (
              <MaterialCommunityIcons 
                name="loading" 
                size={20} 
                color={COLORS.primary} 
                style={styles.loadingIcon}
              />
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How it works</Text>
            <View style={styles.instructionItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.instructionText}>Play a song on any device near you</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.instructionText}>Tap the scan button above to start listening</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.instructionText}>Get song details, lyrics, and more instantly</Text>
            </View>
          </View>

          {/* Browse Trending */}
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/trendingsongs')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="trending-up" size={20} color={COLORS.textPrimary} />
            <Text style={styles.browseButtonText}>Browse Trending Songs</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Tip Section */}
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={COLORS.accent} />
            <Text style={styles.tipText}>
              Tip: For best results, hold your phone closer to the audio source and reduce background noise.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.headerPaddingBottom,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  scanButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  scanButtonActive: {
    borderColor: '#4ECDC4',
  },
  scanButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingIcon: {
    marginLeft: 4,
  },
  instructions: {
    marginTop: 32,
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: SIZES.borderRadiusCard,
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  browseButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
