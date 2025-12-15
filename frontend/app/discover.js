import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { FEATURE_FLAGS, isSectionEnabled } from '../config/featureFlags';

// Discover - Focused v1 Browse Hub
// v1 Scope: Style Discovery only
export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  // Main categories - filtered by feature flags
  const categories = useMemo(() => {
    const allCategories = [
      {
        id: 'style',
        title: 'Style Discovery',
        subtitle: 'Browse trending outfits & get inspired',
        icon: 'hanger',
        color: '#B14CFF',
        gradient: ['#B14CFF', '#8B5CF6'],
        route: '/style',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
        enabled: isSectionEnabled('DISCOVER_SECTIONS', 'STYLE'),
      },
      {
        id: 'beauty',
        title: 'Beauty Hub',
        subtitle: 'Makeup looks & products',
        icon: 'lipstick',
        color: '#FF6EC7',
        gradient: ['#FF6EC7', '#FF8FAB'],
        route: '/beauty',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
        enabled: isSectionEnabled('DISCOVER_SECTIONS', 'BEAUTY'),
      },
      {
        id: 'music',
        title: 'Music',
        subtitle: 'Discover trending songs',
        icon: 'music',
        color: '#1DB954',
        gradient: ['#1DB954', '#1ED760'],
        route: '/musicscan',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
        enabled: isSectionEnabled('DISCOVER_SECTIONS', 'MUSIC'),
      },
    ];
    
    return allCategories.filter(cat => cat.enabled);
  }, []);

  const handleCategoryPress = useCallback((category) => {
    router.push({ pathname: category.route, params: { returnPath: '/discover' } });
  }, []);

  const handleFavoritesPress = useCallback(() => {
    router.push('/saved-outfits');
  }, []);

  const renderCategoryCard = useCallback((category, index) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, categories.length === 1 && styles.categoryCardSolo]}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.categoryOverlay}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${category.color}40` }]}>
          <MaterialCommunityIcons name={category.icon} size={28} color={category.color} />
        </View>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
      </LinearGradient>
      <View style={styles.categoryArrow}>
        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
      </View>
    </TouchableOpacity>
  ), [handleCategoryPress, categories.length]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find your next favorite look</Text>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => renderCategoryCard(category, index))}
        </View>

        {/* Quick Access: Favorites */}
        <TouchableOpacity 
          style={styles.favoritesCard}
          onPress={handleFavoritesPress}
          activeOpacity={0.85}
        >
          <View style={styles.favoritesIconContainer}>
            <MaterialCommunityIcons name="heart" size={24} color="#FF6EC7" />
          </View>
          <View style={styles.favoritesText}>
            <Text style={styles.favoritesTitle}>Your Favorites</Text>
            <Text style={styles.favoritesSubtitle}>Saved outfits & looks</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* v1 Focus Message */}
        <View style={styles.focusMessage}>
          <MaterialCommunityIcons name="sparkles" size={20} color={COLORS.primary} />
          <Text style={styles.focusText}>
            More features coming soon — stay tuned!
          </Text>
        </View>
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
  content: {
    paddingBottom: SPACING.bottomPadding,
  },
  // Header
  header: {
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  // Categories
  categoriesContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  categoryCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  categoryCardSolo: {
    height: 260,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  categorySubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  categoryArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Favorites Card
  favoritesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.screenHorizontal,
    marginTop: 8,
    padding: 18,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    ...CARD_SHADOW,
  },
  favoritesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 110, 199, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  favoritesText: {
    flex: 1,
  },
  favoritesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  favoritesSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Focus Message
  focusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    marginTop: 16,
  },
  focusText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
