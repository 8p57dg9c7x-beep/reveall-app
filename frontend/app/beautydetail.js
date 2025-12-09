// BRICK UPDATE: Beauty Detail Page with Similar Beauty Looks Section & Affiliate Products & Analytics & Deep Linking

import { View, Text, Image, ScrollView, TouchableOpacity, Share, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRef, useEffect, useState } from "react";
import * as Linking from 'expo-linking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProductCard from "../components/ProductCard";
import { trackBeautyView } from "../services/analytics";
import { API_BASE_URL } from '../config';

export default function BeautyDetail() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { lookData, id } = useLocalSearchParams();
  
  const [look, setLook] = useState(lookData ? JSON.parse(lookData) : null);
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
            setLook(data.look);
            trackBeautyView(data.look);
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
      
      // Track beauty view (only if not from deep link, already tracked above)
      if (!id) {
        trackBeautyView(look);
      }
    }
  }, [lookData]);

  // Fetch similar beauty looks from the same category
  useEffect(() => {
    const fetchSimilarLooks = async () => {
      if (!look.category) return;
      
      setLoadingSimilar(true);
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://category-navbar.preview.emergentagent.com';
        const response = await fetch(`${API_URL}/api/beauty/${look.category}`);
        const data = await response.json();
        
        // Filter out the current look and limit to 10 items
        const filtered = (data.looks || [])
          .filter(item => item.id !== look.id)
          .slice(0, 10);
        
        setSimilarLooks(filtered);
      } catch (error) {
        console.error('Error fetching similar beauty looks:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarLooks();
  }, [look.category, look.id]);

  const handleSimilarLookPress = (similarLook) => {
    router.push({
      pathname: '/beautydetail',
      params: { lookData: JSON.stringify(similarLook) }
    });
  };

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: "#0D001A" }}>

      {/* Hero Image */}
      <Image
        source={{ uri: look.image || look.image_url }}
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
          {look.title}
        </Text>

        {/* Category + Celebrity */}
        <Text style={{ fontSize: 16, marginVertical: 8, color: "#CFCFCF" }}>
          {look.category}
          {look.celebrity && ` • Inspired by ${look.celebrity}`}
        </Text>

        {/* Description (if available) */}
        {look.description && (
          <Text style={{ fontSize: 14, color: "#B8B8B8", marginTop: 10, lineHeight: 20 }}>
            {look.description}
          </Text>
        )}

      </View>

      {/* Shop The Look - Affiliate Products */}
      {look.products && look.products.length > 0 && (
        <View style={{ marginTop: 30, marginBottom: 10 }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: "bold", 
            color: "#FFFFFF",
            paddingHorizontal: 20,
            marginBottom: 15
          }}>
            💄 Shop The Look
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
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
        <View style={{ marginTop: 20, paddingBottom: 40 }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: "bold", 
            color: "#FFFFFF",
            paddingHorizontal: 20,
            marginBottom: 15
          }}>
            Similar Beauty Looks
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {similarLooks.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSimilarLookPress(item)}
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
                {item.celebrity && (
                  <Text style={{ color: "#A390FF", fontSize: 12, marginTop: 4 }}>
                    {item.celebrity}
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
