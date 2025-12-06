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
  { id: 'affordable', name: 'Affordable Fits', icon: 'tag-multiple' },
  { id: 'celebrity', name: 'Celebrity', icon: 'star' },
];

export default function StyleScreen() {
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [outfits, setOutfits] = useState([]);
  const [celebrityOutfits, setCelebrityOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOutfits();
    loadCelebrityOutfits();
  }, [selectedCategory]);

  const loadOutfits = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-app.preview.emergentagent.com';
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

  const loadCelebrityOutfits = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reveal-app.preview.emergentagent.com';
      const response = await fetch(`${API_URL}/api/outfits/celebrity`);
      const data = await response.json();
      setCelebrityOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading celebrity outfits:', error);
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
        params: { 
          outfitData: JSON.stringify(item),
          returnPath: '/style'
        }
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
      pointerEvents="box-none"
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Style Discovery</Text>
          <Text style={styles.headerSubtitle}>Curated outfit inspiration</Text>
        </View>

        {/* Dress Like Your Icon Section */}
        {celebrityOutfits.length > 0 && (
          <View style={styles.celebritySection}>
            <View style={styles.celebritySectionHeader}>
              <MaterialCommunityIcons name="star" size={24} color={COLORS.accent} />
              <Text style={styles.celebritySectionTitle}>Dress Like Your Icon</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.celebrityScroll}
              contentContainerStyle={styles.celebrityScrollContent}
              nestedScrollEnabled
            >
              {celebrityOutfits.map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={styles.celebrityCard}
                  onPress={() => router.push({
                    pathname: '/outfitdetail',
                    params: { 
                      outfitData: JSON.stringify(outfit),
                      returnPath: '/style'
                    }
                  })}
                >
                  <Image source={{ uri: outfit.image }} style={styles.celebrityImage} />
                  <View style={styles.celebrityInfo}>
                    <Text style={styles.celebrityName}>{outfit.celebrity}</Text>
                    <Text style={styles.celebrityTitle} numberOfLines={1}>{outfit.title}</Text>
                    {outfit.priceRange && (
                      <Text style={styles.celebrityPrice}>{outfit.priceRange}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
          nestedScrollEnabled
        >
          {CATEGORIES.map((item) => renderCategoryButton({ item }))}
        </ScrollView>

        {/* Outfits Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={48} color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading outfits...</Text>
          </View>
        ) : outfits.length > 0 ? (
          <View style={styles.outfitsContainer}>
            {outfits.map((item, index) => {
              if (index % 2 === 0) {
                return (
                  <View key={index} style={styles.row}>
                    {renderOutfitCard({ item: outfits[index] })}
                    {outfits[index + 1] && renderOutfitCard({ item: outfits[index + 1] })}
                  </View>
                );
              }
              return null;
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="hanger" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Outfits Yet</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} outfits will appear here once added.
            </Text>
          </View>
        )}
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
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  celebritySection: {
    marginBottom: 24,
  },
  celebritySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  celebritySectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  celebrityScroll: {
    flexGrow: 0,
  },
  celebrityScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  celebrityCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  celebrityImage: {
    width: 160,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  celebrityInfo: {
    padding: 12,
  },
  celebrityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 4,
  },
  celebrityTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  celebrityPrice: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  categoriesContainer: {
    maxHeight: 56,
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
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
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  outfitsContainer: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outfitCard: {
    flex: 0.48,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
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
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
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
