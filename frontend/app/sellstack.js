// Sell Stack - Items marked for sale
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  const handleRemoveItem = async (itemId) => {
    triggerHaptic();
    
    const doRemove = async () => {
      const updated = await removeFromSellStack(itemId);
      setSellItems(updated);
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

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { 
            paddingTop: insets.top + 16,
            paddingBottom: 100,
          }
        ]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sell Stack</Text>
            {sellItems.length > 0 && (
              <Text style={styles.headerCount}>{sellItems.length}</Text>
            )}
          </View>
          {sellItems.length > 0 ? (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
        </View>

        {/* Content */}
        {sellItems.length === 0 ? (
          <View style={styles.emptyState}>
            {/* Abstract visual - tag shape */}
            <View style={styles.emptyVisual}>
              <View style={styles.emptyTag}>
                <View style={styles.emptyTagHole} />
              </View>
            </View>
            
            <Text style={styles.emptyTitle}>Nothing to sell yet</Text>
            <Text style={styles.emptySubtitle}>
              Items you mark "Sell" during Clean-Out Mode will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sellItems.map((item) => (
              <View key={item.itemId} style={styles.itemCard}>
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
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.itemId)}
                >
                  <MaterialCommunityIcons name="close" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
    flexGrow: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerPlaceholder: {
    width: 44,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // List
  list: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemContent: {
    flex: 1,
    marginLeft: 14,
  },
  itemCategory: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  itemDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyVisual: {
    marginBottom: 32,
  },
  emptyTag: {
    width: 44,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    alignItems: 'center',
    paddingTop: 10,
  },
  emptyTagHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
