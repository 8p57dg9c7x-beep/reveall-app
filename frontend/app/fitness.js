import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING } from '../constants/theme';

// Fitness Tab - Coming Soon Placeholder
export default function FitnessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + SPACING.headerPaddingTop }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="dumbbell" size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Fitness</Text>
          <Text style={styles.headerSubtitle}>Coming Soon</Text>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={['rgba(177, 76, 255, 0.2)', 'rgba(177, 76, 255, 0.05)']}
            style={styles.cardGradient}
          >
            <MaterialCommunityIcons name="rocket-launch" size={80} color={COLORS.primary} />
            <Text style={styles.cardTitle}>AI Fitness is in Development</Text>
            <Text style={styles.cardDescription}>
              Get ready for personalized workout plans, body analysis, nutrition tracking, and fitness goals powered by AI.
            </Text>
          </LinearGradient>
        </View>

        {/* Feature Preview */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What's Coming</Text>
          
          {[
            { icon: 'human', title: 'Body Analysis', desc: 'AI-powered body composition tracking' },
            { icon: 'calendar-check', title: 'Workout Plans', desc: 'Personalized exercise routines' },
            { icon: 'food-apple', title: 'Nutrition Guide', desc: 'Smart meal planning & macros' },
            { icon: 'chart-line', title: 'Progress Tracking', desc: 'Visual fitness journey analytics' },
            { icon: 'target', title: 'Goal Setting', desc: 'Custom fitness milestones' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name={feature.icon} size={28} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonBadgeText}>Soon</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Beta Signup Teaser */}
        <View style={styles.betaCard}>
          <MaterialCommunityIcons name="bell-ring" size={32} color={COLORS.accent} />
          <Text style={styles.betaTitle}>Be the First to Know</Text>
          <Text style={styles.betaDesc}>
            Fitness features are coming in BRICK 6. Stay tuned for updates!
          </Text>
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
  content: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.bottomPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.sectionGap,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginTop: SPACING.titleToSubtitle,
    fontWeight: '600',
  },
  comingSoonCard: {
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginBottom: SPACING.sectionGap,
  },
  cardGradient: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: SPACING.cardPadding,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.titleToSubtitle,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sectionTitleBottom,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.itemGap,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comingSoonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  betaCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  betaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  betaDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
