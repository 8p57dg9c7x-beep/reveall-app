import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';

const CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'tie' },
  { id: 'celebrity', name: 'Celebrity', icon: 'star' },
];

export default function StyleScreen() {
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOutfits();
  }, [selectedCategory]);

  const loadOutfits = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cinescan-app-2.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/outfits/${selectedCategory}`);
      const data = await response.json();
      setOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? COLORS.textPrimary : COLORS.textSecondary}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderOutfitCard = ({ item }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => router.push({
        pathname: '/outfitdetail',
        params: { outfitData: JSON.stringify(item) }
      })}
    >
      <Image source={{ uri: item.image }} style={styles.outfitImage} />
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.outfitPrice}>{item.priceRange || 'View Details'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Style Discovery</Text>
        <Text style={styles.headerSubtitle}>Curated outfit inspiration</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        renderItem={renderCategoryButton}
        keyExtractor={(item) => item.id}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading outfits...</Text>
        </View>
      ) : outfits.length > 0 ? (
        <FlatList
          data={outfits}
          renderItem={renderOutfitCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.outfitsGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="hanger" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Outfits Yet</Text>
          <Text style={styles.emptySubtitle}>
            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} outfits will appear here once added.
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categoriesContainer: {
    maxHeight: 56,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  outfitsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outfitCard: {
    flex: 0.48,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  outfitImage: {
    width: '100%',
    height: 240,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  outfitInfo: {
    padding: 12,
  },
  outfitTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  outfitPrice: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
