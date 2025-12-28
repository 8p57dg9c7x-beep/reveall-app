// My Closet - v1: The Heart of the App
// Premium, spacious, calm digital wardrobe

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import GradientButton from '../components/GradientButton';
import { uploadImage, pollJobResult } from '../services/revealAPI';
import { ONBOARDING_CONFIG } from '../services/onboardingService';

const WARDROBE_STORAGE_KEY = '@reveal_wardrobe';

export default function AIWardrobeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/stylelab';
  
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load wardrobe from AsyncStorage on mount
  useEffect(() => {
    loadWardrobe();
  }, []);

  const loadWardrobe = async () => {
    try {
      const stored = await AsyncStorage.getItem(WARDROBE_STORAGE_KEY);
      if (stored) {
        setWardrobeItems(JSON.parse(stored));
      } else {
        // Default starter items for new users
        const defaultItems = [
          {
            id: 1,
            image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80',
            category: 'tops',
            tags: ['white', 'casual', 'cotton'],
            name: 'White T-Shirt',
          },
          {
            id: 2,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80',
            category: 'bottoms',
            tags: ['black', 'jeans', 'denim'],
            name: 'Black Jeans',
          },
          {
            id: 3,
            image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300&q=80',
            category: 'shoes',
            tags: ['sneakers', 'white', 'sport'],
            name: 'White Sneakers',
          },
          {
            id: 4,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=80',
            category: 'outerwear',
            tags: ['blue', 'denim', 'jacket'],
            name: 'Denim Jacket',
          },
        ];
        setWardrobeItems(defaultItems);
        await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(defaultItems));
      }
    } catch (error) {
      console.log('Error loading wardrobe:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWardrobe = async (items) => {
    try {
      await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.log('Error saving wardrobe:', error);
    }
  };

  const handleBack = () => {
    router.push(returnPath);
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'view-grid', count: wardrobeItems.length },
    { id: 'tops', name: 'Tops', icon: 'tshirt-crew', count: wardrobeItems.filter(i => i.category === 'tops').length },
    { id: 'bottoms', name: 'Bottoms', icon: 'human-handsdown', count: wardrobeItems.filter(i => i.category === 'bottoms').length },
    { id: 'shoes', name: 'Shoes', icon: 'shoe-sneaker', count: wardrobeItems.filter(i => i.category === 'shoes').length },
    { id: 'outerwear', name: 'Outerwear', icon: 'coat-rack', count: wardrobeItems.filter(i => i.category === 'outerwear').length },
    { id: 'accessories', name: 'Accessories', icon: 'diamond', count: wardrobeItems.filter(i => i.category === 'accessories').length },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      
      try {
        console.log('👔 Calling Reveal Wardrobe API...');
        const uploadResult = await uploadImage(imageUri, 'wardrobe');
        console.log('📦 Job created:', uploadResult.jobId);
        
        const apiResult = await pollJobResult(uploadResult.jobId);
        
        if (apiResult.result && apiResult.result.item) {
          const tagData = apiResult.result.item;
          const newItem = {
            id: Date.now(),
            image: imageUri,
            category: tagData.category || 'tops',
            tags: tagData.tags || ['imported'],
            name: 'New Item',
            confidence: tagData.confidence || 0.85,
          };
          const updatedItems = [...wardrobeItems, newItem];
          setWardrobeItems(updatedItems);
          await saveWardrobe(updatedItems);
          Alert.alert(
            'Item Added!', 
            `AI tagged: ${tagData.category} - ${tagData.tags.join(', ')} (${Math.round(tagData.confidence * 100)}% confidence)`
          );
          return;
        }
        
        throw new Error('Using fallback');
      } catch (error) {
        console.log('⚠️ Using fallback auto-tag:', error.message);
        
        const newItem = {
          id: Date.now(),
          image: imageUri,
          category: 'tops',
          tags: ['new', 'imported'],
          name: 'New Item',
        };
        const updatedItems = [...wardrobeItems, newItem];
        setWardrobeItems(updatedItems);
        await saveWardrobe(updatedItems);
        Alert.alert('Item Added!', 'AI has automatically tagged your item');
      }
    }
  };

  // DELETE item functionality - Cross-platform (Web + Native)
  const deleteItem = useCallback(async (itemId) => {
    const confirmMessage = 'Are you sure you want to remove this item from your closet?';
    
    // Use window.confirm on web, Alert.alert on native
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        const updatedItems = wardrobeItems.filter(item => item.id !== itemId);
        setWardrobeItems(updatedItems);
        setSelectedItems(selectedItems.filter(id => id !== itemId));
        await saveWardrobe(updatedItems);
      }
    } else {
      Alert.alert(
        'Delete Item',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updatedItems = wardrobeItems.filter(item => item.id !== itemId);
              setWardrobeItems(updatedItems);
              setSelectedItems(selectedItems.filter(id => id !== itemId));
              await saveWardrobe(updatedItems);
            },
          },
        ]
      );
    }
  }, [wardrobeItems, selectedItems]);

  // DELETE multiple selected items - Cross-platform (Web + Native)
  const deleteSelectedItems = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    const confirmMessage = `Delete ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} from your closet?`;
    
    // Use window.confirm on web, Alert.alert on native
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        const updatedItems = wardrobeItems.filter(item => !selectedItems.includes(item.id));
        setWardrobeItems(updatedItems);
        setSelectedItems([]);
        await saveWardrobe(updatedItems);
      }
    } else {
      Alert.alert(
        'Delete Selected Items',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updatedItems = wardrobeItems.filter(item => !selectedItems.includes(item.id));
              setWardrobeItems(updatedItems);
              setSelectedItems([]);
              await saveWardrobe(updatedItems);
            },
          },
        ]
      );
    }
  }, [wardrobeItems, selectedItems]);

  // Long press to delete
  const handleLongPress = useCallback((itemId) => {
    deleteItem(itemId);
  }, [deleteItem]);

  const toggleSelectItem = (id) => {
    if (editMode) {
      // In edit mode, tap to delete
      deleteItem(id);
    } else {
      if (selectedItems.includes(id)) {
        setSelectedItems(selectedItems.filter(i => i !== id));
      } else {
        setSelectedItems([...selectedItems, id]);
      }
    }
  };

  const filteredItems = activeCategory === 'all' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === activeCategory);

  const renderWardrobeItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.wardrobeItem, isSelected && !editMode && styles.wardrobeItemSelected]}
        onPress={() => toggleSelectItem(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        delayLongPress={500}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        {/* Delete button in edit mode */}
        {editMode && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteItem(item.id)}
          >
            <MaterialCommunityIcons name="close-circle" size={28} color="#FF4757" />
          </TouchableOpacity>
        )}
        
        {/* Selection badge */}
        {isSelected && !editMode && (
          <View style={styles.selectedBadge}>
            <MaterialCommunityIcons name="check-circle" size={28} color={COLORS.primary} />
          </View>
        )}
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.itemOverlay}
        >
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemTags}>
            {item.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.itemTag}>
                <Text style={styles.itemTagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category) => {
    const isActive = activeCategory === category.id;
    
    return (
      <TouchableOpacity 
        key={category.id} 
        style={[styles.categoryTab, isActive && styles.categoryTabActive]}
        onPress={() => setActiveCategory(category.id)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name={category.icon} 
          size={20} 
          color={isActive ? COLORS.textPrimary : COLORS.textSecondary} 
        />
        <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
          {category.name}
        </Text>
        <View style={[styles.categoryCount, isActive && styles.categoryCountActive]}>
          <Text style={styles.categoryCountText}>{category.count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Clean Header - No back button since it's a tab */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Closet</Text>
            <Text style={styles.headerSubtitle}>{wardrobeItems.length} items</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setEditMode(!editMode)} 
            style={[styles.editButton, editMode && styles.editButtonActive]}
          >
            <MaterialCommunityIcons 
              name={editMode ? "check" : "pencil"} 
              size={20} 
              color={editMode ? "#FFFFFF" : COLORS.textPrimary} 
            />
          </TouchableOpacity>
        </View>

        {/* Edit Mode Banner */}
        {editMode && (
          <View style={styles.editBanner}>
            <MaterialCommunityIcons name="information" size={18} color="#FFD93D" />
            <Text style={styles.editBannerText}>Tap items to delete them</Text>
          </View>
        )}

        {/* Style My Wardrobe - Only shows after 3+ items */}
        {wardrobeItems.length >= ONBOARDING_CONFIG.MIN_CLOSET_ITEMS && !editMode && (
          <TouchableOpacity 
            style={styles.styleWardrobeCard}
            onPress={() => router.push('/aistylist')}
            activeOpacity={0.9}
          >
            <View style={styles.styleWardrobeContent}>
              <View style={styles.styleWardrobeIcon}>
                <MaterialCommunityIcons name="hanger" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.styleWardrobeText}>
                <Text style={styles.styleWardrobeTitle}>Style My Wardrobe</Text>
                <Text style={styles.styleWardrobeSubtitle}>Get outfit ideas from your clothes</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {categories.map(renderCategoryTab)}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'all' ? 'My Wardrobe' : categories.find(c => c.id === activeCategory)?.name} 
            {' '}({filteredItems.length} items)
          </Text>
          {selectedItems.length > 0 && !editMode && (
            <View style={styles.selectionActions}>
              <TouchableOpacity onPress={deleteSelectedItems} activeOpacity={0.8} style={styles.deleteSelectedBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FF4757" />
                <Text style={styles.deleteSelectedText}>Delete ({selectedItems.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedItems([])} activeOpacity={0.8}>
                <Text style={styles.clearSelection}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Wardrobe Grid */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="tshirt-crew-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>No items in this category</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={pickImage}>
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
              <Text style={styles.addFirstText}>Add your first item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.wardrobeGrid}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.wardrobeItemWrapper}>
                {renderWardrobeItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Add Item Button */}
        <GradientButton
          title="Add New Item"
          onPress={pickImage}
          icon={<MaterialCommunityIcons name="plus" size={20} color="#fff" />}
          style={styles.addButton}
        />

        {/* Hint text */}
        <Text style={styles.hintText}>
          💡 Long press any item to delete it
        </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
  },
  editButtonActive: {
    backgroundColor: COLORS.primary,
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 217, 61, 0.15)',
    borderRadius: 10,
  },
  editBannerText: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '600',
  },
  // Style My Wardrobe Card
  styleWardrobeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(177, 76, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
  },
  styleWardrobeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  styleWardrobeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(177, 76, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleWardrobeText: {
    flex: 1,
  },
  styleWardrobeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  styleWardrobeSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryTabs: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.subtitleToChips,
    gap: SPACING.chipGap,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusPill,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
  },
  categoryTabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: COLORS.textPrimary,
  },
  categoryCount: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountActive: {
    backgroundColor: COLORS.primary,
  },
  categoryCountText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionTitleToContent,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteSelectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  deleteSelectedText: {
    color: '#FF4757',
    fontSize: 13,
    fontWeight: '700',
  },
  clearSelection: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  wardrobeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.screenHorizontal,
    justifyContent: 'space-between',
  },
  wardrobeItemWrapper: {
    width: '48%',
    marginBottom: SPACING.cardGap,
  },
  wardrobeItem: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    ...CARD_SHADOW,
  },
  wardrobeItemSelected: {
    borderColor: COLORS.primary,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 2,
    zIndex: 10,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 4,
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemTag: {
    backgroundColor: 'rgba(177, 76, 255, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addFirstText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    marginHorizontal: SPACING.screenHorizontal,
    marginTop: 24,
  },
  hintText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 16,
    paddingHorizontal: 20,
  },
});
