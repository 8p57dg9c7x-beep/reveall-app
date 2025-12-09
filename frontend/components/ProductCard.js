import React from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';
import AnimatedPressable from './AnimatedPressable';
import { COLORS } from '../constants/theme';

/**
 * ProductCard - Displays affiliate products with shop button
 * Handles affiliate links and Google search fallback
 */
const ProductCard = ({ product }) => {
  const handleShopPress = async () => {
    let url = product.affiliate_url;
    
    // Fallback to Google search if no affiliate link
    if (!url || url.trim() === '') {
      const searchQuery = encodeURIComponent(product.name);
      url = `https://www.google.com/search?q=${searchQuery}`;
    }
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the link');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Something went wrong opening the link');
    }
  };

  return (
    <AnimatedPressable style={styles.productCard} onPress={handleShopPress}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <OptimizedImage 
          source={{ uri: product.image_url }} 
          style={styles.productImage}
        />
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{product.price}</Text>
        
        {/* Shop Button */}
        <View style={styles.shopButton}>
          <MaterialCommunityIcons name="cart-outline" size={16} color="#FFFFFF" />
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: 140,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  shopButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProductCard;
