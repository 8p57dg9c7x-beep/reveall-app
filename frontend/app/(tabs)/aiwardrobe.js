// My Closet - Personal Mode
// "Your wardrobe, your identity"

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
import { COLORS, GRADIENTS, SPACING } from '../../constants/theme';
import { ONBOARDING_CONFIG } from '../../services/onboardingService';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useHelpMeDecide } from '../_layout';

const WARDROBE_STORAGE_KEY = '@reveal_wardrobe';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// V1 Categories - Ordered by how people get dressed
const CATEGORIES = [
  { 
    id: 'outerwear', 
    label: 'Outerwear', 
    icon: 'coat-rack',
    placeholder: 'Add your first jacket',
    cardSize: { width: 120, height: 140 }, // Featured - larger
    featured: true,
  },
  { 
    id: 'tops', 
    label: 'Tops', 
    icon: 'tshirt-crew-outline',
    placeholder: 'Add a top',
    cardSize: { width: 100, height: 120 }, // Standard
  },
  { 
    id: 'bottoms', 
    label: 'Bottoms', 
    icon: 'lingerie',
    placeholder: 'Add bottoms',
    cardSize: { width: 100, height: 120 }, // Standard
  },
  { 
    id: 'shoes', 
    label: 'Shoes', 
    icon: 'shoe-sneaker',
    placeholder: 'Add your first pair',
    cardSize: { width: 110, height: 110 }, // Elevated - square
    elevated: true,
  },
];

