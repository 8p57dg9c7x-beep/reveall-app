import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';
import { getAnalyticsDashboard } from '../services/analytics';
import FadeInView from '../components/FadeInView';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getAnalyticsDashboard();
      if (analyticsData && analyticsData.success) {
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </View>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <FadeInView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>{data?.period || 'Last 30 Days'}</Text>
        </FadeInView>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="chart-line" size={32} color={COLORS.primary} />
            <Text style={styles.summaryValue}>{data?.summary?.total_events || 0}</Text>
            <Text style={styles.summaryLabel}>Total Events</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="cart-outline" size={32} color={COLORS.accent} />
            <Text style={styles.summaryValue}>{data?.summary?.product_clicks || 0}</Text>
            <Text style={styles.summaryLabel}>Product Clicks</Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
            <Text style={styles.summaryValue}>{data?.summary?.outfit_views || 0}</Text>
            <Text style={styles.summaryLabel}>Outfit Views</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="palette-outline" size={32} color={COLORS.accent} />
            <Text style={styles.summaryValue}>{data?.summary?.beauty_views || 0}</Text>
            <Text style={styles.summaryLabel}>Beauty Views</Text>
          </View>
        </View>

        {/* Top Products */}
        {data?.top_products && data.top_products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Top Products</Text>
            {data.top_products.map((product, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listRank}>#{index + 1}</Text>
                  <View>
                    <Text style={styles.listItemTitle} numberOfLines={1}>
                      {product._id}
                    </Text>
                    <Text style={styles.listItemSubtitle}>{product.price}</Text>
                  </View>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemClicks}>{product.clicks}</Text>
                  <Text style={styles.listItemLabel}>clicks</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Outfits */}
        {data?.top_outfits && data.top_outfits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👔 Top Outfits</Text>
            {data.top_outfits.map((outfit, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listRank}>#{index + 1}</Text>
                  <Text style={styles.listItemTitle} numberOfLines={1}>
                    {outfit.title}
                  </Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemClicks}>{outfit.views}</Text>
                  <Text style={styles.listItemLabel}>views</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Beauty Looks */}
        {data?.top_beauty_looks && data.top_beauty_looks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💄 Top Beauty Looks</Text>
            {data.top_beauty_looks.map((look, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listRank}>#{index + 1}</Text>
                  <Text style={styles.listItemTitle} numberOfLines={1}>
                    {look.title}
                  </Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemClicks}>{look.views}</Text>
                  <Text style={styles.listItemLabel}>views</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Category Stats */}
        {data?.category_stats && data.category_stats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📁 Category Popularity</Text>
            {data.category_stats.map((category, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listRank}>#{index + 1}</Text>
                  <Text style={styles.listItemTitle}>{category._id}</Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemClicks}>{category.views}</Text>
                  <Text style={styles.listItemLabel}>views</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  listRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 30,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  listItemClicks: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  listItemLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
