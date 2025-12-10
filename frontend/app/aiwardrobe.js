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
import { router } from 'expo-router';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import GradientButton from '../components/GradientButton';

export default function AIWardrobeScreen() {
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
  ]);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [showOutfits, setShowOutfits] = useState(false);

  const categories = [
    { id: 'tops', name: 'Tops', icon: 'tshirt-crew', count: 1 },
    { id: 'bottoms', name: 'Bottoms', icon: 'clipboard-list', count: 1 },
    { id: 'shoes', name: 'Shoes', icon: 'shoe-sneaker', count: 1 },
    { id: 'accessories', name: 'Accessories', icon: 'diamond', count: 0 },
  ];

  const handleAddItem = () => {
    Alert.alert('Add Item', 'Camera or gallery picker would open here', [
      {
        text: 'OK',
        onPress: () => {
          // Mock adding a new item
          const newItem = {
            id: Date.now(),
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=80',
            category: 'tops',
            tags: ['blue', 'denim', 'jacket'],
            name: 'Denim Jacket',
          };
          setWardrobeItems([...wardrobeItems, newItem]);
        }
      }
    ]);
  };

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const generateOutfits = () => {
    // Mock outfit generation
    const mockOutfits = [
      {
        id: 1,
        items: [1, 2, 3],
        name: 'Casual Day Out',
        occasion: 'Casual',
        season: 'Spring/Summer',
      },
      {
        id: 2,
        items: [1, 2],
        name: 'Minimal Look',
        occasion: 'Everyday',
        season: 'All Seasons',
      },
    ];
    
    setGeneratedOutfits(mockOutfits);
    setShowOutfits(true);
  };

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
            <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemTags}>
            {item.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.itemTag}>
                <Text style={styles.itemTagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category) => {
    return (
      <TouchableOpacity key={category.id} style={styles.categoryTab}>
        <MaterialCommunityIcons name={category.icon} size={24} color={COLORS.textPrimary} />
        <Text style={styles.categoryTabText}>{category.name}</Text>
        <View style={styles.categoryCount}>
          <Text style={styles.categoryCountText}>{category.count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOutfit = (outfit) => {
    const outfitItems = wardrobeItems.filter(item => outfit.items.includes(item.id));
    
    return (
      <View key={outfit.id} style={styles.outfitCard}>
        <Text style={styles.outfitName}>{outfit.name}</Text>
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
        <View style={styles.outfitItems}>
          {outfitItems.map((item) => (
            <Image key={item.id} source={{ uri: item.image }} style={styles.outfitItemImage} />
          ))}
        </View>
        <TouchableOpacity style={styles.saveOutfitButton}>
          <MaterialCommunityIcons name="heart-outline" size={18} color="#fff" />
          <Text style={styles.saveOutfitText}>Save Outfit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI Wardrobe</Text>
        </View>
        <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
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
          <Text style={styles.sectionTitle}>My Wardrobe ({wardrobeItems.length} items)</Text>
          
          <FlatList
            data={wardrobeItems}
            renderItem={renderWardrobeItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.wardrobeRow}
          />

          {/* Create Outfit Button */}
          <GradientButton
            title="Create Outfit"
            onPress={generateOutfits}
            disabled={selectedItems.length < 2}
            icon={<MaterialCommunityIcons name="sparkles" size={20} color="#fff" />}
            style={styles.createButton}
          />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.outfitsHeader}>
            <Text style={styles.outfitsTitle}>Generated Outfits</Text>
            <TouchableOpacity onPress={() => setShowOutfits(false)}>
              <Text style={styles.backToWardrobe}>Back to Wardrobe</Text>
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
    paddingBottom: 40,
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
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusPill,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  categoryTabText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryCount: {
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  wardrobeRow: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  wardrobeItem: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wardrobeItemSelected: {
    borderColor: COLORS.primary,
  },
  itemImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 4,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemTag: {
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemTagText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '600',
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
  backToWardrobe: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  outfitCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  outfitMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
  outfitItems: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  outfitItemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  saveOutfitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
  },
  saveOutfitText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
