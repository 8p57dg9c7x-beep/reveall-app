// Outfit Detail Page - v1 Inspiration Only (Shop hidden)
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Share, Alert, StyleSheet, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackOutfitView } from "../services/analytics";
import { API_BASE_URL } from '../config';
import { asCardItem } from '../utils/helpers';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { logEvent } from '../services/firebase';

export default function OutfitDetail() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { outfitData, id, returnPath } = useLocalSearchParams();
  const backPath = returnPath || '/style';
  
  const [outfit, setOutfit] = useState(outfitData ? asCardItem(JSON.parse(outfitData)) : null);
  const [loading, setLoading] = useState(!outfitData && id ? true : false);
  const [similarOutfits, setSimilarOutfits] = useState([]);
  }, [outfit]);

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

  // Fetch similar outfits
  useEffect(() => {
    const fetchSimilarOutfits = async () => {
      if (!outfit?.category) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/outfits/${outfit.category}`);
        const data = await response.json();
        
        const filtered = (data.outfits || [])
          .filter(item => item.id !== outfit.id && item._id?.toString() !== outfit.id)
          .slice(0, 6)
          .map(asCardItem);
        
        setSimilarOutfits(filtered);
      } catch (error) {
        console.error('Error fetching similar outfits:', error);
      }
    };

    fetchSimilarOutfits();
  }, [outfit?.category, outfit?.id]);

  const handleBack = () => {
    router.push(backPath);
  };

  const handleShare = async () => {
    try {
      await logEvent('outfit_shared', { outfit_id: outfit?.id, outfit_title: outfit?.title });
      
      const result = await Share.share({
        message: `Check out this ${outfit.title} outfit on REVEAL! 🔥`,
        title: outfit.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSimilarOutfitPress = (similarOutfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(similarOutfit), returnPath: backPath }
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
        {/* Hero Image */}
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
          
          {/* Price Badge */}
          {outfit.price_range && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>{outfit.price_range}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title & Meta */}
          <Text style={styles.title}>{outfit.title}</Text>
          <Text style={styles.category}>
            {outfit.category} • {outfit.gender?.toUpperCase()}
          </Text>

          {/* Stylist Tip - v1 Focus: Inspiration */}
          <View style={styles.stylistTip}>
            <MaterialCommunityIcons name="lightbulb" size={18} color="#FFD93D" />
            <Text style={styles.stylistTipText}>
              Pro tip: Mix and match pieces from this look with your existing wardrobe for endless outfit combinations!
            </Text>
          </View>

          {/* Save to Favorites CTA */}
          <TouchableOpacity style={styles.saveCTA} activeOpacity={0.85}>
            <MaterialCommunityIcons name="heart-outline" size={22} color={COLORS.primary} />
            <Text style={styles.saveCTAText}>Save to Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Similar Styles */}
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
                    {item.price_range && (
                      <Text style={styles.similarPrice}>{item.price_range}</Text>
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
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 20,
    right: SPACING.screenHorizontal,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  // Shop Section
  shopSection: {
    marginTop: SPACING.sectionGap,
    backgroundColor: 'rgba(177, 76, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
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
  // Stylist Tip
  stylistTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: SPACING.sectionGap,
    padding: 16,
    backgroundColor: 'rgba(255, 217, 61, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.2)',
  },
  stylistTipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Save CTA
  saveCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: SPACING.sectionGap,
    padding: 16,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  saveCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
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
  similarPrice: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
