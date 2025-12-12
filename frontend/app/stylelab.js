import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';

// Style Lab - All AI Style Features Hub
export default function StyleLabScreen() {
  const insets = useSafeAreaInsets();

  // Feature cards data with returnPath for each
  const features = useMemo(() => [
    {
      id: 'outfit-identifier',
      title: 'Outfit Identifier',
      subtitle: 'Scan & identify any outfit',
      icon: 'camera-iris',
      color: '#FF6B6B',
      route: '/comingsoon',
      params: { returnPath: '/stylelab' },
      badge: 'Coming Soon',
    },
    {
      id: 'ai-stylist',
      title: 'AI Stylist',
      subtitle: 'Get personalized look recommendations',
      icon: 'robot',
      color: '#B14CFF',
      route: '/aistylist',
      params: { returnPath: '/stylelab' },
    },
    {
      id: 'ai-wardrobe',
      title: 'AI Wardrobe',
      subtitle: 'Organize & manage your closet',
      icon: 'hanger',
      color: '#4ECDC4',
      route: '/aiwardrobe',
      params: { returnPath: '/stylelab' },
    },
    {
      id: 'body-scanner',
      title: 'Body Scanner',
      subtitle: 'Get accurate measurements',
      icon: 'human',
      color: '#95E1D3',
      route: '/bodyscanner',
      params: { returnPath: '/stylelab' },
    },
    {
      id: 'style-dna',
      title: 'Style DNA',
      subtitle: 'Discover your unique style profile',
      icon: 'dna',
      color: '#FF6EC7',
      route: '/addilets',
      params: { returnPath: '/stylelab' },
    },
    {
      id: 'browse-styles',
      title: 'Browse Styles',
      subtitle: 'Explore trending outfits',
      icon: 'view-grid',
      color: '#FFD93D',
      route: '/style',
      params: { returnPath: '/stylelab' },
    },
  ], []);

  const renderFeatureCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => router.push({ pathname: item.route, params: item.params })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${item.color}20`, `${item.color}05`]}
        style={styles.featureGradient}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}30` }]}>
          <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
        </View>
        <View style={styles.featureContent}>
          <View style={styles.featureTitleRow}>
            <Text style={styles.featureTitle}>{item.title}</Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: insets.top + SPACING.topPadding }}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="flask" size={40} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Style Lab</Text>
        <Text style={styles.headerSubtitle}>AI-powered tools for your perfect look</Text>
      </View>
    </View>
  ), [insets.top]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={features}
        renderItem={renderFeatureCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={6}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.bottomPadding,
  },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.sectionGap,
    paddingHorizontal: SPACING.screenHorizontal,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
    textAlign: 'center',
  },
  featureCard: {
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.cardGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  featureSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
