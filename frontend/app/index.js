import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../constants/theme';
import GradientButton from '../components/GradientButton';

// Fixed heights for getItemLayout optimization
const HORIZONTAL_CARD_WIDTH = 140;

export default function HomeScreen() {
  const { personalization } = useAddilets();

  // Quick action buttons - memoized
  const quickActions = useMemo(() => [
    { id: 'ai-stylist', label: 'AI Stylist', icon: 'robot', route: '/aistylist', color: '#B14CFF' },
    { id: 'style-lab', label: 'Style Lab', icon: 'flask', route: '/stylelab', color: '#4ECDC4' },
    { id: 'body-scanner', label: 'Body Scan', icon: 'human', route: '/bodyscanner', color: '#95E1D3' },
    { id: 'style-dna', label: 'Style DNA', icon: 'dna', route: '/addilets', color: '#FF6EC7' },
  ], []);

  // Trending styles data
  const trendingStyles = useMemo(() => [
    { id: 1, title: 'Street Style', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80' },
    { id: 2, title: 'Minimalist', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80' },
    { id: 3, title: 'Casual Chic', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80' },
    { id: 4, title: 'Athleisure', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80' },
  ], []);

  // Render functions
  const renderQuickAction = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionButton}
      onPress={() => router.push(action.route)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${action.color}30`, `${action.color}10`]}
        style={styles.quickActionGradient}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}40` }]}>
          <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
        </View>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const renderStyleCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.styleCard}
      onPress={() => router.push('/style')}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.styleImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.styleOverlay}
      >
        <Text style={styles.styleTitle}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  // List header component
  const ListHeaderComponent = useCallback(() => (
    <View>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={['rgba(177, 76, 255, 0.3)', 'rgba(177, 76, 255, 0.05)']}
          style={styles.heroGradient}
        >
          <MaterialCommunityIcons name="eye" size={56} color={COLORS.primary} />
          <Text style={styles.heroTitle}>REVEAL</Text>
          <Text style={styles.heroSubtitle}>Your Personal Style Intelligence</Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      {/* For You - Addilets Powered */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="star-four-points" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>For You</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/addilets')}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.forYouCard}
          onPress={() => router.push('/addilets')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(177, 76, 255, 0.25)', 'rgba(255, 110, 199, 0.15)']}
            style={styles.forYouGradient}
          >
            <View style={styles.forYouContent}>
              <View style={styles.forYouIcon}>
                <MaterialCommunityIcons name="account-star" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.forYouText}>
                <Text style={styles.forYouTitle}>Your Style DNA</Text>
                <Text style={styles.forYouSubtitle}>
                  {personalization?.styleProfile?.personalities?.join(' • ') || 'Discover your unique style'}
                </Text>
              </View>
            </View>
            <View style={styles.forYouStats}>
              <View style={styles.forYouStat}>
                <Text style={styles.forYouStatNumber}>{personalization?.recommendations?.outfits?.length || 4}</Text>
                <Text style={styles.forYouStatLabel}>Daily Picks</Text>
              </View>
              <View style={styles.forYouStatDivider} />
              <View style={styles.forYouStat}>
                <Text style={styles.forYouStatNumber}>{personalization?.styleProfile?.celebrityMatches?.[0]?.match || 92}%</Text>
                <Text style={styles.forYouStatLabel}>Match Score</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Trending Styles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Styles</Text>
          <TouchableOpacity onPress={() => router.push('/style')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={trendingStyles}
          keyExtractor={(item) => `style-${item.id}`}
          renderItem={renderStyleCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          initialNumToRender={4}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: HORIZONTAL_CARD_WIDTH + 12,
            offset: (HORIZONTAL_CARD_WIDTH + 12) * index,
            index,
          })}
        />
      </View>
    </View>
  ), [personalization, quickActions, trendingStyles, renderQuickAction, renderStyleCard]);

  const emptyData = useMemo(() => [], []);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={emptyData}
        renderItem={() => null}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={() => 'main'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        removeClippedSubviews={true}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: SIZES.borderRadiusCard,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '47%',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.1)',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  forYouCard: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
  },
  forYouGradient: {
    padding: 20,
  },
  forYouContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  forYouIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forYouText: {
    flex: 1,
    marginLeft: 16,
  },
  forYouTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  forYouSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  forYouStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  forYouStat: {
    alignItems: 'center',
    flex: 1,
  },
  forYouStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  forYouStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  forYouStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  horizontalScroll: {
    paddingRight: 20,
  },
  styleCard: {
    width: HORIZONTAL_CARD_WIDTH,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  styleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  styleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exploreGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  exploreCard: {
    flex: 1,
  },
  exploreGradient: {
    alignItems: 'center',
    padding: 24,
    borderRadius: SIZES.borderRadiusCard,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.1)',
  },
  exploreText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
