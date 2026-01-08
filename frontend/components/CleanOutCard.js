// Clean-Out Card Component
// Displays a single wardrobe item for review

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { DECISIONS } from '../services/cleanOutService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = CARD_WIDTH * 1.1;

const CATEGORY_LABELS = {
  outerwear: 'Outerwear',
  tops: 'Top',
  bottoms: 'Bottoms',
  shoes: 'Shoes',
};

export default function CleanOutCard({ item, onDecision, disabled }) {
  if (!item) return null;

  return (
    <View style={styles.container}>
      {/* Item Card */}
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {CATEGORY_LABELS[item.category] || 'Item'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Donate */}
        <TouchableOpacity
          style={[styles.actionButton, styles.donateButton]}
          onPress={() => onDecision(DECISIONS.DONATE)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <MaterialCommunityIcons name="gift-outline" size={28} color="#FF9F43" />
          <Text style={[styles.actionLabel, { color: '#FF9F43' }]}>Donate</Text>
        </TouchableOpacity>

        {/* Keep - Primary/Center */}
        <TouchableOpacity
          style={[styles.actionButton, styles.keepButton]}
          onPress={() => onDecision(DECISIONS.KEEP)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <MaterialCommunityIcons name="check" size={36} color="#FFFFFF" />
          <Text style={[styles.actionLabel, styles.keepLabel]}>Keep</Text>
        </TouchableOpacity>

        {/* Sell */}
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => onDecision(DECISIONS.SELL)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <MaterialCommunityIcons name="tag-outline" size={28} color={COLORS.primary} />
          <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
  },
  donateButton: {
    backgroundColor: 'rgba(255, 159, 67, 0.15)',
    width: 80,
    height: 80,
  },
  keepButton: {
    backgroundColor: '#22C55E',
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sellButton: {
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    width: 80,
    height: 80,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  keepLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
