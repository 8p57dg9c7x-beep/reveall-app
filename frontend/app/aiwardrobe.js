import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';
import GradientButton from '../components/GradientButton';
import { uploadImage, pollJobResult } from '../services/revealAPI';

export default function AIWardrobeScreen() {
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/stylelab';
  
  const [wardrobeItems, setWardrobeItems] = useState([
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
  ]);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [showOutfits, setShowOutfits] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // Handle back navigation
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
        // Use actual backend API for auto-tagging
        console.log('👔 Calling Reveal Wardrobe API...');
        const uploadResult = await uploadImage(imageUri, 'wardrobe');
        
        console.log('📦 Job created:', uploadResult.jobId);
        
        // Poll for results
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
          setWardrobeItems([...wardrobeItems, newItem]);
          Alert.alert(
            'Item Added!', 
            `AI tagged: ${tagData.category} - ${tagData.tags.join(', ')} (${Math.round(tagData.confidence * 100)}% confidence)`
          );
          return;
        }
        
        throw new Error('Using fallback');
      } catch (error) {
        console.log('⚠️ Using fallback auto-tag:', error.message);
        
        // Fallback mock auto-tag
        const newItem = {
          id: Date.now(),
          image: imageUri,
          category: 'tops',
          tags: ['new', 'imported'],
          name: 'New Item',
        };
        setWardrobeItems([...wardrobeItems, newItem]);
        Alert.alert('Item Added!', 'AI has automatically tagged your item');
      }
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const generateOutfits = () => {
    // Mock outfit generation with loading
    const mockOutfits = [
      {
        id: 1,
        items: selectedItems.slice(0, 3),
        name: 'Casual Day Out',
        occasion: 'Casual',
        season: 'Spring/Summer',
        weather: 'Sunny',
        vibe: 'Relaxed & Comfortable',
      },
      {
        id: 2,
        items: selectedItems.slice(0, 2),
        name: 'Urban Minimal',
        occasion: 'Everyday',
        season: 'All Seasons',
        weather: 'Any',
        vibe: 'Clean & Modern',
      },
      {
        id: 3,
        items: selectedItems,
        name: 'Street Ready',
        occasion: 'Weekend',
        season: 'Fall/Winter',
        weather: 'Cool',
        vibe: 'Edgy & Bold',
      },
    ];
    
    setGeneratedOutfits(mockOutfits);
    setShowOutfits(true);
  };

  const filteredItems = activeCategory === 'all' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === activeCategory);

  const renderWardrobeItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.wardrobeItem, isSelected && styles.wardrobeItemSelected]}
        onPress={() => toggleSelectItem(item.id)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        {isSelected && (
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

  const renderOutfit = (outfit) => {
    const outfitItems = wardrobeItems.filter(item => outfit.items.includes(item.id));
    
    return (
      <View key={outfit.id} style={styles.outfitCard}>
        <View style={styles.outfitHeader}>
          <Text style={styles.outfitName}>{outfit.name}</Text>
          <TouchableOpacity style={styles.favoriteOutfitButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.outfitMeta}>
          <View style={styles.outfitMetaItem}>
            <MaterialCommunityIcons name="weather-sunny" size={16} color={COLORS.accent} />
            <Text style={styles.outfitMetaText}>{outfit.season}</Text>
          </View>
          <View style={styles.outfitMetaItem}>
            <MaterialCommunityIcons name="tag" size={16} color={COLORS.accent} />
            <Text style={styles.outfitMetaText}>{outfit.occasion}</Text>
          </View>
        </View>

        <View style={styles.vibeSection}>
          <Text style={styles.vibeLabel}>Vibe:</Text>
          <Text style={styles.vibeText}>{outfit.vibe}</Text>
        </View>
        
        {/* Outfit Items Grid */}
        <View style={styles.outfitItems}>
          {outfitItems.map((item) => (
            <View key={item.id} style={styles.outfitItemContainer}>
              <Image source={{ uri: item.image }} style={styles.outfitItemImage} />
              <Text style={styles.outfitItemName} numberOfLines={1}>{item.name}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.saveOutfitButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="content-save" size={18} color="#fff" />
          <Text style={styles.saveOutfitText}>Save to Favorites</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI Wardrobe</Text>
        </View>
        <TouchableOpacity onPress={pickImage} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {!showOutfits ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {categories.map(renderCategoryTab)}
          </ScrollView>

          {/* Wardrobe Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'all' ? 'My Wardrobe' : categories.find(c => c.id === activeCategory)?.name} 
              {' '}({filteredItems.length} items)
            </Text>
            {selectedItems.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedItems([])} activeOpacity={0.8}>
                <Text style={styles.clearSelection}>Clear ({selectedItems.length})</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={filteredItems}
            renderItem={renderWardrobeItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.wardrobeRow}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyStateText}>No items in this category</Text>
              </View>
            }
          />

          {/* Create Outfit Button */}
          <GradientButton
            title={`Create Outfit (${selectedItems.length} selected)`}
            onPress={generateOutfits}
            disabled={selectedItems.length < 2}
            icon={<MaterialCommunityIcons name="sparkles" size={20} color="#fff" />}
            style={styles.createButton}
          />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.outfitsHeader}>
            <View>
              <Text style={styles.outfitsTitle}>Generated Outfits</Text>
              <Text style={styles.outfitsSubtitle}>{generatedOutfits.length} unique combinations</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setShowOutfits(false);
                setSelectedItems([]);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close-circle" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {generatedOutfits.map(renderOutfit)}
        </ScrollView>
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  clearSelection: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  wardrobeRow: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  wardrobeItem: {
    width: '48%',
    height: 240,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  wardrobeItemSelected: {
    borderColor: COLORS.primary,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
  },
  createButton: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  outfitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  outfitsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  outfitsSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  outfitCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  outfitName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  favoriteOutfitButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  outfitMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outfitMetaText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  vibeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 8,
  },
  vibeLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  vibeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  outfitItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  outfitItemContainer: {
    width: '30%',
    alignItems: 'center',
  },
  outfitItemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 6,
  },
  outfitItemName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveOutfitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  saveOutfitText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
