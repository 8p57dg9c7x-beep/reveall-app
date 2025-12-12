// BRICK 6: Beauty Detail Page - Polished with consistent back button, scrolling, and spacing

import { View, Text, Image, ScrollView, TouchableOpacity, Share, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRef, useEffect, useState } from "react";
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from "../components/ProductCard";
import { trackBeautyView } from "../services/analytics";
import { API_BASE_URL } from '../config';
import { asCardItem } from '../utils/helpers';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';

export default function BeautyDetail() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { lookData, id, returnPath } = useLocalSearchParams();
  const backPath = returnPath || '/beauty';
  
  const [look, setLook] = useState(lookData ? asCardItem(JSON.parse(lookData)) : null);
  const [loading, setLoading] = useState(!lookData && id ? true : false);
  const [similarLooks, setSimilarLooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

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

  // Auto-scroll to top when opening a new beauty look
  useEffect(() => {
    if (look) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      if (!id) {
        trackBeautyView(look);
      }
    }
  }, [lookData]);

  // Fetch similar beauty looks from the same category
  useEffect(() => {
    const fetchSimilarLooks = async () => {
      if (!look?.category) return;
      
      setLoadingSimilar(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/beauty/${look.category}`);
        const data = await response.json();
        
        const filtered = (data.looks || [])
          .filter(item => item.id !== look.id && item._id?.toString() !== look.id)
          .slice(0, 10)
          .map(asCardItem);
        
        setSimilarLooks(filtered);
      } catch (error) {
        console.error('Error fetching similar beauty looks:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarLooks();
  }, [look?.category, look?.id]);

  const handleBack = () => {
    router.push(backPath);
  };

  const handleSimilarLookPress = (similarLook) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(similarLook), returnPath: backPath }
    });
  };

  const handleShare = async () => {
    try {
      const deepLink = Linking.createURL(`/beautydetail`, {
        queryParams: { id: look.id }
      });
      
      const result = await Share.share({
        message: `Check out this ${look.title} beauty look on REVEAL! 💄\n\n${deepLink}`,
        title: look.title,
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Unable to share');
    }
  };

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
        {/* Hero Image with Share Button and Back Button */}
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
        </View>

        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>{look.title}</Text>

          {/* Category + Celebrity */}
          <Text style={styles.category}>
            {look.category}
            {look.celebrity && ` • Inspired by ${look.celebrity}`}
          </Text>

          {/* Description (if available) */}
          {look.description && (
            <Text style={styles.description}>{look.description}</Text>
          )}
        </View>

        {/* Shop The Look - Affiliate Products */}
        {look.products && look.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💄 Shop The Look</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            >
              {look.products.map((product, index) => (
                <ProductCard 
                  key={index} 
                  product={product} 
                  itemContext={{
                    item_id: look.id?.toString(),
                    item_title: look.title,
                    category: look.category
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Beauty Looks Section */}
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
                  {item.celebrity && (
                    <Text style={styles.similarCelebrity}>{item.celebrity}</Text>
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
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sectionTitleToContent,
    lineHeight: 22,
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
  similarCelebrity: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 4,
  },
});
