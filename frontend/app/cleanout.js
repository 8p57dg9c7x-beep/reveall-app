// Clean-Out Mode - Full Screen Experience
// Help users decide: Keep / Sell / Donate

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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../constants/theme';
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

  // Load wardrobe and start session
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

  const triggerHaptic = (type = 'medium') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // Handle decision
  const handleDecision = useCallback(async (decision) => {
    if (currentIndex >= items.length || isProcessing) return;
    
    setIsProcessing(true);
    triggerHaptic(decision === DECISIONS.KEEP ? 'success' : 'medium');
    
    const currentItem = items[currentIndex];
    await recordDecision(currentItem.id, decision, currentItem);
    
    setCanUndo(true);

    // Move to next or show summary
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

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (!canUndo || currentIndex === 0 || isProcessing) return;
    
    setIsProcessing(true);
    triggerHaptic('light');
    
    await undoLastDecision();
    setCurrentIndex(prev => prev - 1);
    setCanUndo(false);
    
    setIsProcessing(false);
  }, [canUndo, currentIndex, isProcessing]);

  // Handle close
  const handleClose = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, []);

  // Handle finish from summary
  const handleFinish = useCallback(() => {
    triggerHaptic('success');
    router.back();
  }, []);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <View style={styles.fullScreen}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your closet...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (items.length === 0) {
    return (
      <View style={styles.fullScreen}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {/* Empty content */}
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="hanger" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No items to review</Text>
            <Text style={styles.emptySubtitle}>Add items to your closet first</Text>
          </View>
          
          {/* Bottom action */}
          <View style={[styles.bottomSafeArea, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
              <Text style={styles.primaryButtonText}>Go to My Closet</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ============================================
  // SUMMARY STATE
  // ============================================
  if (showSummary && summary) {
    return (
      <View style={styles.fullScreen}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
          {/* Spacer for top safe area */}
          <View style={{ height: insets.top + 40 }} />
          
          {/* Summary content - centered */}
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#22C55E" />
            <Text style={styles.summaryTitle}>Clean-Out Complete!</Text>
            <Text style={styles.summarySubtitle}>
              You reviewed {summary.totalReviewed} {summary.totalReviewed === 1 ? 'item' : 'items'}
            </Text>
            
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <MaterialCommunityIcons name="check" size={24} color="#22C55E" />
                </View>
                <Text style={styles.statNumber}>{summary.kept}</Text>
                <Text style={styles.statLabel}>Keeping</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(177, 76, 255, 0.15)' }]}>
                  <MaterialCommunityIcons name="tag-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.statNumber}>{summary.toSell}</Text>
                <Text style={styles.statLabel}>To Sell</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 159, 67, 0.15)' }]}>
                  <MaterialCommunityIcons name="gift-outline" size={24} color="#FF9F43" />
                </View>
                <Text style={styles.statNumber}>{summary.toDonate}</Text>
                <Text style={styles.statLabel}>To Donate</Text>
              </View>
            </View>

            {summary.toSell > 0 && (
              <Text style={styles.sellHint}>
                Items marked "Sell" are saved in your Sell Stack
              </Text>
            )}
          </View>
          
          {/* Bottom action */}
          <View style={[styles.bottomSafeArea, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ============================================
  // MAIN REVIEW STATE
  // ============================================
  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        
        {/* HEADER - Fixed top */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Clean-Out</Text>
            <Text style={styles.progressText}>{currentIndex + 1} of {items.length}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.undoButton, !canUndo && styles.undoDisabled]}
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <MaterialCommunityIcons 
              name="undo" 
              size={22} 
              color={canUndo ? COLORS.textPrimary : COLORS.textMuted} 
            />
          </TouchableOpacity>
        </View>

        {/* PROGRESS BAR */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* ITEM IMAGE - Flexible center area */}
        <View style={styles.imageContainer}>
          {currentItem && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: currentItem.image }} style={styles.itemImage} />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {CATEGORY_LABELS[currentItem.category] || 'Item'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ACTIONS - Fixed bottom with SafeArea */}
        <View style={[styles.bottomSafeArea, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.questionText}>What do you want to do with this?</Text>
          
          <View style={styles.actionsRow}>
            {/* Donate */}
            <TouchableOpacity
              style={[styles.actionButton, styles.donateBtn]}
              onPress={() => handleDecision(DECISIONS.DONATE)}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <MaterialCommunityIcons name="gift-outline" size={28} color="#FF9F43" />
              <Text style={[styles.actionLabel, { color: '#FF9F43' }]}>Donate</Text>
            </TouchableOpacity>

            {/* Keep - Primary */}
            <TouchableOpacity
              style={[styles.actionButton, styles.keepBtn]}
              onPress={() => handleDecision(DECISIONS.KEEP)}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <MaterialCommunityIcons name="check" size={36} color="#FFFFFF" />
              <Text style={styles.keepLabel}>Keep</Text>
            </TouchableOpacity>

            {/* Sell */}
            <TouchableOpacity
              style={[styles.actionButton, styles.sellBtn]}
              onPress={() => handleDecision(DECISIONS.SELL)}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <MaterialCommunityIcons name="tag-outline" size={28} color={COLORS.primary} />
              <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    fontSize: 17,
    fontWeight: '600',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  undoDisabled: {
    opacity: 0.4,
  },
  
  // Progress
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  
  // Image
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  imageWrapper: {
    width: SCREEN_WIDTH - 48,
    maxHeight: SCREEN_HEIGHT * 0.45,
    aspectRatio: 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  itemImage: {
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
  
  // Bottom actions
  bottomSafeArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  questionText: {
    textAlign: 'center',
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  donateBtn: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 159, 67, 0.12)',
  },
  keepBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#22C55E',
  },
  sellBtn: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(177, 76, 255, 0.12)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  keepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  
  // Loading
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Empty
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
  
  // Summary
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sellHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 32,
    textAlign: 'center',
  },
  
  // Primary button
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
