import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW, SIZES } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>CINESCAN</Text>
        <Text style={styles.tagline}>AI-Powered Movie Recognition</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Large Central SCAN Button */}
        <TouchableOpacity 
          style={styles.scanButtonContainer}
          onPress={() => router.push('/scan')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.neonBlue, COLORS.neonBlueDark]}
            style={styles.scanButton}
          >
            <Ionicons name="scan" size={48} color={COLORS.textPrimary} />
            <Text style={styles.scanButtonText}>SCAN</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recognition Options */}
        <Text style={styles.optionsTitle}>Recognition Methods</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => router.push('/identify')}
          >
            <Ionicons name="camera" size={28} color={COLORS.neonBlue} />
            <Text style={styles.optionText}>Image</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => router.push('/identify')}
          >
            <Ionicons name="mic" size={28} color={COLORS.neonBlue} />
            <Text style={styles.optionText}>Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => router.push('/identify')}
          >
            <Ionicons name="videocam" size={28} color={COLORS.neonBlue} />
            <Text style={styles.optionText}>Video</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: SIZES.spacingLarge,
    alignItems: 'center',
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
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLarge,
  },
  scanButtonContainer: {
    marginBottom: 60,
  },
  scanButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    ...GLOW.neonBlue,
  },
  scanButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
    letterSpacing: 2,
  },
  optionsTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    letterSpacing: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '30',
    width: 100,
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
