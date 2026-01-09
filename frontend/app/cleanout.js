// Clean-Out Mode - True Full Screen Experience
// NO tab bar. Clear hierarchy: Image → Progress → Actions

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

  const handleDecision = useCallback(async (decision) => {
    if (currentIndex >= items.length || isProcessing) return;
    
    setIsProcessing(true);
    triggerHaptic(decision === DECISIONS.KEEP ? 'success' : 'medium');
    
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
    triggerHaptic('light');
    
    await undoLastDecision();
    setCurrentIndex(prev => prev - 1);
    setCanUndo(false);
    
    setIsProcessing(false);
  }, [canUndo, currentIndex, isProcessing]);

  const handleClose = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, []);

  const handleFinish = useCallback(() => {
    triggerHaptic('success');
    router.back();
  }, []);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

  // ============================================
  // LOADING
  // ============================================
  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: '#0A0A0A' }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your closet...</Text>
        </View>
      </View>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (items.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: '#0A0A0A' }]}>
        <StatusBar barStyle="light-content" />
        
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="hanger" size={56} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No items to review</Text>
          <Text style={styles.emptySubtitle}>Add items to your closet first</Text>
        </View>
        
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleClose}>
            <Text style={styles.primaryBtnText}>Go to My Closet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================================
  // SUMMARY
  // ============================================
  if (showSummary && summary) {
    return (
      <View style={[styles.screen, { backgroundColor: '#0A0A0A' }]}>
        <StatusBar barStyle="light-content" />
        
        <View style={[styles.summaryContent, { paddingTop: insets.top + 60 }]}>
          <MaterialCommunityIcons name="check-circle" size={72} color="#22C55E" />
          <Text style={styles.summaryTitle}>Clean-Out Complete!</Text>
          <Text style={styles.summarySubtitle}>
            You reviewed {summary.totalReviewed} {summary.totalReviewed === 1 ? 'item' : 'items'}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#22C55E' }]}>{summary.kept}</Text>
              <Text style={styles.statLabel}>Keeping</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: COLORS.primary }]}>{summary.toSell}</Text>
              <Text style={styles.statLabel}>To Sell</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#FF9F43' }]}>{summary.toDonate}</Text>
              <Text style={styles.statLabel}>To Donate</Text>
            </View>
          </View>

          {summary.toSell > 0 && (
            <Text style={styles.sellNote}>
              Items marked "Sell" are in your Sell Stack
            </Text>
          )}
        </View>
        
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================================
  // MAIN REVIEW SCREEN
  // ============================================
  return (
    <View style={[styles.screen, { backgroundColor: '#0A0A0A' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* TOP: Close + Title + Undo */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.titleArea}>
          <Text style={styles.title}>Clean-Out</Text>
          <Text style={styles.counter}>{currentIndex + 1} of {items.length}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleUndo} 
          disabled={!canUndo}
          style={[styles.undoBtn, !canUndo && styles.undoBtnDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="undo" size={22} color={canUndo ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} />
        </TouchableOpacity>
      </View>

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* CENTER: ITEM IMAGE */}
      <View style={styles.imageArea}>
        {currentItem && (
          <View style={styles.imageCard}>
            <Image source={{ uri: currentItem.image }} style={styles.itemImage} />
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {CATEGORY_LABELS[currentItem.category] || 'Item'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* BOTTOM: FIXED ACTION AREA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.questionText}>What will you do with this piece?</Text>
        
        <View style={styles.actionsRow}>
          {/* DONATE */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDecision(DECISIONS.DONATE)}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <View style={[styles.actionIcon, styles.donateIcon]}>
              <MaterialCommunityIcons name="hand-heart-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Donate</Text>
          </TouchableOpacity>

          {/* KEEP - PRIMARY */}
          <TouchableOpacity
            style={styles.keepBtn}
            onPress={() => handleDecision(DECISIONS.KEEP)}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <MaterialCommunityIcons name="check" size={32} color="#FFFFFF" />
            <Text style={styles.keepText}>Keep</Text>
          </TouchableOpacity>

          {/* SELL */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDecision(DECISIONS.SELL)}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <View style={[styles.actionIcon, styles.sellIcon]}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  // TOP BAR
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleArea: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  counter: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  undoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoBtnDisabled: {
    opacity: 0.5,
  },
  
  // PROGRESS
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  
  // IMAGE AREA
  imageArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageCard: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_HEIGHT * 0.42,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // BOTTOM BAR - FIXED
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  questionText: {
    textAlign: 'center',
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    width: 72,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    color: '#FFFFFF',
  },
  donateIcon: {
    backgroundColor: '#FF9F43',
  },
  sellIcon: {
    backgroundColor: COLORS.primary,
  },
  keepBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  
  // LOADING
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  
  // EMPTY
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  
  // SUMMARY
  summaryContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
  },
  summarySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 32,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 36,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  sellNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 40,
    textAlign: 'center',
  },
  
  // PRIMARY BUTTON
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
