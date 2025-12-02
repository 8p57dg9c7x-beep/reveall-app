import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLOW, SIZES } from '../constants/theme';

export default function ScanScreen() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'image',
      title: 'Image Recognition',
      subtitle: 'Scan movie posters or scenes',
      icon: 'camera',
    },
    {
      id: 'audio',
      title: 'Audio Recognition',
      subtitle: 'Identify from soundtrack or dialogue',
      icon: 'mic',
    },
    {
      id: 'video',
      title: 'Video Recognition',
      subtitle: 'Upload video clips',
      icon: 'videocam',
    },
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    router.push('/identify');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Recognition Mode</Text>
        <Text style={styles.subtitle}>Choose how you want to identify the movie</Text>
      </View>

      {/* Mode Cards */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.modesContainer}
        showsVerticalScrollIndicator={false}
      >
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeCard,
              selectedMode === mode.id && styles.modeCardActive,
            ]}
            onPress={() => handleModeSelect(mode.id)}
            activeOpacity={0.7}
          >
            <View style={styles.modeIconContainer}>
              <Ionicons 
                name={mode.icon} 
                size={40} 
                color={selectedMode === mode.id ? COLORS.neonBlue : COLORS.metallicSilver} 
              />
            </View>
            <View style={styles.modeTextContainer}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  modesContainer: {
    paddingHorizontal: SIZES.spacingLarge,
    paddingBottom: 30,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.metallicSilver + '30',
    padding: 20,
    marginBottom: 16,
  },
  modeCardActive: {
    borderColor: COLORS.neonBlue,
    ...GLOW.neonBlue,
  },
  modeIconContainer: {
    marginRight: 16,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
