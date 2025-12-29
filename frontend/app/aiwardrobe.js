// My Closet - A personal space, not a list
// "This is where your wardrobe begins."

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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';
import { ONBOARDING_CONFIG } from '../services/onboardingService';
import { useHelpMeDecide } from '../contexts/HelpMeDecideContext';

const WARDROBE_STORAGE_KEY = '@reveal_wardrobe';

// Categories
const CATEGORIES = [
  { id: 'tops', label: 'Tops', icon: 'tshirt-crew-outline' },
  { id: 'bottoms', label: 'Bottoms', icon: 'lingerie' },
  { id: 'shoes', label: 'Shoes', icon: 'shoe-sneaker' },
  { id: 'outerwear', label: 'Outerwear', icon: 'coat-rack' },
];

// Default items
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
  const { openHelpMeDecide } = useHelpMeDecide();

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
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

  const pickImage = async () => {
    triggerHaptic();
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newItem = {
        id: Date.now().toString(),
        name: 'New Item',
        category: 'tops',
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
  };

  const deleteItem = async (itemId) => {
    triggerHaptic();
    
    const doDelete = async () => {
      const updated = wardrobeItems.filter(item => item.id !== itemId);
      setWardrobeItems(updated);
      await saveWardrobe(updated);
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

  const getItemsByCategory = (categoryId) => {
    return wardrobeItems.filter(item => item.category === categoryId);
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

  // Render category section
  const renderSection = (category) => {
    const items = getItemsByCategory(category.id);
    if (items.length === 0) return null;
    
    return (
      <View key={category.id} style={styles.section}>
        <Text style={styles.sectionLabel}>{category.label}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionContent}
        >
          {items.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.item}
              onPress={() => editMode && deleteItem(item.id)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              {editMode && (
                <View style={styles.deleteIcon}>
                  <MaterialCommunityIcons name="close" size={12} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Closet</Text>
            {getProgressMessage() && (
              <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
            )}
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

        {/* Help me decide - Subtle text link (secondary) */}
        {canStyle && !editMode && (
          <TouchableOpacity 
            style={styles.subtleLink}
            onPress={() => { triggerHaptic(); openHelpMeDecide(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.subtleLinkText}>Need outfit inspiration?</Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        {hasItems ? (
          <View style={styles.closetContent}>
            {CATEGORIES.map(renderSection)}
          </View>
        ) : (
          /* Premium Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyVisual}>
              <View style={styles.emptyHanger}>
                <MaterialCommunityIcons name="hanger" size={48} color="rgba(255,255,255,0.15)" />
              </View>
            </View>
            <Text style={styles.emptyTitle}>This is where your wardrobe begins</Text>
            <Text style={styles.emptySubtitle}>
              Add your clothes to create a space that is organized, calm, and ready to help you look your best.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Single Primary CTA */}
      {!editMode && (
        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={pickImage}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    minHeight: '100%',
  },
  
  // Header - Minimal
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  progressMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  editTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Decide Card
  decideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: 32,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(177, 76, 255, 0.08)',
    borderRadius: 16,
  },
  decideText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  
  // Closet Content
  closetContent: {
    gap: 32,
  },
  
  // Section
  section: {
    // No card styling - items float in space
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: 16,
  },
  sectionContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    gap: 16,
  },
  
  // Item
  item: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State - Warm & Premium
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyVisual: {
    marginBottom: 40,
  },
  emptyHanger: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Bottom CTA
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 16,
    backgroundColor: 'rgba(11, 8, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
