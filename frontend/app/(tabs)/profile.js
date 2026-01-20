// Profile Screen - v1 Clean
// Ownership through optional avatar
// Settings only — no social features

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { useFavorites } from '../../contexts/FavoritesContext';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../../constants/theme';
import { getSellStack } from '../../services/cleanOutService';

const AVATAR_KEY = '@reveal_profile_avatar';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favoriteOutfits } = useFavorites();
  const scrollViewRef = useRef(null);
  const [avatarUri, setAvatarUri] = useState(null);
  const [closetCount, setClosetCount] = useState(0);
  const [sellStackCount, setSellStackCount] = useState(0);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
        if (storedAvatar) setAvatarUri(storedAvatar);
        
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          setClosetCount(JSON.parse(wardrobeJson).length);
        }
        
        const sellStack = await getSellStack();
        setSellStackCount(sellStack.length);
      } catch (error) {
        console.log('Error loading profile data:', error);
      }
    };
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          setClosetCount(JSON.parse(wardrobeJson).length);
        }
        const sellStack = await getSellStack();
        setSellStackCount(sellStack.length);
      };
      refresh();
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickAvatar = async () => {
    triggerHaptic();
    try {
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
      }
    } catch (error) {
      console.log('Error picking avatar:', error);
    }
  };

  const handleAvatarPress = () => {
    triggerHaptic();
    if (avatarUri) {
      setShowAvatarPreview(true);
    } else {
      pickAvatar();
    }
  };

  const removeAvatar = async () => {
    triggerHaptic();
    setAvatarUri(null);
    await AsyncStorage.removeItem(AVATAR_KEY);
    setShowAvatarPreview(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const navigateTo = (route) => {
    triggerHaptic();
    router.push({ pathname: route, params: { returnPath: '/profile' } });
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { 
            paddingTop: insets.top + 32,
            paddingBottom: 100,
          }
        ]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        bounces={true}
      >
        {/* ─────────────────────────────────────────────────────── */}
        {/* HEADER - Avatar & Identity                              */}
        {/* ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            activeOpacity={0.9}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={['rgba(177, 76, 255, 0.3)', 'rgba(177, 76, 255, 0.1)']}
                style={styles.avatarPlaceholder}
              >
                <MaterialCommunityIcons name="account-outline" size={32} color="rgba(255,255,255,0.5)" />
              </LinearGradient>
            )}
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Your Closet</Text>
          <Text style={styles.headerSubtitle}>{closetCount} pieces</Text>
        </View>

        {/* ─────────────────────────────────────────────────────── */}
        {/* CORE SETTINGS - Primary hierarchy                       */}
        {/* ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigateTo('/style-preferences')}
            activeOpacity={0.8}
          >
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(177, 76, 255, 0.15)' }]}>
              <MaterialCommunityIcons name="palette-outline" size={22} color="#B14CFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Style Preferences</Text>
              <Text style={styles.settingSubtitle}>Your color palette</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigateTo('/bodyscanner')}
            activeOpacity={0.8}
          >
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(149, 225, 211, 0.15)' }]}>
              <MaterialCommunityIcons name="human" size={22} color="#95E1D3" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Body Scanner</Text>
              <Text style={styles.settingSubtitle}>Your measurements</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────────────────── */}
        {/* COLLECTIONS - Lighter weight                            */}
        {/* ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Collections</Text>
          
          <TouchableOpacity 
            style={styles.collectionItem}
            onPress={() => navigateTo('/saved-outfits')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="heart-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.collectionTitle}>Saved Looks</Text>
            <Text style={styles.collectionCount}>
              {favoriteOutfits.length > 0 ? favoriteOutfits.length : '—'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.collectionItem}
            onPress={() => navigateTo('/sellstack')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="tag-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.collectionTitle}>Sell Stack</Text>
            <Text style={styles.collectionCount}>
              {sellStackCount > 0 ? sellStackCount : '—'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────────────────── */}
        {/* FOOTER                                                  */}
        {/* ─────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>REVEAL v1.0</Text>
        </View>

      </ScrollView>
      
      {/* Avatar Preview Modal */}
      <Modal
        visible={showAvatarPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowAvatarPreview(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {avatarUri && (
              <Image source={{ uri: avatarUri }} style={styles.modalAvatar} />
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalAction} onPress={pickAvatar}>
                <MaterialCommunityIcons name="camera" size={20} color={COLORS.primary} />
                <Text style={styles.modalActionText}>Change</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalAction} onPress={removeAvatar}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#FF6B6B" />
                <Text style={[styles.modalActionText, { color: '#FF6B6B' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: SPACING.screenHorizontal,
    flexGrow: 1,
  },
  
  // HEADER
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // SECTION
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  
  // SETTING ITEM - Core settings, primary weight
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 14,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // COLLECTION ITEM - Lighter weight
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  collectionTitle: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  collectionCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  
  // FOOTER
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: -60,
    right: 0,
    padding: 8,
  },
  modalAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 24,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
  },
});
