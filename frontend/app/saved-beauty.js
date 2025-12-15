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

// Individual Beauty Card Component
const BeautyCardItem = React.memo(({ item, onPress, isLeft }) => (
  <TouchableOpacity
    style={[styles.beautyCard, isLeft ? styles.cardLeft : styles.cardRight]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <Image source={{ uri: item.image }} style={styles.cardImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.85)']}
      style={styles.cardOverlay}
    >
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      {item.duration && (
        <Text style={styles.cardDuration}>{item.duration}</Text>
      )}
    </LinearGradient>
    <View style={styles.savedBadge}>
      <MaterialCommunityIcons name="heart" size={16} color="#FF6EC7" />
    </View>
  </TouchableOpacity>
));

export default function SavedBeautyScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteBeauty } = useFavorites();

  const handleLookPress = (look) => {
    router.push({
      pathname: '/beautydetail',
      params: { 
        lookData: JSON.stringify(look),
        returnPath: '/saved-beauty'
      },
    });
  };

  // Pair looks into rows for 2-column grid
  const lookRows = [];
  for (let i = 0; i < favoriteBeauty.length; i += 2) {
    lookRows.push({
      id: `row-${i}`,
      left: favoriteBeauty[i],
      right: favoriteBeauty[i + 1] || null,
    });
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="heart-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Saved Beauty Looks</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on any beauty look to save it here for quick access
      </Text>
      <TouchableOpacity 
        style={styles.exploreCTA}
        onPress={() => router.push('/beauty')}
      >
        <MaterialCommunityIcons name="lipstick" size={20} color="#FFFFFF" />
        <Text style={styles.exploreCTAText}>Explore Beauty Looks</Text>
      </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Saved Beauty</Text>
            <Text style={styles.headerSubtitle}>{favoriteBeauty.length} items</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        {favoriteBeauty.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.gridContainer}>
            {lookRows.map((row) => (
              <View key={row.id} style={styles.row}>
                <BeautyCardItem item={row.left} onPress={handleLookPress} isLeft={true} />
                {row.right ? (
                  <BeautyCardItem item={row.right} onPress={handleLookPress} isLeft={false} />
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
  // Beauty Card
  beautyCard: {
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
  cardDuration: {
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
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreCTAText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
