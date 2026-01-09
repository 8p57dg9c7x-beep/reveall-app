// Sell Stack - Premium & Empowering
// Items marked for sale during clean-out sessions

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';
import { getSellStack, removeFromSellStack, clearSellStack } from '../services/cleanOutService';

const CATEGORY_LABELS = {
  outerwear: 'Outerwear',
  tops: 'Top',
  bottoms: 'Bottoms',
  shoes: 'Shoes',
};

export default function SellStackScreen() {
  const insets = useSafeAreaInsets();
  const [sellItems, setSellItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSellStack = async () => {
    try {
      const stack = await getSellStack();
      setSellItems(stack);
    } catch (error) {
      console.log('Error loading sell stack:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSellStack();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSellStack();
    }, [])
  );

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveItem = async (itemId) => {
    triggerHaptic();
    
    const doRemove = async () => {
      const updated = await removeFromSellStack(itemId);
      setSellItems(updated);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Remove from sell stack?')) doRemove();
    } else {
      Alert.alert(
        'Remove item?',
        'This item will no longer be marked for sale.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: doRemove },
        ]
      );
    }
  };

  const handleClearAll = async () => {
    triggerHaptic();
    
    const doClear = async () => {
      await clearSellStack();
      setSellItems([]);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Clear all items?')) doClear();
    } else {
      Alert.alert(
        'Clear sell stack?',
        'All items will be removed.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: doClear },
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image 
        source={{ uri: item.itemData?.image }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemCategory}>
          {CATEGORY_LABELS[item.itemData?.category] || 'Item'}
        </Text>
        <Text style={styles.itemDate}>
          Added {new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeBtn}
        onPress={() => handleRemoveItem(item.itemId)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons name="close" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Sell Stack</Text>
        {sellItems.length > 0 && (
          <Text style={styles.headerCount}>{sellItems.length}</Text>
        )}
      </View>
      {sellItems.length > 0 ? (
        <TouchableOpacity 
          style={styles.clearBtn}
          onPress={handleClearAll}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerPlaceholder} />
      )}
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyVisual}>
        <View style={styles.emptyTag}>
          <View style={styles.emptyTagHole} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>Nothing to sell yet</Text>
      <Text style={styles.emptySubtitle}>
        Items you mark "Sell" during Clean-Out Mode will appear here
      </Text>
      <TouchableOpacity 
        style={styles.emptyCTA}
        onPress={() => { triggerHaptic(); router.replace('/aiwardrobe'); }}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyCTAText}>Start a clean-out</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <FlatList
        data={sellItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.itemId}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 16 },
          sellItems.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerCount: {
    fontSize: 15,
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerPlaceholder: {
    width: 44,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  
  // Item card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemContent: {
    flex: 1,
    marginLeft: 14,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty state - Elegant
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyVisual: {
    marginBottom: 32,
  },
  emptyTag: {
    width: 48,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    alignItems: 'center',
    paddingTop: 8,
  },
  emptyTagHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 28,
  },
  emptyCTA: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyCTAText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
