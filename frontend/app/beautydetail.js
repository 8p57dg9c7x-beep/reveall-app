// Beauty Detail Page - v1 with Shop The Look Affiliate Flow
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Share, Alert, StyleSheet, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackBeautyView } from "../services/analytics";
import { API_BASE_URL } from '../config';
import { asCardItem } from '../utils/helpers';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { ShopProductListItem, ShopThisLookButton } from '../components/ShopProduct';
import { logEvent } from '../services/firebase';

// Mock product data for beauty looks
const generateMockBeautyProducts = (look) => {
  const productTypes = ['Foundation', 'Lipstick', 'Eyeshadow', 'Mascara', 'Blush'];
  const brands = ['Fenty Beauty', 'MAC', 'Charlotte Tilbury', 'NARS', 'Urban Decay', 'Too Faced', 'Rare Beauty'];
  
  return productTypes.slice(0, 3 + Math.floor(Math.random() * 2)).map((type, index) => ({
    id: `${look?.id || 'mock'}-${index}`,
    type,
    name: `${type === 'Foundation' ? 'Pro Filt\'r' : type === 'Lipstick' ? 'Matte' : type === 'Eyeshadow' ? 'Palette' : 'Volume'} ${type}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    price: `$${Math.floor(Math.random() * 45) + 15}`,
    shade: ['Rose', 'Nude', 'Berry', 'Coral', 'Bronze'][Math.floor(Math.random() * 5)],
    affiliateUrl: null,
  }));
};

export default function BeautyDetail() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { lookData, id, returnPath } = useLocalSearchParams();
  const backPath = returnPath || '/beauty';
  
  const [look, setLook] = useState(lookData ? asCardItem(JSON.parse(lookData)) : null);
  const [loading, setLoading] = useState(!lookData && id ? true : false);
  const [products, setProducts] = useState([]);
  const [similarLooks, setSimilarLooks] = useState([]);

  // Initialize products when look loads
  useEffect(() => {
    if (look) {
      const beautyProducts = look.products && look.products.length > 0 
        ? look.products 
        : generateMockBeautyProducts(look);
      setProducts(beautyProducts);
    }
  }, [look]);

  // Fetch beauty look by ID if coming from deep link
  useEffect(() => {
    const fetchBeautyById = async () => {
      if (id && !look) {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/beauty/id/${id}`);
          const data = await response.json();
          
          if (data.success) {
            const normalizedLook = asCardItem(data.look);
            setLook(normalizedLook);
            trackBeautyView(normalizedLook);
          } else {
            Alert.alert('Error', 'Beauty look not found');
            router.back();
          }
        } catch (error) {
          console.error('Error fetching beauty look:', error);
          Alert.alert('Error', 'Unable to load beauty look');
          router.back();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBeautyById();
  }, [id]);

  // Auto-scroll to top when opening a new look
  useEffect(() => {
    if (look) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      if (!id) {
        trackBeautyView(look);
      }
    }
  }, [lookData]);

  // Fetch similar looks
  useEffect(() => {
    const fetchSimilarLooks = async () => {
      if (!look?.category) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/beauty/${look.category}`);
        const data = await response.json();
        
        const filtered = (data.looks || [])
          .filter(item => item.id !== look.id && item._id?.toString() !== look.id)
          .slice(0, 6)
          .map(asCardItem);
        
        setSimilarLooks(filtered);
      } catch (error) {
        console.error('Error fetching similar looks:', error);
      }
    };

    fetchSimilarLooks();
  }, [look?.category, look?.id]);

  const handleBack = () => {
    router.push(backPath);
  };

  const handleShare = async () => {
    try {
      await logEvent('beauty_shared', { look_id: look?.id, look_title: look?.title });
      
      const result = await Share.share({
        message: `Check out this ${look.title} beauty look on REVEAL! 💄`,
        title: look.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSimilarLookPress = (similarLook) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(similarLook), returnPath: backPath }
    });
  };

  // Calculate total price
  const totalPrice = products.length > 0 
    ? `$${products.reduce((sum, p) => sum + parseInt(p.price?.replace('$', '') || 0), 0)}`
    : null;

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="shimmer" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading beauty look...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!look) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.loadingText}>Beauty look not found</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        ref={scrollRef} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: look.imageToUse }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, { top: insets.top + 10 }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareButton, { top: insets.top + 10 }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="share-variant" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Celebrity Badge */}
          {look.celebrity && (
            <View style={styles.celebrityBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.celebrityBadgeText}>{look.celebrity}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title & Meta */}
          <Text style={styles.title}>{look.title}</Text>
          <Text style={styles.category}>
            {look.category}
            {look.celebrity && ` • Inspired by ${look.celebrity}`}
          </Text>
          
          {/* Description */}
          {look.description && (
            <Text style={styles.description}>{look.description}</Text>
          )}

          {/* Shop This Look Section */}
          <View style={styles.shopSection}>
            <View style={styles.shopHeader}>
              <MaterialCommunityIcons name="lipstick" size={20} color="#FF6EC7" />
              <Text style={styles.shopTitle}>Get The Products</Text>
            </View>
            
            {/* Product List */}
            <View style={styles.productList}>
              {products.map((product, index) => (
                <ShopProductListItem
                  key={product.id || index}
                  product={product}
                  context={{ screen: 'beautydetail', itemTitle: look.title }}
                />
              ))}
            </View>
            
            {/* Shop All Button */}
            <ShopThisLookButton
              products={products}
              totalPrice={totalPrice}
              context={{ screen: 'beautydetail', itemTitle: look.title }}
              style={styles.shopAllButton}
            />
          </View>

          {/* Beauty Tip */}
          <View style={styles.beautyTip}>
            <MaterialCommunityIcons name="lightbulb" size={18} color="#FF6EC7" />
            <Text style={styles.beautyTipText}>
              Beauty tip: Start with a primer for longer-lasting results and blend well for a seamless finish!
            </Text>
          </View>
        </View>

        {/* Similar Looks */}
        {similarLooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Beauty Looks</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScroll}
            >
              {similarLooks.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSimilarLookPress(item)}
                  style={styles.similarCard}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: item.imageToUse }}
                    style={styles.similarImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.similarOverlay}
                  >
                    <Text style={styles.similarTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.celebrity && (
                      <Text style={styles.similarCelebrity}>{item.celebrity}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.bottomPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    marginTop: 16,
  },
  // Hero
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 420,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.screenHorizontal,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    right: SPACING.screenHorizontal,
    backgroundColor: '#FF6EC7',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  celebrityBadge: {
    position: 'absolute',
    bottom: 20,
    right: SPACING.screenHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  celebrityBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Content
  contentContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.contentPaddingTop,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  category: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sectionTitleToContent,
    lineHeight: 22,
  },
  // Shop Section
  shopSection: {
    marginTop: SPACING.sectionGap,
    backgroundColor: 'rgba(255, 110, 199, 0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 199, 0.15)',
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  shopTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  productList: {
    marginBottom: 16,
  },
  shopAllButton: {
    marginTop: 4,
  },
  // Beauty Tip
  beautyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: SPACING.sectionGap,
    padding: 16,
    backgroundColor: 'rgba(255, 110, 199, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 199, 0.2)',
  },
  beautyTipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Section
  section: {
    marginTop: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionTitleToContent,
  },
  similarScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  similarCard: {
    width: 150,
    height: 200,
    marginRight: SPACING.cardHorizontalGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  similarImage: {
    width: '100%',
    height: '100%',
  },
  similarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  similarTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  similarCelebrity: {
    color: '#FF6EC7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