// Default items (for demo purposes)
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(null);
  const { openHelpMeDecide } = useHelpMeDecide();
  const { favoriteOutfits } = useFavorites();

  // NAVIGATION: Always reset scroll AND re-fetch items on focus
  // CRITICAL: This ensures items added elsewhere are always visible
  useFocusEffect(
    useCallback(() => {
      // Reset scroll position
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      // Re-fetch wardrobe items every time tab gains focus
      loadWardrobe();
    }, [])
  );

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
      setWardrobeItems(DEFAULT_ITEMS);
    }
  };

  useEffect(() => {
    loadWardrobe();
  }, []);

  const saveWardrobe = async (items) => {
    await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(items));
  };

  const triggerHaptic = (type = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // STEP 1: User taps "Add Item" → Show category picker
  const handleAddItem = () => {
    triggerHaptic();
    setShowCategoryPicker(true);
  };

  // STEP 2: User selects category → Open image picker
  const selectCategoryAndPickImage = async (categoryId) => {
    triggerHaptic();
    setPendingCategory(categoryId);
    setShowCategoryPicker(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      setPendingCategory(null);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // STEP 3: Save item to EXACTLY the selected category
      const newItem = {
        id: Date.now().toString(),
        name: 'New Item',
        category: categoryId, // Explicit - user chose this
        image: result.assets[0].uri,
        addedAt: new Date().toISOString(),
      };

      const updated = [newItem, ...wardrobeItems];
      setWardrobeItems(updated);
      await saveWardrobe(updated);
      triggerHaptic('success');
      
      if (updated.length === ONBOARDING_CONFIG.MIN_CLOSET_ITEMS) {
        setTimeout(() => {
          Alert.alert(
            'Ready to style ✨',
            'Your wardrobe can now help you decide what to wear.',
            [{ text: 'Got it', style: 'default' }]
          );
        }, 400);
      }
    }
    
    setPendingCategory(null);
  };

  const deleteItem = async (itemId) => {
    triggerHaptic();
    
    const doDelete = async () => {
      const updated = wardrobeItems.filter(item => item.id !== itemId);
      setWardrobeItems(updated);
      await saveWardrobe(updated);
      setSelectedItem(null);
      triggerHaptic('success');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Remove this item?')) doDelete();
    } else {
      Alert.alert('Remove item?', '', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Replace item photo
  const replaceItemPhoto = async () => {
    if (!selectedItem) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const updated = wardrobeItems.map(item => 
        item.id === selectedItem.id 
          ? { ...item, image: result.assets[0].uri }
          : item
      );
      setWardrobeItems(updated);
      await saveWardrobe(updated);
      setSelectedItem({ ...selectedItem, image: result.assets[0].uri });
      triggerHaptic('success');
    }
  };

  // Handle item tap - in edit mode delete, otherwise show detail
  const handleItemPress = (item) => {
    triggerHaptic();
    if (editMode) {
      deleteItem(item.id);
    } else {
      setSelectedItem(item);
    }
  };

  // Category matching - case-insensitive and handles variations
  // Normalizes: "top" → "tops", "Top" → "tops", etc.
  const getItemsByCategory = (categoryId) => {
    const normalizedCategoryId = categoryId.toLowerCase();
    return wardrobeItems.filter(item => {
      const itemCategory = (item.category || '').toLowerCase();
      // Exact match
      if (itemCategory === normalizedCategoryId) return true;
      // Handle singular/plural variations
      if (normalizedCategoryId === 'tops' && itemCategory === 'top') return true;
      if (normalizedCategoryId === 'bottoms' && itemCategory === 'bottom') return true;
      if (normalizedCategoryId === 'shoes' && itemCategory === 'shoe') return true;
      return false;
    });
  };

  const hasItems = wardrobeItems.length > 0;
  const canStyle = wardrobeItems.length >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS;

  // Gentle Progress - Encouraging copy based on wardrobe size
  const getProgressMessage = () => {
    const count = wardrobeItems.length;
    if (count === 0) return null;
    if (count <= 2) return "Your wardrobe is taking shape";
    if (count <= 4) return "Almost ready for personalized suggestions";
    if (count <= 7) return "Your style story is growing";
    return "Your closet is ready to inspire";
  };

  // Render category section - ALWAYS show all categories with hierarchy
  const renderSection = (category) => {
    const items = getItemsByCategory(category.id);
    const { cardSize, featured, elevated, placeholder } = category;
    
    // Dynamic styles based on hierarchy
    const itemStyle = {
      width: cardSize.width,
      height: cardSize.height,
      borderRadius: featured ? 20 : elevated ? 16 : 16,
    };
    
    return (
      <View key={category.id} style={[styles.section, featured && styles.sectionFeatured]}>
        <Text style={[styles.sectionLabel, featured && styles.sectionLabelFeatured]}>
          {category.label}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionContent}
        >
          {items.length > 0 ? (
            // Show items
            items.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.item, itemStyle]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                {editMode && (
                  <View style={styles.deleteIcon}>
                    <MaterialCommunityIcons name="close" size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            // Show placeholder - guide user to add items
            <TouchableOpacity 
              style={[styles.placeholderCard, itemStyle]}
              onPress={() => selectCategoryAndPickImage(category.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name={category.icon} 
                size={featured ? 32 : 24} 
                color="rgba(177, 76, 255, 0.4)" 
              />
              <Text style={styles.placeholderText}>{placeholder}</Text>
            </TouchableOpacity>
          )}
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
        alwaysBounceVertical={true}
        bounces={true}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Closet</Text>
          </View>
          {hasItems && (
            <TouchableOpacity 
              onPress={() => { setEditMode(!editMode); triggerHaptic(); }}
              style={styles.editButton}
            >
              <Text style={[styles.editText, editMode && styles.editTextActive]}>
                {editMode ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Style Snapshot - Visual identity at top */}
        {hasItems && wardrobeItems.length >= 2 && (
          <View style={styles.snapshotContainer}>
            <View style={styles.snapshotGrid}>
              {wardrobeItems.slice(0, 4).map((item, index) => (
                <Image 
                  key={item.id} 
                  source={{ uri: item.image }} 
                  style={[
                    styles.snapshotImage,
                    wardrobeItems.length < 4 && index >= wardrobeItems.length && styles.snapshotImageHidden,
                  ]} 
                />
              ))}
              {/* Fill empty slots if less than 4 items */}
              {wardrobeItems.length < 4 && Array(4 - wardrobeItems.length).fill(0).map((_, i) => (
                <View key={`empty-${i}`} style={styles.snapshotEmpty} />
              ))}
            </View>
            <Text style={styles.snapshotCaption}>
              {wardrobeItems.length} {wardrobeItems.length === 1 ? 'piece' : 'pieces'} in your closet
            </Text>
          </View>
        )}

        {/* Clean-Out Mode Entry - Only show when items exist */}
        {hasItems && wardrobeItems.length >= 3 && !editMode && (
          <TouchableOpacity 
            style={styles.cleanOutButton}
            onPress={() => { triggerHaptic(); router.push('/cleanout'); }}
            activeOpacity={0.9}
          >
            <View style={styles.cleanOutIcon}>
              <MaterialCommunityIcons name="hanger" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cleanOutContent}>
              <Text style={styles.cleanOutTitle}>Clean-Out Mode</Text>
              <Text style={styles.cleanOutSubtitle}>Keep, Sell, or Donate</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}

        {/* Saved Looks - Surface inside My Closet */}
        {favoriteOutfits.length > 0 && (
          <View style={styles.savedLooksSection}>
            <View style={styles.savedLooksHeader}>
              <Text style={styles.savedLooksTitle}>Saved Looks</Text>
              <TouchableOpacity onPress={() => router.push('/saved-outfits')}>
                <Text style={styles.savedLooksSeeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedLooksScroll}
            >
              {favoriteOutfits.slice(0, 5).map((outfit) => (
                <TouchableOpacity 
                  key={outfit.id} 
                  style={styles.savedLookCard}
                  onPress={() => router.push('/saved-outfits')}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: outfit.image }} style={styles.savedLookImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Help me decide - Subtle text link */}
        {canStyle && !editMode && (
          <TouchableOpacity 
            style={styles.subtleLink}
            onPress={() => { triggerHaptic(); openHelpMeDecide(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.subtleLinkText}>Need outfit inspiration?</Text>
          </TouchableOpacity>
        )}

        {/* Your Pieces - Single section header */}
        {hasItems && (
          <Text style={styles.yourPiecesHeader}>Your Pieces</Text>
        )}

        {/* Content - ALWAYS show all categories */}
        <View style={styles.closetContent}>
          {CATEGORIES.map(renderSection)}
        </View>

        {/* Add Item Button - Inside scroll content, no overlap */}
        {!editMode && (
          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddItem}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Category Picker Modal - Step 1 of Add Flow */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.categoryPickerOverlay}>
          <View style={styles.categoryPickerContent}>
            <View style={styles.categoryPickerHeader}>
              <Text style={styles.categoryPickerTitle}>What are you adding?</Text>
              <TouchableOpacity 
                style={styles.categoryPickerClose}
                onPress={() => setShowCategoryPicker(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.categoryPickerGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryPickerItem}
                  onPress={() => selectCategoryAndPickImage(category.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.categoryPickerIcon,
                    category.featured && styles.categoryPickerIconFeatured,
                  ]}>
                    <MaterialCommunityIcons 
                      name={category.icon} 
                      size={32} 
                      color={COLORS.primary} 
                    />
                  </View>
                  <Text style={styles.categoryPickerLabel}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Item Detail Modal */}
      <Modal
        visible={selectedItem !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.itemModalOverlay}>
          <View style={styles.itemModalContent}>
            {/* Close button */}
            <TouchableOpacity 
              style={styles.itemModalCloseButton}
              onPress={() => setSelectedItem(null)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {/* Large item preview */}
            {selectedItem && (
              <>
                <Image source={{ uri: selectedItem.image }} style={styles.itemModalImage} />
                <Text style={styles.itemModalCategory}>
                  {CATEGORIES.find(c => c.id === selectedItem.category)?.label || 'Item'}
                </Text>
              </>
            )}
            
            {/* Actions */}
            <View style={styles.itemModalActions}>
              <TouchableOpacity 
                style={styles.itemModalActionButton}
                onPress={replaceItemPhoto}
              >
                <MaterialCommunityIcons name="camera" size={20} color={COLORS.primary} />
                <Text style={styles.itemModalActionText}>Replace Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.itemModalActionButton, styles.itemModalActionButtonDanger]}
                onPress={() => selectedItem && deleteItem(selectedItem.id)}
              >
                <MaterialCommunityIcons name="delete-outline" size={20} color="#FF6B6B" />
                <Text style={[styles.itemModalActionText, styles.itemModalActionTextDanger]}>Remove</Text>
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
  content: {
    paddingBottom: 100, // Tab bar is now properly handled structurally
    minHeight: '100%',
  },
  
  // Header - Clean and confident
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  editText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  editTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Style Snapshot - Visual identity
  snapshotContainer: {
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 24,
    alignItems: 'center',
  },
  snapshotGrid: {
    width: 140,
    height: 140,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    overflow: 'hidden',
    gap: 2,
  },
  snapshotImage: {
    width: 69,
    height: 69,
  },
  snapshotImageHidden: {
    opacity: 0,
  },
  snapshotEmpty: {
    width: 69,
    height: 69,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  snapshotCaption: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textMuted,
    opacity: 0.7,
  },
  
  // Clean-Out Mode Button
  cleanOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(177, 76, 255, 0.08)',
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
  },
  cleanOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanOutContent: {
    flex: 1,
    marginLeft: 12,
  },
  cleanOutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cleanOutSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Saved Looks Section
  savedLooksSection: {
    marginBottom: 24,
  },
  savedLooksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 12,
  },
  savedLooksTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  savedLooksSeeAll: {
    fontSize: 13,
    color: COLORS.primary,
  },
  savedLooksScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
    gap: 12,
  },
  savedLookCard: {
    width: 80,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  savedLookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  // Subtle Help Link (secondary action)
  subtleLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 8,
  },
  subtleLinkText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
    opacity: 0.7,
  },
  
  // Your Pieces Header
  yourPiecesHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 20,
  },
  
  // Closet Content - Tighter, cohesive
  closetContent: {
    gap: 24,
  },
  
  // Section - One wardrobe feel, not separate sections
  section: {
    // Subtle framing through spacing
  },
  sectionFeatured: {
    // Featured sections (Outerwear) get extra presence
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 12,
    opacity: 0.8,
  },
  sectionLabelFeatured: {
    fontWeight: '600',
    opacity: 1,
  },
  sectionContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    gap: 14,
  },
  
  // Item - Larger, more presence
  item: {
    width: 100,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 71, 87, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State - Warm & Premium
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingTop: 80,
  },
  emptyVisual: {
    marginBottom: 48,
  },
  emptyHanger: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  
  // Add Button - Inside scroll content
  addButtonContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 32,
    paddingBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Placeholder Card - Guide users to add items
  placeholderCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(177, 76, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 11,
    color: COLORS.textMuted,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  
  // Category Picker Modal
  categoryPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  categoryPickerContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: SPACING.screenHorizontal,
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  categoryPickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryPickerClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  categoryPickerItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryPickerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPickerIconFeatured: {
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  categoryPickerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  
  // Item Detail Modal
  itemModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemModalContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  itemModalCloseButton: {
    position: 'absolute',
    top: -80,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemModalImage: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    borderRadius: 20,
    marginBottom: 20,
  },
  itemModalCategory: {
    fontSize: 14,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  itemModalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  itemModalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  itemModalActionButtonDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  itemModalActionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
  },
  itemModalActionTextDanger: {
    color: '#FF6B6B',
  },
});
