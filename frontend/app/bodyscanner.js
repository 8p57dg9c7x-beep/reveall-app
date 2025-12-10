import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import GradientButton from '../components/GradientButton';

export default function BodyScannerScreen() {
  const [step, setStep] = useState(1); // 1: Instructions, 2: Capture, 3: Results
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handlePhotoCapture = (type) => {
    Alert.alert('Capture Photo', `${type} photo would be captured here`, [
      {
        text: 'OK',
        onPress: () => {
          if (type === 'Front') {
            setFrontPhoto('https://via.placeholder.com/200x400');
          } else {
            setSidePhoto('https://via.placeholder.com/200x400');
          }
        }
      }
    ]);
  };

  const performScan = () => {
    setScanning(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockResults = {
        height: 180,
        measurements: {
          chest: 95,
          waist: 78,
          hips: 92,
          shoulders: 45,
          inseam: 82,
        },
        bodyType: 'Athletic',
        shirtSize: 'M',
        pantsSize: '32',
        confidence: 0.93,
      };
      
      setScanResults(mockResults);
      setScanning(false);
      setStep(3);
    }, 3000);
  };

  const renderInstructions = () => (
    <View style={styles.instructionsContainer}>
      <MaterialCommunityIcons name="account-outline" size={80} color={COLORS.primary} />
      <Text style={styles.instructionsTitle}>Body Scan Instructions</Text>
      <Text style={styles.instructionsSubtitle}>Get accurate measurements in seconds</Text>
      
      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Wear Fitted Clothing</Text>
            <Text style={styles.instructionText}>Tight or form-fitting clothes work best</Text>
          </View>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Find Good Lighting</Text>
            <Text style={styles.instructionText}>Natural light or well-lit room</Text>
          </View>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Stand Against Wall</Text>
            <Text style={styles.instructionText}>Plain background for best results</Text>
          </View>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>4</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Take 2 Photos</Text>
            <Text style={styles.instructionText}>Front view and side profile</Text>
          </View>
        </View>
      </View>
      
      <GradientButton
        title="Start Scan"
        onPress={() => setStep(2)}
        icon={<MaterialCommunityIcons name="camera" size={20} color="#fff" />}
        style={styles.startButton}
      />
    </View>
  );

  const renderCapture = () => (
    <View style={styles.captureContainer}>
      <Text style={styles.captureTitle}>Capture Your Photos</Text>
      <Text style={styles.captureSubtitle}>Take front and side profile photos</Text>
      
      <View style={styles.photosContainer}>
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={() => handlePhotoCapture('Front')}
          >
            {frontPhoto ? (
              <Image source={{ uri: frontPhoto }} style={styles.capturedPhoto} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera" size={48} color={COLORS.textMuted} />
                <Text style={styles.captureLabel}>Front View</Text>
                <Text style={styles.captureHint}>Arms at sides</Text>
              </>
            )}
          </TouchableOpacity>
          {frontPhoto && (
            <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" style={styles.checkIcon} />
          )}
        </View>
        
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={() => handlePhotoCapture('Side')}
          >
            {sidePhoto ? (
              <Image source={{ uri: sidePhoto }} style={styles.capturedPhoto} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera" size={48} color={COLORS.textMuted} />
                <Text style={styles.captureLabel}>Side Profile</Text>
                <Text style={styles.captureHint}>Stand sideways</Text>
              </>
            )}
          </TouchableOpacity>
          {sidePhoto && (
            <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" style={styles.checkIcon} />
          )}
        </View>
      </View>
      
      <GradientButton
        title="Analyze Body Measurements"
        onPress={performScan}
        disabled={!frontPhoto || !sidePhoto}
        icon={<MaterialCommunityIcons name="ruler" size={20} color="#fff" />}
        style={styles.analyzeButton}
      />
    </View>
  );

  const renderResults = () => (
    <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
      <Text style={styles.resultsTitle}>Your Body Measurements</Text>
      <View style={styles.confidenceBadge}>
        <MaterialCommunityIcons name="check-decagram" size={20} color="#10B981" />
        <Text style={styles.confidenceText}>{Math.round(scanResults.confidence * 100)}% Accurate</Text>
      </View>
      
      {/* Body Type */}
      <View style={styles.resultCard}>
        <Text style={styles.resultCardTitle}>Body Type</Text>
        <View style={styles.bodyTypeContainer}>
          <MaterialCommunityIcons name="human" size={48} color={COLORS.primary} />
          <Text style={styles.bodyTypeText}>{scanResults.bodyType}</Text>
        </View>
      </View>
      
      {/* Height */}
      <View style={styles.resultCard}>
        <Text style={styles.resultCardTitle}>Height</Text>
        <Text style={styles.measurementValue}>{scanResults.height} cm</Text>
        <Text style={styles.measurementSubtext}>({(scanResults.height / 30.48).toFixed(1)} ft)</Text>
      </View>
      
      {/* Measurements */}
      <View style={styles.resultCard}>
        <Text style={styles.resultCardTitle}>Measurements (cm)</Text>
        <View style={styles.measurementsList}>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Chest</Text>
            <Text style={styles.measurementValue}>{scanResults.measurements.chest} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Waist</Text>
            <Text style={styles.measurementValue}>{scanResults.measurements.waist} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Hips</Text>
            <Text style={styles.measurementValue}>{scanResults.measurements.hips} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Shoulders</Text>
            <Text style={styles.measurementValue}>{scanResults.measurements.shoulders} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Inseam</Text>
            <Text style={styles.measurementValue}>{scanResults.measurements.inseam} cm</Text>
          </View>
        </View>
      </View>
      
      {/* Recommended Sizes */}
      <View style={styles.resultCard}>
        <Text style={styles.resultCardTitle}>Recommended Sizes</Text>
        <View style={styles.sizesContainer}>
          <View style={styles.sizeItem}>
            <Text style={styles.sizeLabel}>Shirt</Text>
            <Text style={styles.sizeValue}>{scanResults.shirtSize}</Text>
          </View>
          <View style={styles.sizeItem}>
            <Text style={styles.sizeLabel}>Pants</Text>
            <Text style={styles.sizeValue}>{scanResults.pantsSize}</Text>
          </View>
        </View>
      </View>
      
      <GradientButton
        title="Save to Profile"
        onPress={() => Alert.alert('Success', 'Measurements saved to your profile!')}
        icon={<MaterialCommunityIcons name="content-save" size={20} color="#fff" />}
        style={styles.saveButton}
      />
      
      <TouchableOpacity 
        style={styles.newScanButton}
        onPress={() => {
          setStep(1);
          setFrontPhoto(null);
          setSidePhoto(null);
          setScanResults(null);
        }}
      >
        <Text style={styles.newScanText}>Start New Scan</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="tape-measure" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Body Scanner</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {scanning ? (
        <View style={styles.scanningContainer}>
          <MaterialCommunityIcons name="loading" size={80} color={COLORS.primary} />
          <Text style={styles.scanningText}>Analyzing your measurements...</Text>
          <Text style={styles.scanningSubtext}>This may take a few seconds</Text>
        </View>
      ) : (
        <>
          {step === 1 && renderInstructions()}
          {step === 2 && renderCapture()}
          {step === 3 && renderResults()}
        </>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  instructionsList: {
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 16,
  },
  instructionNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  startButton: {
    width: '100%',
  },
  captureContainer: {
    paddingHorizontal: 20,
  },
  captureTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  captureSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  photoSection: {
    flex: 1,
    alignItems: 'center',
  },
  captureButton: {
    width: '100%',
    aspectRatio: 0.5,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(177, 76, 255, 0.2)',
    borderStyle: 'dashed',
  },
  capturedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.borderRadiusCard,
  },
  captureLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  captureHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  checkIcon: {
    marginTop: 12,
  },
  analyzeButton: {
    width: '100%',
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanningText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    textAlign: 'center',
  },
  scanningSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  confidenceText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: 20,
    marginBottom: 16,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bodyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bodyTypeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  measurementValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  measurementSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  measurementsList: {
    gap: 12,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(177, 76, 255, 0.1)',
  },
  measurementLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sizesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  sizeItem: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 12,
  },
  sizeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sizeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveButton: {
    width: '100%',
    marginTop: 16,
  },
  newScanButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  newScanText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
