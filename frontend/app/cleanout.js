// Clean-Out Mode Screen
// Help users decide what to Keep / Sell / Donate

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING } from '../constants/theme';
import CleanOutCard from '../components/CleanOutCard';
import {
  DECISIONS,
  startCleanOutSession,
  recordDecision,
  undoLastDecision,
  getSessionStats,
  endCleanOutSession,
} from '../services/cleanOutService';

const WARDROBE_KEY = '@reveal_wardrobe';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CleanOutScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [lastDecision, setLastDecision] = useState(null);
  const [canUndo, setCanUndo] = useState(false);

  // Load wardrobe items and start session
  useEffect(() => {
    const init = async () => {
      try {
        const wardrobeJson = await AsyncStorage.getItem(WARDROBE_KEY);
        if (wardrobeJson) {
          const wardrobeItems = JSON.parse(wardrobeJson);
          setItems(wardrobeItems);
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
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // Handle decision
  const handleDecision = useCallback(async (decision) => {
    if (currentIndex >= items.length) return;

    triggerHaptic(decision === DECISIONS.KEEP ? 'success' : 'light');
    
    const currentItem = items[currentIndex];
    await recordDecision(currentItem.id, decision, currentItem);
    
    setLastDecision({ itemId: currentItem.id, decision });
    setCanUndo(true);

    // Move to next item or show summary
    if (currentIndex + 1 >= items.length) {
      // Session complete
      const sessionSummary = await endCleanOutSession();
      setSummary(sessionSummary);
      setShowSummary(true);
      triggerHaptic('success');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, items]);

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (!canUndo || currentIndex === 0) return;

    triggerHaptic('warning');
    
    const result = await undoLastDecision();
    if (result) {
      setCurrentIndex(prev => prev - 1);
      setCanUndo(false);
      setLastDecision(null);
    }
  }, [canUndo, currentIndex]);

  // Handle close/exit
  const handleClose = useCallback(async () => {
    triggerHaptic();
    
    // If we've made decisions, show summary
    const stats = await getSessionStats();
    if (stats.total > 0) {
      const sessionSummary = await endCleanOutSession();
      setSummary(sessionSummary);
      setShowSummary(true);
    } else {
      // No decisions made, just exit
      await endCleanOutSession();
      router.back();
    }
  }, []);

  // Handle finish
  const handleFinish = useCallback(() => {
    triggerHaptic('success');
    router.back();
  }, []);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex) / items.length) * 100 : 0;

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your closet...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="hanger" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No items to review</Text>
            <Text style={styles.emptySubtitle}>Add items to your closet first</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyButtonText}>Go to My Closet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Summary state
  if (showSummary && summary) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <View style={styles.summaryContainer}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#22C55E" />
            <Text style={styles.summaryTitle}>Clean-Out Complete!</Text>
            <Text style={styles.summarySubtitle}>
              You reviewed {summary.totalReviewed} {summary.totalReviewed === 1 ? 'item' : 'items'}
            </Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <View style={[styles.summaryStatIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <MaterialCommunityIcons name="check" size={24} color="#22C55E" />
                </View>
                <Text style={styles.summaryStatNumber}>{summary.kept}</Text>
                <Text style={styles.summaryStatLabel}>Keeping</Text>
              </View>
              
              <View style={styles.summaryStat}>
                <View style={[styles.summaryStatIcon, { backgroundColor: 'rgba(177, 76, 255, 0.15)' }]}>
                  <MaterialCommunityIcons name="tag-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.summaryStatNumber}>{summary.toSell}</Text>
                <Text style={styles.summaryStatLabel}>To Sell</Text>
              </View>
              
              <View style={styles.summaryStat}>
                <View style={[styles.summaryStatIcon, { backgroundColor: 'rgba(255, 159, 67, 0.15)' }]}>
                  <MaterialCommunityIcons name="gift-outline" size={24} color="#FF9F43" />
                </View>
                <Text style={styles.summaryStatNumber}>{summary.toDonate}</Text>
                <Text style={styles.summaryStatLabel}>To Donate</Text>
              </View>
            </View>

            {summary.toSell > 0 && (
              <Text style={styles.sellStackHint}>
                Items marked "Sell" are saved in your Sell Stack
              </Text>
            )}
            
            <TouchableOpacity 
              style={styles.finishButton}
              onPress={handleFinish}
              activeOpacity={0.9}
            >
              <Text style={styles.finishButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Main review state
  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Clean-Out Mode</Text>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {items.length}
            </Text>
          </View>
          
          {/* Undo button */}
          <TouchableOpacity 
            style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <MaterialCommunityIcons 
              name="undo" 
              size={24} 
              color={canUndo ? COLORS.textPrimary : COLORS.textMuted} 
            />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Card */}
        <View style={styles.cardContainer}>
          <CleanOutCard 
            item={currentItem} 
            onDecision={handleDecision}
          />
        </View>

        {/* Hint text */}
        <Text style={styles.hintText}>
          What do you want to do with this piece?
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screenHorizontal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  undoButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  
  // Progress bar
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  
  // Card container
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Hint
  hintText: {
    textAlign: 'center',
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Summary
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
  },
  summarySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 24,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryStatLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sellStackHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 32,
    textAlign: 'center',
  },
  finishButton: {
    marginTop: 40,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
