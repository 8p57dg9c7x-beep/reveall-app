// Style Preferences Screen - Manual Appearance Input
// Optional, skippable screen to improve color recommendations
// "Help us understand your unique coloring"

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';

const PREFERENCES_KEY = '@reveal_style_preferences';

// Hair color options - Neutral, inclusive language
const HAIR_OPTIONS = [
  { id: 'light', label: 'Light', description: 'Blonde, light brown, gray' },
  { id: 'medium', label: 'Medium', description: 'Brown, auburn' },
  { id: 'dark', label: 'Dark', description: 'Black, dark brown' },
  { id: 'red', label: 'Red', description: 'Copper, strawberry, ginger' },
];

// Eye color options
const EYE_OPTIONS = [
  { id: 'light', label: 'Light', description: 'Blue, green, hazel, gray' },
  { id: 'medium', label: 'Medium', description: 'Amber, light brown' },
  { id: 'dark', label: 'Dark', description: 'Brown, black' },
];

// Skin tone options - Warm/cool undertones
const SKIN_OPTIONS = [
  { id: 'cool', label: 'Cool undertones', description: 'Pink or blue undertones' },
  { id: 'warm', label: 'Warm undertones', description: 'Yellow or olive undertones' },
  { id: 'neutral', label: 'Neutral', description: 'A mix of warm and cool' },
];

export default function StylePreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [hair, setHair] = useState(null);
  const [eyes, setEyes] = useState(null);
  const [skin, setSkin] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        setHair(prefs.hair || null);
        setEyes(prefs.eyes || null);
        setSkin(prefs.skin || null);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const prefs = { hair, eyes, skin, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      triggerHaptic('success');
      setSaved(true);
      setTimeout(() => router.back(), 800);
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  const triggerHaptic = (type = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleSelect = (setter, value) => {
    triggerHaptic();
    setter(value);
  };

  const renderOption = (option, selected, onSelect) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        selected === option.id && styles.optionCardSelected,
      ]}
      onPress={() => onSelect(option.id)}
      activeOpacity={0.8}
    >
      <View style={styles.optionContent}>
        <Text style={[
          styles.optionLabel,
          selected === option.id && styles.optionLabelSelected,
        ]}>
          {option.label}
        </Text>
        <Text style={styles.optionDescription}>{option.description}</Text>
      </View>
      {selected === option.id && (
        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  const hasAnySelection = hair || eyes || skin;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Style Preferences</Text>
          <Text style={styles.subtitle}>
            Help us understand your unique coloring for better recommendations. This is optional — skip anytime.
          </Text>
        </View>

        {/* Hair Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hair</Text>
          <View style={styles.optionsContainer}>
            {HAIR_OPTIONS.map(option => renderOption(option, hair, (v) => handleSelect(setHair, v)))}
          </View>
        </View>

        {/* Eye Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eyes</Text>
          <View style={styles.optionsContainer}>
            {EYE_OPTIONS.map(option => renderOption(option, eyes, (v) => handleSelect(setEyes, v)))}
          </View>
        </View>

        {/* Skin Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Undertone</Text>
          <View style={styles.optionsContainer}>
            {SKIN_OPTIONS.map(option => renderOption(option, skin, (v) => handleSelect(setSkin, v)))}
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.privacyText}>
            Your preferences stay on your device and are never shared.
          </Text>
        </View>

      </ScrollView>

      {/* Save Button */}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveButton, !hasAnySelection && styles.saveButtonDisabled]}
          onPress={savePreferences}
          activeOpacity={0.9}
          disabled={!hasAnySelection}
        >
          {saved ? (
            <>
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Saved</Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderColor: 'rgba(177, 76, 255, 0.3)',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  privacyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 16,
    backgroundColor: 'rgba(11, 8, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(177, 76, 255, 0.3)',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
