import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';

// Individual Outfit Card
const OutfitCard = React.memo(({ item, isLeft }) => (
  <View style={[styles.card, isLeft ? styles.cardLeft : styles.cardRight]}>
    <Image source={{ uri: item.image }} style={styles.cardImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.cardOverlay}
    >
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
    </LinearGradient>
  </View>
));

export default function SavedOutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits } = useFavorites();

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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
          favoriteOutfits.length === 0 && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Saved Looks</Text>
            {favoriteOutfits.length > 0 && (
              <Text style={styles.headerCount}>{favoriteOutfits.length}</Text>
            )}
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Content */}
        {favoriteOutfits.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyVisual}>
              <View style={styles.emptyLine} />
              <View style={[styles.emptyLine, styles.emptyLineShort]} />
              <View style={[styles.emptyLine, styles.emptyLineShorter]} />
            </View>
            <Text style={styles.emptyTitle}>No saved looks yet</Text>
            <Text style={styles.emptySubtitle}>
              When you find an outfit you love, save it here for later
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {outfitRows.map((row) => (
              <View key={row.id} style={styles.row}>
                <OutfitCard item={row.left} isLeft={true} />
                {row.right ? (
                  <OutfitCard item={row.right} isLeft={false} />
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
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 100,
  },
  scrollContentEmpty: {
    flex: 1,
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerCount: {
    fontSize: 15,
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
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
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cardLeft: {},
  cardRight: {},
  cardPlaceholder: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 48,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Empty State - Elegant & intentional
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyVisual: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  emptyLine: {
    width: 64,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  emptyLineShort: {
    width: 48,
  },
  emptyLineShorter: {
    width: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
});
