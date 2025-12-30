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

// Individual Outfit Card Component
const OutfitCardItem = React.memo(({ item, onPress, isLeft }) => (
  <TouchableOpacity
    style={[styles.outfitCard, isLeft ? styles.cardLeft : styles.cardRight]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <Image source={{ uri: item.image }} style={styles.cardImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.85)']}
      style={styles.cardOverlay}
    >
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      {item.priceRange && (
        <Text style={styles.cardPrice}>{item.priceRange}</Text>
      )}
    </LinearGradient>
    <View style={styles.savedBadge}>
      <MaterialCommunityIcons name="heart" size={16} color="#FF6EC7" />
    </View>
  </TouchableOpacity>
));

export default function SavedOutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits } = useFavorites();

  const handleOutfitPress = (outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit), returnPath: '/saved-outfits' },
    });
  };

  // Pair outfits into rows for 2-column grid
  const outfitRows = [];
  for (let i = 0; i < favoriteOutfits.length; i += 2) {
    outfitRows.push({
      id: `row-${i}`,
      left: favoriteOutfits[i],
      right: favoriteOutfits[i + 1] || null,
    });
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="heart-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Saved Outfits Yet</Text>
      <Text style={styles.emptySubtitle}>
        Save outfits you like so the AI can learn your style faster
      </Text>
      <Text style={styles.emptyHint}>
        Tap the heart icon on any outfit recommendation to save it here
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12 }
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
            <Text style={styles.headerTitle}>Saved Outfits</Text>
            <Text style={styles.headerSubtitle}>{favoriteOutfits.length} items</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        {favoriteOutfits.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.gridContainer}>
            {outfitRows.map((row) => (
              <View key={row.id} style={styles.row}>
                <OutfitCardItem item={row.left} onPress={handleOutfitPress} isLeft={true} />
                {row.right ? (
                  <OutfitCardItem item={row.right} onPress={handleOutfitPress} isLeft={false} />
                ) : (
                  <View style={styles.emptyCard} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.bottomPadding,
    flexGrow: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  // Grid
  gridContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  // Outfit Card
  outfitCard: {
    flex: 1,
    height: 200,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...CARD_SHADOW,
  },
  cardLeft: {
    marginRight: 6,
  },
  cardRight: {
    marginLeft: 6,
  },
  emptyCard: {
    flex: 1,
    marginLeft: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  savedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State - Premium design
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
