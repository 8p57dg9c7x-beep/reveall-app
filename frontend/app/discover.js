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
import { FEATURE_FLAGS } from '../config/featureFlags';

// Discover - Clean Browse Hub (Simplified)
export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  // Main categories - only active ones based on feature flags
  const categories = useMemo(() => {
    const allCategories = [
      {
        id: 'style',
        title: 'Style Discovery',
        subtitle: 'Browse trending outfits',
        icon: 'hanger',
        color: '#B14CFF',
        gradient: ['#B14CFF', '#8B5CF6'],
        route: '/style',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
        enabled: FEATURE_FLAGS.STYLE_DISCOVERY,
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
        enabled: FEATURE_FLAGS.BEAUTY_HUB,
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
        enabled: FEATURE_FLAGS.MUSIC_SCAN,
      },
    ];
    
    return allCategories.filter(cat => cat.enabled);
  }, []);

  const handleCategoryPress = useCallback((category) => {
    router.push({ pathname: category.route, params: { returnPath: '/discover' } });
  }, []);

  const renderCategoryCard = useCallback((category, index) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, index === 0 && styles.categoryCardFirst]}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.categoryOverlay}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${category.color}40` }]}>
          <MaterialCommunityIcons name={category.icon} size={24} color={category.color} />
        </View>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
      </LinearGradient>
      <View style={styles.categoryArrow}>
        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
      </View>
    </TouchableOpacity>
  ), [handleCategoryPress]);

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
          <Text style={styles.headerSubtitle}>Explore styles, beauty & more</Text>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => renderCategoryCard(category, index))}
        </View>

        {/* Coming Soon Teaser (if music is hidden) */}
        {!FEATURE_FLAGS.MUSIC_SCAN && (
          <View style={styles.comingSoon}>
            <MaterialCommunityIcons name="music-note" size={24} color={COLORS.textMuted} />
            <Text style={styles.comingSoonText}>Music discovery coming soon</Text>
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
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  categoryCardFirst: {
    height: 200,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Coming Soon
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
