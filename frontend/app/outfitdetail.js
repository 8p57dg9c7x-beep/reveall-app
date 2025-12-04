import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function OutfitDetailScreen() {
  const params = useLocalSearchParams();
  const outfit = params.outfitData ? JSON.parse(params.outfitData) : null;
  const returnPath = params.returnPath || '/style'; // Default to Style tab

  if (!outfit) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <Text style={styles.errorText}>Outfit not found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Image source={{ uri: outfit.image }} style={styles.outfitImage} />

        <View style={styles.content}>
          <Text style={styles.title}>{outfit.title}</Text>
          <Text style={styles.category}>{outfit.category}</Text>

          {outfit.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{outfit.description}</Text>
            </View>
          )}

          {outfit.items && outfit.items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items in this Outfit</Text>
              {outfit.items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.price && <Text style={styles.itemPrice}>{item.price}</Text>}
                  {item.link && (
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => Linking.openURL(item.link)}
                    >
                      <MaterialCommunityIcons name="cart" size={16} color={COLORS.textPrimary} />
                      <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {outfit.budgetAlternatives && outfit.budgetAlternatives.length > 0 && (
            <View style={styles.section}>
              <View style={styles.budgetHeader}>
                <MaterialCommunityIcons name="tag" size={24} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Budget Alternatives</Text>
              </View>
              {outfit.budgetAlternatives.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.price && <Text style={styles.itemPrice}>{item.price}</Text>}
                  {item.link && (
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => Linking.openURL(item.link)}
                    >
                      <MaterialCommunityIcons name="cart" size={16} color={COLORS.textPrimary} />
                      <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
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
    paddingBottom: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitImage: {
    width: '100%',
    height: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: COLORS.accent,
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 12,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buyButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
