// BRICK UPDATE: New Beauty Detail Page Layout

import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRef, useEffect } from "react";

export default function BeautyDetail() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { lookData } = useLocalSearchParams();
  const look = JSON.parse(lookData);

  // Auto-scroll to top when opening a new beauty look
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [lookData]);

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

        {/* Products Section (if available) */}
        {look.products && look.products.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#FFFFFF", marginBottom: 10 }}>
              Products Used
            </Text>
            {look.products.map((product, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "#2A1A3D",
                }}
              >
                <Text style={{ color: "#CFCFCF", fontSize: 14, flex: 1 }}>
                  {product.name}
                </Text>
                <Text style={{ color: "#A390FF", fontSize: 14, fontWeight: "600" }}>
                  {product.price}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Shop Button (Affiliate placeholder) */}
        <TouchableOpacity
          style={{
            backgroundColor: "#A34CFF",
            padding: 15,
            borderRadius: 12,
            marginTop: 25,
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("webview", {
              url:
                look.affiliate_url ||
                "https://www.google.com/search?q=" + look.title + " makeup tutorial",
            });
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
            Shop Products
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
