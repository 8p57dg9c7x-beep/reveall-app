import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';
import { COLORS, GRADIENTS, SIZES, CARD_SHADOW, SPACING } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';
import { asCardItem } from '../utils/helpers';

const BeautyCard = memo(({ item, onPress, isLeft }) => {
  const { toggleBeautyFavorite, isBeautyFavorite } = useFavorites();
  
  // Early return if item is invalid
  if (!item) {
    return null;
  }
  
  // Normalize the card with fallback
  const card = asCardItem(item) || {};
  const cardId = card.id || card._id || `temp-${Date.now()}`;
  const isFavorite = cardId ? isBeautyFavorite(cardId) : false;

  const handleFavoritePress = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (card && cardId) {
      toggleBeautyFavorite({ ...card, id: cardId });
    }
  };

  const handleTryOn = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    // TODO: Navigate to try-on feature when implemented
    alert('Try On feature coming soon!');
  };

  return (
    <TouchableOpacity
      style={[styles.lookCard, isLeft ? styles.cardLeft : styles.cardRight]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <OptimizedImage source={{ uri: card.imageToUse }} style={styles.lookImage} />
        <View style={styles.gradientOverlay} />
        
        {/* Favorite Heart Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#ff4444' : '#fff'}
          />
        </TouchableOpacity>
        
        {item.category && (
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="sparkles" size={10} color="#fff" />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}

        {/* Try On Button */}
        <TouchableOpacity
          style={styles.tryOnButton}
          onPress={handleTryOn}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={GRADIENTS.chip}
            style={styles.tryOnGradient}
          >
            <MaterialCommunityIcons name="camera" size={14} color="#fff" />
            <Text style={styles.tryOnText}>Try On</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginBottom: SPACING.cardGap,
    height: 320,
    ...CARD_SHADOW,
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
  tryOnButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  tryOnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.borderRadiusPill,
    gap: 6,
  },
  tryOnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  lookInfo: {
    padding: SPACING.cardPadding,
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
