// Profile Screen - v1 Clean
// Ownership through optional avatar
// Settings only — no social features

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../contexts/FavoritesContext';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';

const AVATAR_KEY = '@reveal_profile_avatar';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits } = useFavorites();
  const flatListRef = useRef(null);
  const [avatarUri, setAvatarUri] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  // Load avatar and closet count on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
        if (storedAvatar) setAvatarUri(storedAvatar);
        
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
        }
      } catch (error) {
        console.log('Error loading profile data:', error);
      }
    };
    loadData();
  }, []);

  // Refresh closet count on focus
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setClosetCount(items.length);
        }
      };
      refresh();
      // Scroll reset
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  // Haptic feedback
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Pick avatar image — minimal, pressure-free
  const pickAvatar = async () => {
    triggerHaptic();
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AsyncStorage.setItem(AVATAR_KEY, uri);
      setShowAvatarPreview(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  // Handle avatar tap — if photo exists, show preview; if not, pick new
  const handleAvatarPress = () => {
    triggerHaptic();
    if (avatarUri) {
      setShowAvatarPreview(true);
    } else {
      pickAvatar();
    }
  };

  // Remove avatar
  const removeAvatar = async () => {
    triggerHaptic();
    setAvatarUri(null);
    await AsyncStorage.removeItem(AVATAR_KEY);
    setShowAvatarPreview(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // v1 Menu items - Settings pages only
  const menuItems = useMemo(() => [
    {
      id: 'style-preferences',
      title: 'Style Preferences',
      subtitle: 'Help us know your coloring',
      icon: 'palette-outline',
      color: '#B14CFF',
      route: '/style-preferences',
    },
    {
      id: 'body-scanner',
      title: 'Body Scanner',
      subtitle: 'Your measurements',
      icon: 'human',
      color: '#95E1D3',
      route: '/bodyscanner',
    },
    {
      id: 'favorites',
      title: 'Saved Outfits',
      subtitle: `${favoriteOutfits.length} saved looks`,
      icon: 'heart',
      color: '#FF6B6B',
      route: '/saved-outfits',
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
        {/* Avatar - Tappable, optional */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={pickAvatar}
          activeOpacity={0.9}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <LinearGradient
              colors={[COLORS.primary, '#8B5CF6']}
              style={styles.avatarGradient}
            >
              <MaterialCommunityIcons name="account" size={48} color="#FFFFFF" />
            </LinearGradient>
          )}
          {/* Subtle edit indicator */}
          <View style={styles.avatarEditBadge}>
            <MaterialCommunityIcons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        {/* Gentle prompt for avatar - only if no avatar set */}
        {!avatarUri && (
          <Text style={styles.avatarHint}>Tap to add your photo</Text>
        )}
        
        <Text style={styles.userName}>Your Wardrobe</Text>
        <Text style={styles.userTagline}>Organized, calm, ready to inspire</Text>
      </View>

      {/* Stats Row - Wardrobe stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteOutfits.length}</Text>
          <Text style={styles.statLabel}>Saved Looks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{closetCount}</Text>
          <Text style={styles.statLabel}>Closet Items</Text>
        </View>
      </View>

      {/* Menu Section Title */}
      <Text style={styles.sectionTitle}>Settings</Text>
    </View>
  ), [insets.top, favoriteOutfits.length, avatarUri, closetCount]);

  const ListFooterComponent = useCallback(() => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>REVEAL v1.0</Text>
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
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  avatarHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
    opacity: 0.6,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userTagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
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
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 16,
    opacity: 0.7,
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
    fontSize: 12,
    color: COLORS.textMuted,
    opacity: 0.5,
  },
});
