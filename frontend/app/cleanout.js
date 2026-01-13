// ═══════════════════════════════════════════════════════════════
// CLEAN-OUT MODE
// A thoughtful, calm decision-making experience.
// Focus on the item. Space to breathe. Premium feel.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import {
  DECISIONS,
  startCleanOutSession,
  recordDecision,
  undoLastDecision,
  endCleanOutSession,
} from '../services/cleanOutService';

const WARDROBE_KEY = '@reveal_wardrobe';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORY_LABELS = {
  outerwear: 'Outerwear',
  tops: 'Top',
  bottoms: 'Bottoms',
  shoes: 'Shoes',
};

export default function CleanOutScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const wardrobeJson = await AsyncStorage.getItem(WARDROBE_KEY);
        if (wardrobeJson) {
          setItems(JSON.parse(wardrobeJson));
        }
        await startCleanOutSession();
      } catch (error) {
        console.log('Error initializing clean-out:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const triggerHaptic = (type = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleDecision = useCallback(async (decision) => {
    if (currentIndex >= items.length || isProcessing) return;
    
    setIsProcessing(true);
    triggerHaptic(decision === DECISIONS.KEEP ? 'success' : 'light');
    
    const currentItem = items[currentIndex];
    await recordDecision(currentItem.id, decision, currentItem);
    
    setCanUndo(true);

    if (currentIndex + 1 >= items.length) {
      const sessionSummary = await endCleanOutSession();
      setSummary(sessionSummary);
      setShowSummary(true);
      triggerHaptic('success');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    
    setIsProcessing(false);
  }, [currentIndex, items, isProcessing]);

  const handleUndo = useCallback(async () => {
    if (!canUndo || currentIndex === 0 || isProcessing) return;
    
    setIsProcessing(true);
    triggerHaptic();
    
    await undoLastDecision();
    setCurrentIndex(prev => prev - 1);
    setCanUndo(false);
    
    setIsProcessing(false);
  }, [canUndo, currentIndex, isProcessing]);

  const handleClose = useCallback(() => {
    triggerHaptic();
    router.back();
  }, []);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

  // ═══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════
  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={handleClose} hitSlop={16}>
            <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No items to review</Text>
        </View>
        
        <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
          <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
            <Text style={styles.doneButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY STATE
  // ═══════════════════════════════════════════════════════════════
  if (showSummary && summary) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        
        <View style={[styles.summaryContent, { paddingTop: insets.top + 80 }]}>
          <Text style={styles.summaryTitle}>Done</Text>
          <Text style={styles.summarySubtitle}>
            {summary.totalReviewed} {summary.totalReviewed === 1 ? 'item' : 'items'} reviewed
          </Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{summary.kept}</Text>
              <Text style={styles.summaryStatLabel}>Keeping</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{summary.toSell}</Text>
              <Text style={styles.summaryStatLabel}>Selling</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{summary.toDonate}</Text>
              <Text style={styles.summaryStatLabel}>Donating</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={() => { triggerHaptic('success'); router.back(); }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN REVIEW STATE
  // ═══════════════════════════════════════════════════════════════
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      
      {/* ─────────────────────────────────────────────────────── */}
      {/* HEADER - Minimal, functional                            */}
      {/* ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleClose} hitSlop={16}>
          <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        
        <Text style={styles.headerCounter}>{currentIndex + 1} / {items.length}</Text>
        
        <TouchableOpacity 
          onPress={handleUndo} 
          disabled={!canUndo}
          hitSlop={16}
          style={{ opacity: canUndo ? 1 : 0.3 }}
        >
          <MaterialCommunityIcons name="undo" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* ─────────────────────────────────────────────────────── */}
      {/* PROGRESS - Subtle, informative                          */}
      {/* ─────────────────────────────────────────────────────── */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ITEM IMAGE - The star of the show                       */}
      {/* ─────────────────────────────────────────────────────── */}
      <View style={styles.itemSection}>
        {currentItem && (
          <View style={styles.itemCard}>
            <Image source={{ uri: currentItem.image }} style={styles.itemImage} />
            <View style={styles.itemCategory}>
              <Text style={styles.itemCategoryText}>
                {CATEGORY_LABELS[currentItem.category] || 'Item'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ACTIONS - Calm, grounded, intentional                   */}
      {/* ─────────────────────────────────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.actionsRow}>
          
          {/* DONATE */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDecision(DECISIONS.DONATE)}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <View style={[styles.actionCircle, styles.donateCircle]}>
              <MaterialCommunityIcons name="hand-heart-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Donate</Text>
          </TouchableOpacity>

          {/* KEEP - Primary */}
          <TouchableOpacity
            style={styles.keepButton}
            onPress={() => handleDecision(DECISIONS.KEEP)}
            activeOpacity={0.85}
            disabled={isProcessing}
          >
            <MaterialCommunityIcons name="check" size={28} color="#FFFFFF" />
            <Text style={styles.keepLabel}>Keep</Text>
          </TouchableOpacity>

          {/* SELL */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDecision(DECISIONS.SELL)}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <View style={[styles.actionCircle, styles.sellCircle]}>
              <MaterialCommunityIcons name="currency-usd" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Sell</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES - Premium, spacious, calm
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ─────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerCounter: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  
  // ─────────────────────────────────────────────────────────────
  // PROGRESS
  // ─────────────────────────────────────────────────────────────
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  
  // ─────────────────────────────────────────────────────────────
  // ITEM - The focus
  // ─────────────────────────────────────────────────────────────
  itemSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  itemCard: {
    width: SCREEN_WIDTH - 64,
    aspectRatio: 0.75,
    maxHeight: SCREEN_HEIGHT * 0.48,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemCategory: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  itemCategoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  
  // ─────────────────────────────────────────────────────────────
  // FOOTER / ACTIONS
  // ─────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 28,
  },
  
  // Secondary actions (Donate, Sell)
  actionButton: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donateCircle: {
    backgroundColor: '#E67E22',
  },
  sellCircle: {
    backgroundColor: COLORS.primary,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    letterSpacing: 0.3,
  },
  
  // Primary action (Keep)
  keepButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  keepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  
  // ─────────────────────────────────────────────────────────────
  // EMPTY
  // ─────────────────────────────────────────────────────────────
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
  },
  
  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  summaryContent: {
    flex: 1,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  summarySubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 56,
    gap: 32,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  summaryStatLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  summaryStatDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  
  // ─────────────────────────────────────────────────────────────
  // DONE BUTTON
  // ─────────────────────────────────────────────────────────────
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
