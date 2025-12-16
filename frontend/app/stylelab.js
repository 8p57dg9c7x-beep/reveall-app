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
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { FEATURE_FLAGS } from '../config/featureFlags';

// Style Lab - AI Style Tools Hub (v1 Focus: Core AI Features)
export default function StyleLabScreen() {
  const insets = useSafeAreaInsets();

  // Feature cards data - filtered by feature flags
  const features = useMemo(() => {
    const allFeatures = [
      {
        id: 'ai-stylist',
        title: 'AI Stylist',
        subtitle: 'Get personalized outfit recommendations',
        icon: 'robot',
        color: '#B14CFF',
        route: '/aistylist',
        params: { returnPath: '/stylelab' },
        enabled: FEATURE_FLAGS.AI_STYLIST,
        highlight: true,  // v1 core feature
      },
      {
        id: 'body-scanner',
        title: 'Body Scanner',
        subtitle: 'Get accurate size & fit recommendations',
        icon: 'human',
        color: '#95E1D3',
        route: '/bodyscanner',
        params: { returnPath: '/stylelab' },
        enabled: FEATURE_FLAGS.BODY_SCANNER,
      },
      {
        id: 'ai-wardrobe',
        title: 'Closet Manager',
        subtitle: 'Organize & manage your wardrobe',
        icon: 'hanger',
        color: '#4ECDC4',
        route: '/aiwardrobe',
        params: { returnPath: '/stylelab' },
        enabled: FEATURE_FLAGS.AI_WARDROBE,
      },
      {
        id: 'browse-styles',
        title: 'Browse Styles',
        subtitle: 'Explore trending outfits & shop',
        icon: 'view-grid',
        color: '#FFD93D',
        route: '/style',
        params: { returnPath: '/stylelab' },
        enabled: FEATURE_FLAGS.STYLE_DISCOVERY,
      },
      // Hidden for v1
      {
        id: 'style-dna',
        title: 'Style DNA',
        subtitle: 'Discover your unique style profile',
        icon: 'dna',
        color: '#FF6EC7',
        route: '/addilets',
        params: { returnPath: '/stylelab' },
        enabled: FEATURE_FLAGS.ADDILETS,  // Hidden for v1
      },
      {
        id: 'outfit-identifier',
        title: 'Outfit Identifier',
        subtitle: 'Scan & identify any outfit',
        icon: 'camera-iris',
        color: '#FF6B6B',
        route: '/comingsoon',
        params: { returnPath: '/stylelab' },
        badge: 'Coming Soon',
        enabled: false,  // Coming soon
      },
    ];
    
    return allFeatures.filter(feature => feature.enabled);
  }, []);

  const renderFeatureCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.featureCard, item.highlight && styles.highlightCard]}
      onPress={() => router.push({ pathname: item.route, params: item.params })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.highlight 
          ? [COLORS.primary, '#8B5CF6']
          : [`${item.color}20`, `${item.color}05`]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureGradient}
      >
        <View style={[
          styles.iconContainer, 
          { backgroundColor: item.highlight ? 'rgba(255,255,255,0.2)' : `${item.color}30` }
        ]}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={32} 
            color={item.highlight ? '#FFFFFF' : item.color} 
          />
        </View>
        <View style={styles.featureContent}>
          <View style={styles.featureTitleRow}>
            <Text style={[
              styles.featureTitle, 
              item.highlight && styles.highlightTitle
            ]}>
              {item.title}
            </Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.featureSubtitle,
            item.highlight && styles.highlightSubtitle
          ]}>
            {item.subtitle}
          </Text>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={item.highlight ? 'rgba(255,255,255,0.8)' : COLORS.textSecondary} 
        />
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
    paddingBottom: SPACING.cardGap,
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
  shopCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.sectionGap,
    padding: 16,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  shopCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopCTAText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  featureCard: {
    marginHorizontal: SPACING.screenHorizontal,
    marginBottom: SPACING.cardGap,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  highlightCard: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.cardPadding + 4,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.15)',
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
  highlightTitle: {
    color: '#FFFFFF',
  },
  featureSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
  },
  highlightSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
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
