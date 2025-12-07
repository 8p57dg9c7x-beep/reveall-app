import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import OutfitCard from '../components/OutfitCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';

const STYLE_CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', icon: 'tshirt-crew' },
  { id: 'luxury', name: 'Luxury', icon: 'diamond-stone' },
  { id: 'minimal', name: 'Minimal', icon: 'circle-outline' },
  { id: 'sport', name: 'Sport', icon: 'run' },
  { id: 'elegant', name: 'Elegant', icon: 'shoe-heel' },
  { id: 'affordable-fits', name: 'Affordable Fits', icon: 'cash-multiple' },
];

export default function StyleDiscovery() {
  const flatListRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('streetwear');
  const [celebrityOutfits, setCelebrityOutfits] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCelebrityOutfits();
  }, []);

  useEffect(() => {
    loadOutfits();
  }, [selectedCategory]);

  const loadOutfits = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🌐 ENV API_URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('🎯 Using API_URL:', API_BASE_URL);
      console.log('🔍 Fetching outfits from:', `${API_BASE_URL}/api/outfits/${selectedCategory}`);
      const response = await fetch(`${API_BASE_URL}/api/outfits/${selectedCategory}`);
      console.log('📡 Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('✅ Fetched outfits:', data?.outfits?.length, 'items');
      if (data?.outfits?.[0]) {
        console.log('   First outfit image:', data.outfits[0].image);
      }
      setOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadCelebrityOutfits = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outfits/celebrity`);
      const data = await response.json();
      setCelebrityOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error loading celebrity outfits:', error);
    }
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId === selectedCategory) return;
    setSelectedCategory(categoryId);
    // Reset scroll position to top when switching categories
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [selectedCategory]);

  const handleCelebrityPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit) },
    });
  }, []);

  const handleOutfitPress = useCallback((outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit) },
    });
  }, []);

  const renderCategoryButton = useCallback((category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <MaterialCommunityIcons
        name={category.icon}
        size={20}
        color={selectedCategory === category.id ? COLORS.background : COLORS.textSecondary}
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.categoryButtonTextActive,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategorySelect]);

  // Group outfits into pairs for 2-column layout
  const pairedOutfits = React.useMemo(() => {
    const pairs = [];
    for (let i = 0; i < outfits.length; i += 2) {
      pairs.push({
        id: `pair-${i}`,
        left: outfits[i],
        right: outfits[i + 1] || null,
      });
    }
    return pairs;
  }, [outfits]);

  const renderOutfitPair = useCallback(({ item }) => (
    <View style={styles.outfitRow}>
      <OutfitCard item={item.left} onPress={() => handleOutfitPress(item.left)} />
      {item.right && (
        <OutfitCard item={item.right} onPress={() => handleOutfitPress(item.right)} />
      )}
    </View>
  ), [handleOutfitPress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Style Discovery</Text>
        <Text style={styles.headerSubtitle}>Curated outfit inspiration</Text>
      </View>

      {celebrityOutfits.length > 0 && (
        <View style={styles.celebritySection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star" size={20} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Dress Like Your Icon</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.celebrityScroll}
          >
            {celebrityOutfits.map((outfit) => (
              <TouchableOpacity
                key={outfit.id}
                style={styles.celebrityCard}
                onPress={() => handleCelebrityPress(outfit)}
              >
                <OutfitCard item={outfit} onPress={() => handleCelebrityPress(outfit)} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {STYLE_CATEGORIES.map(renderCategoryButton)}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} width="48%" height={240} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : outfits.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={pairedOutfits}
          renderItem={renderOutfitPair}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.outfitsGrid}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="hanger" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No outfits yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for style inspiration</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingTop: 60, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 12 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  celebritySection: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginLeft: 8 },
  celebrityScroll: { paddingHorizontal: 16, gap: 12 },
  celebrityCard: { width: 160 },
  categoriesScroll: { maxHeight: 50 },
  categoriesContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface, gap: 6 },
  categoryButtonActive: { backgroundColor: COLORS.primary },
  categoryButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  categoryButtonTextActive: { color: COLORS.background },
  loadingContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
  outfitsGrid: { paddingHorizontal: 16, paddingBottom: 80 },
  outfitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, opacity: 0.7 },
});