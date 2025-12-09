// BRICK UPDATE: New Outfit Detail Page Layout

import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRef, useEffect } from "react";

export default function OutfitDetail() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { outfitData } = useLocalSearchParams();
  const outfit = JSON.parse(outfitData);

  // Auto-scroll to top when opening a new outfit
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [outfitData]);

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
    </ScrollView>
  );
}
