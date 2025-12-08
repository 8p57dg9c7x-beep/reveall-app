import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';
import OutfitCard from '../components/OutfitCard';

export default function SavedOutfitsScreen() {
  const { favoriteOutfits } = useFavorites();

  const handleOutfitPress = (outfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(outfit) },
    });
  };

  const renderOutfitRow = ({ item, index }) => {
    const isLeft = index % 2 === 0;
    const nextItem = index < favoriteOutfits.length - 1 ? favoriteOutfits[index + 1] : null;

    if (!isLeft) return null;

    return (
      <View style={styles.row}>
        <OutfitCard
          item={item}
          onPress={() => handleOutfitPress(item)}
          isLeft={true}
        />
        {nextItem && (
          <OutfitCard
            item={nextItem}
            onPress={() => handleOutfitPress(nextItem)}
            isLeft={false}
          />
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="heart-outline" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Saved Outfits Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on any outfit to save it here
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push('/style')}
      >
        <Text style={styles.exploreButtonText}>Explore Outfits</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Saved Outfits</Text>
          <Text style={styles.headerSubtitle}>{favoriteOutfits.length} items</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={favoriteOutfits}
        renderItem={renderOutfitRow}
        keyExtractor={(item) => item.id?.toString()}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});