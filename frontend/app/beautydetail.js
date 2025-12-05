import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function BeautyDetailScreen() {
  const params = useLocalSearchParams();
  const look = params.lookData ? JSON.parse(params.lookData) : null;
  const returnPath = params.returnPath || '/beauty';

  if (!look) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <Text style={styles.errorText}>Look not found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace(returnPath)}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Image source={{ uri: look.image }} style={styles.lookImage} />

        <View style={styles.content}>
          <Text style={styles.celebrity}>{look.celebrity}</Text>
          <Text style={styles.title}>{look.title}</Text>
          <Text style={styles.category}>{look.category}</Text>

          {look.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Look</Text>
              <Text style={styles.description}>{look.description}</Text>
            </View>
          )}

          {look.products && look.products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Products Used</Text>
              {look.products.map((product, index) => (
                <View key={index} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <MaterialCommunityIcons name="circle-small" size={20} color={COLORS.primary} />
                    <Text style={styles.productType}>{product.type}</Text>
                  </View>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.price && <Text style={styles.productPrice}>{product.price}</Text>}
                </View>
              ))}
            </View>
          )}

          {look.budgetDupes && look.budgetDupes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.budgetHeader}>
                <MaterialCommunityIcons name="tag" size={24} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Budget-Friendly Dupes</Text>
              </View>
              <Text style={styles.budgetSubtitle}>Get the same look for less!</Text>
              {look.budgetDupes.map((product, index) => (
                <View key={index} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <MaterialCommunityIcons name="circle-small" size={20} color={COLORS.accent} />
                    <Text style={styles.productType}>{product.type}</Text>
                  </View>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.price && <Text style={styles.dupePrice}>{product.price}</Text>}
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
    paddingBottom: 120,
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
  lookImage: {
    width: '100%',
    height: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  celebrity: {
    fontSize: 16,
    color: COLORS.accent,
    marginBottom: 8,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productType: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  dupePrice: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
