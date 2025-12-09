import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';
import OutfitCard from '../components/OutfitCard';
import BeautyCard from '../components/BeautyCard';
import FadeInView from '../components/FadeInView';
import AnimatedPressable from '../components/AnimatedPressable';

export default function FavoritesScreen() {
  const { favoriteOutfits, favoriteBeauty, loading } = useFavorites();
  const [activeTab, setActiveTab] = useState('outfits'); // 'outfits' or 'beauty'

  const handleOutfitPress = (outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit) }
    });
  };

  const handleBeautyPress = (look) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(look) }
    });
  };

  const renderOutfitRow = ({ item, index }) => {
    const isLeft = index % 2 === 0;
    return (
      <OutfitCard 
        item={item} 
        isLeft={isLeft} 
        onPress={() => handleOutfitPress(item)} 
      />
    );
  };

  const renderBeautyRow = ({ item, index }) => {
    const isLeft = index % 2 === 0;
    return (
      <BeautyCard 
        item={item} 
        isLeft={isLeft} 
        onPress={() => handleBeautyPress(item)} 
      />
    );
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name={type === 'outfits' ? 'hanger' : 'palette-outline'} 
        size={80} 
        color={COLORS.textSecondary} 
      />
      <Text style={styles.emptyTitle}>
        No Saved {type === 'outfits' ? 'Outfits' : 'Beauty Looks'} Yet
      </Text>
      <Text style={styles.emptySubtitle}>
        Tap the ❤️ heart icon to save your favorites
      </Text>
      <AnimatedPressable
        style={styles.exploreButton}
        onPress={() => router.push(type === 'outfits' ? '/style' : '/beauty')}
      >
        <Text style={styles.exploreButtonText}>
          Explore {type === 'outfits' ? 'Outfits' : 'Beauty Looks'}
        </Text>
      </AnimatedPressable>
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      {/* Header */}
      <FadeInView style={styles.header}>
        <View style={styles.headerTop}>
          <MaterialCommunityIcons name="heart" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Your saved outfits and beauty looks
        </Text>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <AnimatedPressable
            style={[
              styles.tab,
              activeTab === 'outfits' && styles.tabActive
            ]}
            onPress={() => setActiveTab('outfits')}
            scaleValue={0.98}
          >
            <MaterialCommunityIcons 
              name="hanger" 
              size={20} 
              color={activeTab === 'outfits' ? COLORS.textPrimary : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'outfits' && styles.tabTextActive
            ]}>
              Outfits ({favoriteOutfits.length})
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[
              styles.tab,
              activeTab === 'beauty' && styles.tabActive
            ]}
            onPress={() => setActiveTab('beauty')}
            scaleValue={0.98}
          >
            <MaterialCommunityIcons 
              name="palette-outline" 
              size={20} 
              color={activeTab === 'beauty' ? COLORS.textPrimary : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'beauty' && styles.tabTextActive
            ]}>
              Beauty ({favoriteBeauty.length})
            </Text>
          </AnimatedPressable>
        </View>
      </FadeInView>

      {/* Content */}
      {activeTab === 'outfits' ? (
        favoriteOutfits.length > 0 ? (
          <FlatList
            data={favoriteOutfits}
            renderItem={renderOutfitRow}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState('outfits')
        )
      ) : (
        favoriteBeauty.length > 0 ? (
          <FlatList
            data={favoriteBeauty}
            renderItem={renderBeautyRow}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState('beauty')
        )
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
