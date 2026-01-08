// Sell Stack Screen
// View items marked for sale during clean-out sessions

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
      if (window.confirm('Remove this item from sell stack?')) doRemove();
    } else {
      Alert.alert(
        'Remove from Sell Stack?',
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
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Clear all items from sell stack?')) doClear();
    } else {
      Alert.alert(
        'Clear Sell Stack?',
        'All items will be removed from your sell stack.',
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
      <View style={styles.itemInfo}>
        <Text style={styles.itemCategory}>
          {item.itemData?.category || 'Item'}
        </Text>
        <Text style={styles.itemDate}>
          Added {new Date(item.addedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.itemId)}
      >
        <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Sell Stack</Text>
        <Text style={styles.headerSubtitle}>
          {sellItems.length} {sellItems.length === 1 ? 'item' : 'items'} to sell
        </Text>
      </View>
      {sellItems.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearAll}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="tag-off-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No items to sell</Text>
      <Text style={styles.emptySubtitle}>
        Items you mark "Sell" during Clean-Out Mode will appear here
      </Text>
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
          { paddingTop: insets.top },
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
    paddingVertical: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  
  // Item card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  itemDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
