import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';

// Discover - Exploration Hub
export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  // Categories data with icons
  const CATEGORIES = useMemo(() => [
    {
      id: 'musicscan',
      title: 'MusicScan',
      subtitle: 'Identify any song instantly',
      icon: 'music-circle',
      color: '#1DB954',
      route: '/musicscan',
      params: { returnPath: '/discover' },
    },
    {
      id: 'trending',
      title: 'Trending Songs',
      subtitle: 'See what\'s hot right now',
      icon: 'trending-up',
      color: '#FF6B6B',
      route: '/trendingsongs',
      params: { returnPath: '/discover' },
    },
    {
      id: 'style-discovery',
      title: 'Style Discovery',
      subtitle: 'Explore trending outfits',
      icon: 'hanger',
      color: '#B14CFF',
      route: '/style',
      params: { returnPath: '/discover' },
    },
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      subtitle: 'New features on the way',
      icon: 'rocket-launch',
      color: '#FF9500',
      route: '/comingsoon',
      params: { returnPath: '/discover' },
    },
  ], []);

  // Handlers
  const handleCategoryPress = useCallback((category) => {
    if (category.params) {
      router.push({ pathname: category.route, params: category.params });
    } else {
      router.push(category.route);
    }
  }, []);

  // Render category card
  const renderCategoryCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${item.color}25`, `${item.color}08`]}
        style={styles.categoryGradient}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}30` }]}>
          <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
        </View>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </LinearGradient>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  // List header component
  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + SPACING.topPadding }}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="compass" size={40} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Explore music, style & more</Text>
      </View>
    </View>
  ), [insets.top]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={4}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.bottomPadding,
  },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.sectionGap,
    paddingHorizontal: SPACING.screenHorizontal,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
    textAlign: 'center',
  },
  categoryCard: {
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.cardGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  categorySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
  },
});
