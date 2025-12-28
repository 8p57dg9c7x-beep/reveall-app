// Profile Screen - v1 Clean (NO Beauty references)
// Only wardrobe-related stats and menu items

import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../contexts/FavoritesContext';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits } = useFavorites();
  const flatListRef = useRef(null);

  // Reset scroll to top on tab focus
  useFocusEffect(
    useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  // v1 Menu items - NO Beauty, NO Shopping, NO Style DNA
  const menuItems = useMemo(() => [
    {
      id: 'wardrobe',
      title: 'My Closet',
      subtitle: 'Your digital wardrobe',
      icon: 'hanger',
      color: '#4ECDC4',
      route: '/aiwardrobe',
    },
    {
      id: 'favorites',
      title: 'Saved Outfits',
      subtitle: `${favoriteOutfits.length} saved looks`,
      icon: 'heart',
      color: '#FF6B6B',
      route: '/saved-outfits',
    },
    {
      id: 'ai-stylist',
      title: 'AI Stylist',
      subtitle: 'Get outfit recommendations',
      icon: 'robot',
      color: '#B14CFF',
      route: '/aistylist',
    },
    {
      id: 'body-scanner',
      title: 'Body Scanner',
      subtitle: 'Your measurements',
      icon: 'human',
      color: '#95E1D3',
      route: '/bodyscanner',
    },
  ], [favoriteOutfits.length]);

  const renderMenuItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push({ pathname: item.route, params: { returnPath: '/profile' } })}
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
            colors={[COLORS.primary, '#8B5CF6']}
            style={styles.avatarGradient}
          >
            <MaterialCommunityIcons name="account" size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.userName}>REVEAL User</Text>
        <Text style={styles.userTagline}>Your Personal Style Assistant</Text>
      </View>

      {/* Stats Row - v1: Only Wardrobe stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteOutfits.length}</Text>
          <Text style={styles.statLabel}>Saved Looks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Closet Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>v1</Text>
          <Text style={styles.statLabel}>Version</Text>
        </View>
      </View>

      {/* Menu Section Title */}
      <Text style={styles.sectionTitle}>Your Tools</Text>
    </View>
  ), [insets.top, favoriteOutfits.length]);

  const ListFooterComponent = useCallback(() => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>REVEAL v1.0.0</Text>
      <Text style={styles.footerSubtext}>Weather → AI Stylist → Your Wardrobe</Text>
    </View>
  ), []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  profileHeader: {
    alignItems: 'center',
    paddingBottom: SPACING.headerPaddingBottom,
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
  userTagline: {
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
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
