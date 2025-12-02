import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../components/GradientBackground';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="film" size={80} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Text style={styles.title}>CINESCAN</Text>
          
          {/* Tagline */}
          <Text style={styles.tagline}>
            Identify Any Movie, Scene, or Anime Instantly
          </Text>

          {/* Primary Button - Identify */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/identify')}
          >
            <Ionicons name="search" size={24} color="#667eea" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Identify</Text>
          </TouchableOpacity>

          {/* Secondary Button - Watchlist */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/watchlist')}
          >
            <Ionicons name="star" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>My Watchlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
