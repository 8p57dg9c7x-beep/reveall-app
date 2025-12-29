// Style Preferences - Optional appearance settings
// "Help us recommend colors that complement you"

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';

const PREFS_KEY = '@reveal_style_prefs';

// Preference options - neutral, inclusive language
const HAIR_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'dark', label: 'Dark' },
  { id: 'not_sure', label: 'Not sure' },
];

const EYE_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'dark', label: 'Dark' },
  { id: 'not_sure', label: 'Not sure' },
];

const SKIN_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'deep', label: 'Deep' },
  { id: 'not_sure', label: 'Not sure' },
];

export default function StylePreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [hair, setHair] = useState(null);
  const [eyes, setEyes] = useState(null);
  const [skin, setSkin] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFS_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        setHair(prefs.hair || null);
        setEyes(prefs.eyes || null);
        setSkin(prefs.skin || null);
      }
    } catch (e) {
      console.log('Error loading prefs:', e);
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const savePrefs = async () => {
    triggerHaptic();
    try {
      const prefs = { hair, eyes, skin, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      setSaved(true);
      setTimeout(() => router.back(), 800);
    } catch (e) {
      console.log('Error saving prefs:', e);
    }
  };

  const renderOption = (options, selected, onSelect, label) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.optionButton,
              selected === opt.id && styles.optionButtonActive,
              opt.id === 'not_sure' && styles.optionButtonMuted,
            ]}
            onPress={() => { triggerHaptic(); onSelect(opt.id); }}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.optionText,
              selected === opt.id && styles.optionTextActive,
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Improve Your Suggestions</Text>
          <Text style={styles.subtitle}>
            Help us recommend colors and styles that complement you. This is completely optional.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {renderOption(HAIR_OPTIONS, hair, setHair, 'Hair Color')}
          {renderOption(EYE_OPTIONS, eyes, setEyes, 'Eye Color')}
          {renderOption(SKIN_OPTIONS, skin, setSkin, 'Skin Tone')}
        </View>

        {/* Privacy note */}
        <Text style={styles.privacyNote}>
          This stays on your device and helps personalize recommendations. You can change or clear this anytime.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={savePrefs}
            activeOpacity={0.9}
          >
            <Text style={styles.saveButtonText}>
              {saved ? 'Saved ✓' : 'Save Preferences'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 32,
    marginBottom: 32,
  },
  optionGroup: {},
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionButtonActive: {
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    borderColor: COLORS.primary,
  },
  optionButtonMuted: {
    borderStyle: 'dashed',
  },
  optionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  actions: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
