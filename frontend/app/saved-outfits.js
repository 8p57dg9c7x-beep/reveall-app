import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';

export default function SavedOutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits } = useFavorites();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  // Organize into rows of 2
  const outfitRows = [];
  for (let i = 0; i < favoriteOutfits.length; i += 2) {
    outfitRows.push({
      id: `row-${i}`,
      left: favoriteOutfits[i],
      right: favoriteOutfits[i + 1] || null,
    });
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { 
            paddingTop: insets.top + 16,
            paddingBottom: 100,
          }
        ]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Looks</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Content */}
        {favoriteOutfits.length === 0 ? (
          <View style={styles.emptyState}>
            {/* Abstract visual */}
            <View style={styles.emptyVisual}>
              <View style={styles.emptyShape} />
              <View style={[styles.emptyShape, styles.emptyShapeMedium]} />
              <View style={[styles.emptyShape, styles.emptyShapeSmall]} />
            </View>
            
            <Text style={styles.emptyTitle}>No saved looks yet</Text>
            <Text style={styles.emptySubtitle}>
              When you find an outfit you love, it'll appear here
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {outfitRows.map((row) => (
              <View key={row.id} style={styles.row}>
                <View style={styles.card}>
                  <Image source={{ uri: row.left.image }} style={styles.cardImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.cardOverlay}
                  >
                    <Text style={styles.cardTitle} numberOfLines={2}>{row.left.title}</Text>
                  </LinearGradient>
                </View>
                {row.right ? (
                  <View style={styles.card}>
                    <Image source={{ uri: row.right.image }} style={styles.cardImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.cardOverlay}
                    >
                      <Text style={styles.cardTitle} numberOfLines={2}>{row.right.title}</Text>
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={styles.cardPlaceholder} />
                )}
              </View>
            ))}
          </View>
        )}
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
    flexGrow: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44,
  },
  
  // Grid
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cardPlaceholder: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingTop: 40,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyVisual: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  emptyShape: {
    width: 56,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  emptyShapeMedium: {
    width: 40,
  },
  emptyShapeSmall: {
    width: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
});
