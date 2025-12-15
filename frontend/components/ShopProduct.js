// Shop Product Card Component - Simple affiliate-ready product display
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { logEvent } from '../services/firebase';

// Track affiliate click for analytics
const trackAffiliateClick = async (product, context) => {
  try {
    await logEvent('affiliate_click', {
      product_name: product.name,
      product_brand: product.brand,
      product_price: product.price,
      product_type: product.type,
      source_screen: context?.screen || 'unknown',
      source_item: context?.itemTitle || 'unknown',
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Open affiliate link
const openAffiliateLink = async (product, context) => {
  // Track the click
  await trackAffiliateClick(product, context);
  
  // Get the affiliate URL (mock for now, will be real URLs later)
  const url = product.affiliateUrl || product.url || generateMockAffiliateUrl(product);
  
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Unable to Open', 'Could not open the shopping link. Please try again.');
    }
  } catch (error) {
    console.error('Error opening affiliate link:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};

// Generate mock affiliate URL for testing
const generateMockAffiliateUrl = (product) => {
  const searchQuery = encodeURIComponent(`${product.brand} ${product.name}`);
  // Using Google Shopping as mock destination - will be replaced with real affiliate links
  return `https://www.google.com/search?tbm=shop&q=${searchQuery}`;
};

// Compact product card for horizontal scroll
export function ShopProductCard({ product, context, style }) {
  return (
    <TouchableOpacity
      style={[styles.compactCard, style]}
      onPress={() => openAffiliateLink(product, context)}
      activeOpacity={0.85}
    >
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.compactImage} />
      ) : (
        <View style={styles.compactImagePlaceholder}>
          <MaterialCommunityIcons name="image-off" size={24} color={COLORS.textMuted} />
        </View>
      )}
      
      <View style={styles.compactContent}>
        <Text style={styles.compactBrand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.compactName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.compactFooter}>
          <Text style={styles.compactPrice}>{product.price}</Text>
          <View style={styles.shopBadge}>
            <Text style={styles.shopBadgeText}>Shop</Text>
            <MaterialCommunityIcons name="open-in-new" size={10} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// List item product card for vertical lists
export function ShopProductListItem({ product, context, style }) {
  return (
    <TouchableOpacity
      style={[styles.listItem, style]}
      onPress={() => openAffiliateLink(product, context)}
      activeOpacity={0.85}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.listItemTypeTag}>
          <Text style={styles.listItemType}>{product.type}</Text>
        </View>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.listItemBrand}>{product.brand}</Text>
        </View>
      </View>
      
      <View style={styles.listItemRight}>
        <Text style={styles.listItemPrice}>{product.price}</Text>
        <View style={styles.listItemShopButton}>
          <MaterialCommunityIcons name="shopping" size={14} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Full "Shop This Look" button
export function ShopThisLookButton({ products, totalPrice, context, style }) {
  const handleShopAll = async () => {
    // Track the "Shop All" click
    try {
      await logEvent('shop_this_look_click', {
        total_price: totalPrice,
        product_count: products?.length || 0,
        source_screen: context?.screen || 'unknown',
        source_item: context?.itemTitle || 'unknown',
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
    
    // For v1, open the first product link or a combined search
    if (products && products.length > 0) {
      openAffiliateLink(products[0], context);
    } else {
      Alert.alert('Coming Soon', 'Full shopping experience coming in the next update!');
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.shopAllButton, style]}
      onPress={handleShopAll}
      activeOpacity={0.85}
    >
      <View style={styles.shopAllContent}>
        <MaterialCommunityIcons name="shopping" size={20} color="#FFFFFF" />
        <Text style={styles.shopAllText}>Shop This Look</Text>
      </View>
      {totalPrice && (
        <Text style={styles.shopAllPrice}>{totalPrice}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact Card Styles
  compactCard: {
    width: 140,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginRight: SPACING.cardHorizontalGap,
    ...CARD_SHADOW,
  },
  compactImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.cardLight,
  },
  compactImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    padding: 10,
  },
  compactBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  shopBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // List Item Styles
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.1)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemTypeTag: {
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  listItemType: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listItemBrand: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listItemShopButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Shop All Button Styles
  shopAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    ...CARD_SHADOW,
  },
  shopAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shopAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopAllPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default {
  ShopProductCard,
  ShopProductListItem,
  ShopThisLookButton,
  openAffiliateLink,
  trackAffiliateClick,
};
