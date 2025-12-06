import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OptimizedImage from './OptimizedImage';
import { COLORS } from '../constants/theme';

const BeautyCard = memo(({ item, onPress, isLeft }) => {
  return (
    <TouchableOpacity
      style={[styles.lookCard, isLeft ? styles.cardLeft : styles.cardRight]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <OptimizedImage source={{ uri: item.image }} style={styles.lookImage} />
      <View style={styles.lookInfo}>
        <Text style={styles.lookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.celebrity} numberOfLines={1}>{item.celebrity}</Text>
        <Text style={styles.priceRange}>{item.priceRange || 'View Details'}</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && 
         prevProps.isLeft === nextProps.isLeft;
});

const styles = StyleSheet.create({
  lookCard: {
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
  lookImage: {
    width: '100%',
    height: 240,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  lookInfo: {
    padding: 12,
  },
  lookTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  celebrity: {
    color: COLORS.accent,
    fontSize: 12,
    marginBottom: 4,
  },
  priceRange: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default BeautyCard;
