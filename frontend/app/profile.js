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
import { useFavorites } from '../contexts/FavoritesContext';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits, favoriteBeauty } = useFavorites();
  const { personalization } = useAddilets();

  // Menu items
  const menuItems = useMemo(() => [
    {
      id: 'favorites',
      title: 'Favorites',
      subtitle: `${favoriteOutfits.length + favoriteBeauty.length} saved items`,
      icon: 'heart',
      color: '#FF6B6B',
      route: '/favorites',
    },
    {
      id: 'wardrobe',
      title: 'My Wardrobe',
      subtitle: 'Your digital closet',
      icon: 'hanger',
      color: '#4ECDC4',
      route: '/aiwardrobe',
    },
    {
      id: 'saved-styles',
      title: 'Saved Styles',
      subtitle: 'Your outfit collection',
      icon: 'bookmark',
      color: '#B14CFF',
      route: '/saved-outfits',
    },
    {
      id: 'saved-beauty',
      title: 'Saved Beauty',
      subtitle: 'Your beauty looks',
      icon: 'shimmer',
      color: '#FF6EC7',
      route: '/saved-beauty',
    },
    {
      id: 'style-dna',
      title: 'Style DNA',
      subtitle: 'Your personalized profile',
      icon: 'dna',
      color: '#FFD93D',
      route: '/addilets',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Preferences & account',
      icon: 'cog',
      color: '#95E1D3',
      route: '/comingsoon',
    },
  ], [favoriteOutfits.length, favoriteBeauty.length]);

  const renderMenuItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push(item.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  ), []);

  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + SPACING.headerPaddingTop }}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[COLORS.primary, '#FF6EC7']}
            style={styles.avatarGradient}
          >
            <MaterialCommunityIcons name="account" size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.userName}>REVEAL User</Text>
        <Text style={styles.userEmail}>Personalized Style Experience</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteOutfits.length}</Text>
          <Text style={styles.statLabel}>Saved Styles</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteBeauty.length}</Text>
          <Text style={styles.statLabel}>Beauty Looks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {personalization?.styleProfile?.personalities?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Style Tags</Text>
        </View>
      </View>

      {/* Menu Section Title */}
      <Text style={styles.sectionTitle}>Your Collection</Text>
    </View>
  ), [insets.top, favoriteOutfits.length, favoriteBeauty.length, personalization]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: SIZES.borderRadiusCard,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
