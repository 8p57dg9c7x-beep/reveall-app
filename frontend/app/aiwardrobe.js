// My Closet - v1: A Real Wardrobe Experience
// Horizontal drawers, sections, haptic feedback

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';
import { ONBOARDING_CONFIG } from '../services/onboardingService';

const WARDROBE_STORAGE_KEY = '@reveal_wardrobe';

// Categories as "drawers"
const DRAWERS = [
  { id: 'tops', label: 'Tops', icon: 'tshirt-crew-outline' },
  { id: 'bottoms', label: 'Bottoms', icon: 'lingerie' },
  { id: 'shoes', label: 'Shoes', icon: 'shoe-sneaker' },
  { id: 'outerwear', label: 'Outerwear', icon: 'coat-rack' },
  { id: 'accessories', label: 'Accessories', icon: 'watch' },
];

// Default starter items
const DEFAULT_ITEMS = [
  { id: '1', name: 'White T-Shirt', category: 'tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80' },
  { id: '2', name: 'Black Jeans', category: 'bottoms', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80' },
  { id: '3', name: 'White Sneakers', category: 'shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80' },
  { id: '4', name: 'Denim Jacket', category: 'outerwear', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&q=80' },
];

export default function MyClosetScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset scroll on focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Load wardrobe
  useEffect(() => {
    loadWardrobe();
  }, []);

  const loadWardrobe = async () => {
    try {
      const stored = await AsyncStorage.getItem(WARDROBE_STORAGE_KEY);
      if (stored) {
        setWardrobeItems(JSON.parse(stored));
      } else {
        setWardrobeItems(DEFAULT_ITEMS);
        await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
      }
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      setWardrobeItems(DEFAULT_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const saveWardrobe = async (items) => {
    try {
      await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wardrobe:', error);
    }
  };

  // Haptic feedback helper
  const triggerHaptic = (type = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // Pick image and add item
  const pickImage = async () => {
    triggerHaptic('light');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to add items.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Auto-detect category (simplified for v1)
      const newItem = {
        id: Date.now().toString(),
        name: 'New Item',
        category: 'tops', // Default, user can change later
        image: result.assets[0].uri,
        addedAt: new Date().toISOString(),
      };

      const updated = [newItem, ...wardrobeItems];
      setWardrobeItems(updated);
      await saveWardrobe(updated);
      
      // Success haptic and milestone check
      triggerHaptic('success');
      
      // Milestone feedback
      if (updated.length === ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) {
        setTimeout(() => {
          Alert.alert(
            '🎉 Ready to Style!',
            'Your wardrobe can now dress you. Tap "Style My Wardrobe" to get outfit ideas.',
            [{ text: 'Let\'s Go!', style: 'default' }]
          );
        }, 500);
      }
    }
  };

  // Delete item
  const deleteItem = async (itemId) => {
    triggerHaptic('medium');
    
    if (Platform.OS === 'web') {
      if (window.confirm('Remove this item from your closet?')) {
        const updated = wardrobeItems.filter(item => item.id !== itemId);
        setWardrobeItems(updated);
        await saveWardrobe(updated);
      }
    } else {
      Alert.alert(
        'Remove Item',
        'Remove this item from your closet?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              const updated = wardrobeItems.filter(item => item.id !== itemId);
              setWardrobeItems(updated);
              await saveWardrobe(updated);
              triggerHaptic('success');
            },
          },
        ]
      );
    }
  };

  // Get items for a drawer/category
  const getDrawerItems = (categoryId) => {
    return wardrobeItems.filter(item => item.category === categoryId);
  };

  // Check if can style
  const canStyle = wardrobeItems.length >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;

  // Render a single drawer section
  const renderDrawer = (drawer) => {
    const items = getDrawerItems(drawer.id);
    
    return (
      <View key={drawer.id} style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <View style={styles.drawerLabel}>
            <MaterialCommunityIcons name={drawer.icon} size={18} color={COLORS.textSecondary} />
            <Text style={styles.drawerTitle}>{drawer.label}</Text>
          </View>
          <Text style={styles.drawerCount}>{items.length}</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.drawerContent}
        >
          {items.length > 0 ? (
            items.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.itemCard}
                onLongPress={() => editMode && deleteItem(item.id)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                {editMode && (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyDrawer}>
              <MaterialCommunityIcons name={drawer.icon} size={24} color={COLORS.textMuted} />
              <Text style={styles.emptyDrawerText}>No {drawer.label.toLowerCase()} yet</Text>
            </View>
          )}
          
          {/* Add button at end of drawer */}
          <TouchableOpacity 
            style={styles.addInDrawer}
            onPress={pickImage}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Closet</Text>
            <Text style={styles.headerSubtitle}>{wardrobeItems.length} items</Text>
          </View>
          <TouchableOpacity 
            onPress={() => { setEditMode(!editMode); triggerHaptic('light'); }}
            style={[styles.editButton, editMode && styles.editButtonActive]}
          >
            <MaterialCommunityIcons 
              name={editMode ? "check" : "pencil"} 
              size={18} 
              color={editMode ? "#FFFFFF" : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Style My Wardrobe - Only after milestone */}
        {canStyle && !editMode && (
          <TouchableOpacity 
            style={styles.styleCard}
            onPress={() => { triggerHaptic('light'); router.push('/aistylist'); }}
            activeOpacity={0.9}
          >
            <View style={styles.styleCardLeft}>
              <Text style={styles.styleCardTitle}>Style My Wardrobe</Text>
              <Text style={styles.styleCardSubtitle}>Get outfit ideas for today</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Milestone Progress - Before unlocking */}
        {!canStyle && (
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneProgress}>
              <View style={[styles.milestoneBar, { width: `${(wardrobeItems.length / ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) * 100}%` }]} />
            </View>
            <Text style={styles.milestoneText}>
              {ONBOARDING_CONFIG.MIN_CLOSET_ITEMS - wardrobeItems.length} more to unlock outfit suggestions
            </Text>
          </View>
        )}

        {/* Drawers */}
        <View style={styles.drawersSection}>
          {DRAWERS.map(renderDrawer)}
        </View>

      </ScrollView>

      {/* Bottom Add CTA */}
      {!editMode && (
        <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={pickImage}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons name="camera-plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Mode Banner */}
      {editMode && (
        <View style={[styles.editBanner, { paddingBottom: insets.bottom + 16 }]}>
          <MaterialCommunityIcons name="gesture-tap" size={18} color="#FFD93D" />
          <Text style={styles.editBannerText}>Tap items to remove them</Text>
        </View>
      )}
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
    paddingBottom: 100,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: COLORS.primary,
  },
  
  // Style Card
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 24,
    padding: 18,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  styleCardLeft: {},
  styleCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  styleCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Milestone
  milestoneCard: {
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
  },
  milestoneProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  milestoneBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  milestoneText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Drawers Section
  drawersSection: {
    gap: 8,
  },
  drawer: {
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 12,
  },
  drawerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  drawerCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  drawerContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    gap: 12,
  },
  
  // Item Card
  itemCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty Drawer
  emptyDrawer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },
  emptyDrawerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Add in Drawer
  addInDrawer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: 'rgba(177, 76, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  
  // Bottom CTA
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 16,
    backgroundColor: 'rgba(11, 8, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Edit Banner
  editBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 217, 61, 0.15)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 217, 61, 0.3)',
  },
  editBannerText: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '600',
  },
});
