import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OptimizedImage from './OptimizedImage';
import { COLORS } from '../constants/theme';

const OutfitCard = memo(({ item, onPress, isLeft }) => {
  return (
    <TouchableOpacity
      style={[styles.outfitCard, isLeft ? styles.cardLeft : styles.cardRight]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <OptimizedImage source={{ uri: item.image }} style={styles.outfitImage} />
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.outfitPrice}>{item.priceRange || 'View Details'}</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Only re-render if item.id changed
  return prevProps.item.id === nextProps.item.id && 
         prevProps.isLeft === nextProps.isLeft;
});

const styles = StyleSheet.create({
  outfitCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 310,
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
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
});

export default OutfitCard;
