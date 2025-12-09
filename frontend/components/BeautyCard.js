import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';
import { COLORS } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';
import AnimatedPressable from './AnimatedPressable';

const BeautyCard = memo(({ item, onPress, isLeft }) => {
  const { toggleBeautyFavorite, isBeautyFavorite } = useFavorites();
  const isFavorite = isBeautyFavorite(item.id);

  const handleFavoritePress = (e) => {
    e.stopPropagation();
    toggleBeautyFavorite(item);
  };

  return (
    <AnimatedPressable
      style={[styles.lookCard, isLeft ? styles.cardLeft : styles.cardRight]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <OptimizedImage source={{ uri: item.image }} style={styles.lookImage} />
        <View style={styles.gradientOverlay} />
        
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
        
        {item.category && (
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="sparkles" size={10} color="#fff" />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.lookInfo}>
        <Text style={styles.lookTitle} numberOfLines={2}>{item.title}</Text>
        {item.celebrity && (
          <View style={styles.celebrityRow}>
            <MaterialCommunityIcons name="star-outline" size={14} color={COLORS.accent} />
            <Text style={styles.celebrity} numberOfLines={1}>{item.celebrity}</Text>
          </View>
        )}
        <Text style={styles.priceRange}>{item.priceRange || 'View Details'}</Text>
      </View>
    </AnimatedPressable>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && 
         prevProps.isLeft === nextProps.isLeft;
});

const styles = StyleSheet.create({
  lookCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 320,
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
  lookImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  lookInfo: {
    padding: 14,
    gap: 6,
  },
  lookTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  celebrityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  celebrity: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  priceRange: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BeautyCard;
