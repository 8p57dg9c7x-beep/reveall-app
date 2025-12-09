import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';
import { COLORS } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';
import AnimatedPressable from './AnimatedPressable';

const OutfitCard = memo(({ item, onPress, isLeft }) => {
  const { toggleOutfitFavorite, isOutfitFavorite } = useFavorites();
  const isFavorite = isOutfitFavorite(item.id);

  const handleFavoritePress = (e) => {
    console.log('❤️ OutfitCard: Heart button pressed!');
    console.log('  Item ID:', item.id);
    console.log('  Item Title:', item.title);
    console.log('  Current favorite status:', isFavorite);
    e.stopPropagation();
    toggleOutfitFavorite(item);
  };

  return (
    <AnimatedPressable
      style={[styles.outfitCard, isLeft ? styles.cardLeft : styles.cardRight]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <OptimizedImage source={{ uri: item.image_url || item.image }} style={styles.outfitImage} />
        
        {/* Favorite Heart Button */}
        <AnimatedPressable 
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          scaleValue={0.85}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#ff4444' : '#fff'}
          />
        </AnimatedPressable>
        
        {item.gender && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.gender}</Text>
          </View>
        )}
      </View>
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.outfitPrice}>{item.priceRange || 'View Details'}</Text>
      </View>
    </AnimatedPressable>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && 
         prevProps.isLeft === nextProps.isLeft;
});

const styles = StyleSheet.create({
  outfitCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 310,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outfitInfo: {
    padding: 14,
    gap: 4,
  },
  outfitTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 2,
  },
  outfitPrice: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default OutfitCard;
