// BRICK 6: Outfit Detail Page - Polished with consistent back button, scrolling, and spacing

import { View, Text, Image, ScrollView, TouchableOpacity, Share, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRef, useEffect, useState } from "react";
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from "../components/ProductCard";
import { trackOutfitView } from "../services/analytics";
import { API_BASE_URL } from '../config';
import { asCardItem } from '../utils/helpers';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';

export default function OutfitDetail() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { outfitData, id, returnPath } = useLocalSearchParams();
  const backPath = returnPath || '/style';
  
  const [outfit, setOutfit] = useState(outfitData ? asCardItem(JSON.parse(outfitData)) : null);
  const [loading, setLoading] = useState(!outfitData && id ? true : false);
  const [similarOutfits, setSimilarOutfits] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Fetch outfit by ID if coming from deep link
  useEffect(() => {
    const fetchOutfitById = async () => {
      if (id && !outfit) {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/outfits/id/${id}`);
          const data = await response.json();
          
          if (data.success) {
            const normalizedOutfit = asCardItem(data.outfit);
            setOutfit(normalizedOutfit);
            trackOutfitView(normalizedOutfit);
          } else {
            Alert.alert('Error', 'Outfit not found');
            router.back();
          }
        } catch (error) {
          console.error('Error fetching outfit:', error);
          Alert.alert('Error', 'Unable to load outfit');
          router.back();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOutfitById();
  }, [id]);

  // Auto-scroll to top when opening a new outfit
  useEffect(() => {
    if (outfit) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      if (!id) {
        trackOutfitView(outfit);
      }
    }
  }, [outfitData]);

  // Fetch similar outfits from the same category
  useEffect(() => {
    const fetchSimilarOutfits = async () => {
      if (!outfit?.category) return;
      
      setLoadingSimilar(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/outfits/${outfit.category}`);
        const data = await response.json();
        
        const filtered = (data.outfits || [])
          .filter(item => item.id !== outfit.id && item._id?.toString() !== outfit.id)
          .slice(0, 10)
          .map(asCardItem);
        
        setSimilarOutfits(filtered);
      } catch (error) {
        console.error('Error fetching similar outfits:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarOutfits();
  }, [outfit?.category, outfit?.id]);

  const handleBack = () => {
    router.push(backPath);
  };

  const handleSimilarOutfitPress = (similarOutfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(similarOutfit), returnPath: backPath }
    });
  };

  const handleShare = async () => {
    try {
      const deepLink = Linking.createURL(`/outfitdetail`, {
        queryParams: { id: outfit.id }
      });
      
      const result = await Share.share({
        message: `Check out this ${outfit.title} outfit on REVEAL! 🔥\n\n${deepLink}`,
        title: outfit.title,
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Unable to share');
    }
  };

  const handleShopPress = () => {
    Alert.alert(
      'Shop This Look',
      'Opening shopping link...',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="shimmer" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading outfit...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!outfit) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.loadingText}>Outfit not found</Text>
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
        {/* Hero Image with Share Button and Back Button */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: outfit.imageToUse }}
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
        </View>

        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>{outfit.title}</Text>

          {/* Category + Gender */}
          <Text style={styles.category}>
            {outfit.category} • {outfit.gender?.toUpperCase()}
          </Text>

          {/* Price Range */}
          <Text style={styles.price}>
            {outfit.price_range || "Price unavailable"}
          </Text>

          {/* Shop Button */}
          <TouchableOpacity
            style={styles.shopButton}
            onPress={handleShopPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="shopping" size={20} color="#FFFFFF" />
            <Text style={styles.shopButtonText}>Shop This Look</Text>
          </TouchableOpacity>
        </View>

        {/* Shop The Look - Affiliate Products */}
        {outfit.products && outfit.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Shop The Look</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            >
              {outfit.products.map((product, index) => (
                <ProductCard 
                  key={index} 
                  product={product} 
                  itemContext={{
                    item_id: outfit.id?.toString(),
                    item_title: outfit.title,
                    category: outfit.category
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Styles Section */}
        {similarOutfits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Styles</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScroll}
            >
              {similarOutfits.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSimilarOutfitPress(item)}
                  style={styles.similarCard}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.imageToUse }}
                    style={styles.similarImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.similarTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.price_range && (
                    <Text style={styles.similarPrice}>{item.price_range}</Text>
                  )}
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
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 400,
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
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  contentContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.contentPaddingTop,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  category: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
  },
  price: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sectionTitleToContent,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadiusButton,
    marginTop: SPACING.cardGap,
    gap: 8,
    ...CARD_SHADOW,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginTop: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionTitleToContent,
  },
  productsScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  similarScroll: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  similarCard: {
    marginRight: SPACING.cardHorizontalGap,
    width: 160,
  },
  similarImage: {
    width: 160,
    height: 200,
    borderRadius: SIZES.borderRadiusCard,
    backgroundColor: COLORS.card,
  },
  similarTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.titleToSubtitle,
  },
  similarPrice: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 4,
  },
});
