// BRICK UPDATE: Outfit Detail Page with Similar Styles Section & Affiliate Products & Analytics & Deep Linking

import { View, Text, Image, ScrollView, TouchableOpacity, Share, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRef, useEffect, useState } from "react";
import * as Linking from 'expo-linking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProductCard from "../components/ProductCard";
import { trackOutfitView } from "../services/analytics";
import { API_BASE_URL } from '../config';

export default function OutfitDetail() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { outfitData, id } = useLocalSearchParams();
  
  const [outfit, setOutfit] = useState(outfitData ? JSON.parse(outfitData) : null);
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
            setOutfit(data.outfit);
            trackOutfitView(data.outfit);
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
      
      // Track outfit view (only if not from deep link, already tracked above)
      if (!id) {
        trackOutfitView(outfit);
      }
    }
  }, [outfitData]);

  // Fetch similar outfits from the same category
  useEffect(() => {
    const fetchSimilarOutfits = async () => {
      if (!outfit.category) return;
      
      setLoadingSimilar(true);
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://category-navbar.preview.emergentagent.com';
        const response = await fetch(`${API_URL}/api/outfits/${outfit.category}`);
        const data = await response.json();
        
        // Filter out the current outfit and limit to 10 items
        const filtered = (data.outfits || [])
          .filter(item => item.id !== outfit.id)
          .slice(0, 10);
        
        setSimilarOutfits(filtered);
      } catch (error) {
        console.error('Error fetching similar outfits:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarOutfits();
  }, [outfit.category, outfit.id]);

  const handleSimilarOutfitPress = (similarOutfit) => {
    router.push({
      pathname: '/outfitdetail',
      params: { outfitData: JSON.stringify(similarOutfit) }
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0D001A", justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Loading outfit...</Text>
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0D001A", justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Outfit not found</Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: "#0D001A" }}>

      {/* Hero Image */}
      <Image
        source={{ uri: outfit.image || outfit.image_url }}
        style={{
          width: "100%",
          height: 400,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
        resizeMode="cover"
      />

      <View style={{ padding: 20 }}>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>
          {outfit.title}
        </Text>

        {/* Category + Gender */}
        <Text style={{ fontSize: 16, marginVertical: 8, color: "#CFCFCF" }}>
          {outfit.category} • {outfit.gender?.toUpperCase()}
        </Text>

        {/* Price Range */}
        <Text style={{ fontSize: 18, color: "#A390FF", marginBottom: 15 }}>
          {outfit.price_range || "Price unavailable"}
        </Text>

        {/* Shop Button (Affiliate placeholder) */}
        <TouchableOpacity
          style={{
            backgroundColor: "#A34CFF",
            padding: 15,
            borderRadius: 12,
            marginTop: 10,
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("webview", {
              url:
                outfit.affiliate_url ||
                "https://www.google.com/search?q=" + outfit.title + " outfit",
            });
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
            Shop This Look
          </Text>
        </TouchableOpacity>

      </View>

      {/* Shop The Look - Affiliate Products */}
      {outfit.products && outfit.products.length > 0 && (
        <View style={{ marginTop: 30, marginBottom: 10 }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: "bold", 
            color: "#FFFFFF",
            paddingHorizontal: 20,
            marginBottom: 15
          }}>
            🛍️ Shop The Look
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
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
        <View style={{ marginTop: 20, paddingBottom: 40 }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: "bold", 
            color: "#FFFFFF",
            paddingHorizontal: 20,
            marginBottom: 15
          }}>
            Similar Styles
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {similarOutfits.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSimilarOutfitPress(item)}
                style={{
                  marginRight: 15,
                  width: 160,
                }}
              >
                <Image
                  source={{ uri: item.image || item.image_url }}
                  style={{
                    width: 160,
                    height: 200,
                    borderRadius: 16,
                    backgroundColor: "#1A0D2E",
                  }}
                  resizeMode="cover"
                />
                <Text 
                  style={{ 
                    color: "#FFFFFF", 
                    fontSize: 14, 
                    marginTop: 8,
                    fontWeight: "500"
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                {item.price_range && (
                  <Text style={{ color: "#A390FF", fontSize: 12, marginTop: 4 }}>
                    {item.price_range}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

    </ScrollView>
  );
}
