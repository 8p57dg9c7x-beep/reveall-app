// Help Me Decide - Bottom Sheet Modal
// Temporary overlay, not a destination
// Swipe down or tap ✕ to close

import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../constants/theme';
import { fetchRealWeather } from '../services/weatherService';
import { likeOutfit, dislikeOutfit, DISLIKE_REASONS } from '../services/feedbackService';
import { getFeedbackAcknowledgment } from '../services/intelligenceService';

const { width } = Dimensions.get('window');

// Occasions - Optional, skippable
const OCCASIONS = [
  { id: 'everyday', label: 'Everyday', icon: 'coffee' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'date', label: 'Date Night', icon: 'heart' },
  { id: 'dinner', label: 'Dinner', icon: 'silverware-fork-knife' },
  { id: 'active', label: 'Active', icon: 'run' },
];

// Style preferences
const STYLES = ['Minimalist', 'Classic', 'Trendy', 'Relaxed', 'Elegant', 'Bold'];

const HelpMeDecideModal = forwardRef((props, ref) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = React.useRef(null);
  
  // State
  const [step, setStep] = useState(1); // 1: occasion, 2: style, 3: result
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [weather, setWeather] = useState(null);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [intelligenceMessage, setIntelligenceMessage] = useState(null);
  
  // Snap points for bottom sheet
  const snapPoints = useMemo(() => ['85%'], []);
  
  // Expose open/close methods to parent
  useImperativeHandle(ref, () => ({
    open: () => {
      resetState();
      bottomSheetRef.current?.expand();
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
  }));
  
  // Reset state when opening
  const resetState = () => {
    setStep(1);
    setSelectedOccasion(null);
    setSelectedStyles([]);
    setGeneratedOutfit(null);
    setFeedbackGiven(false);
    setIntelligenceMessage(null);
  };
  
  // Load data when modal opens
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const weatherData = await fetchRealWeather();
      setWeather(weatherData);
      
      const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
      if (wardrobeJson) {
        setWardrobeItems(JSON.parse(wardrobeJson));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };
  
  // Handle close
  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);
  
  // Backdrop component
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    []
  );
  
  // Toggle style selection
  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else if (selectedStyles.length < 2) {
      setSelectedStyles([...selectedStyles, style]);
    }
  };
  
  // Generate outfit from wardrobe
  const generateOutfit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const grouped = wardrobeItems.reduce((acc, item) => {
      const cat = item.category?.toLowerCase() || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    
    const outfitItems = [];
    if (grouped.tops?.length > 0) outfitItems.push(grouped.tops[Math.floor(Math.random() * grouped.tops.length)]);
    if (grouped.bottoms?.length > 0) outfitItems.push(grouped.bottoms[Math.floor(Math.random() * grouped.bottoms.length)]);
    if (grouped.shoes?.length > 0) outfitItems.push(grouped.shoes[Math.floor(Math.random() * grouped.shoes.length)]);
    if (grouped.outerwear?.length > 0 && weather?.temp < 65) {
      outfitItems.push(grouped.outerwear[0]);
    }
    
    const occasion = OCCASIONS.find(o => o.id === selectedOccasion)?.label || 'Today';
    
    setGeneratedOutfit({
      id: Date.now(),
      title: `${occasion} Look`,
      items: outfitItems,
      occasion: occasion,
      style: selectedStyles[0] || 'Your Style',
      tip: getStyleTip(),
    });
    
    setLoading(false);
    setStep(3);
  };
  
  const getStyleTip = () => {
    if (weather?.temp < 60) return "Layer up for the cooler weather.";
    if (weather?.temp > 80) return "Keep it light and breathable.";
    return "Mix and match to express your style.";
  };
  
  // Feedback handlers
  const handleLike = async () => {
    if (generatedOutfit) {
      await likeOutfit(generatedOutfit.id);
      setFeedbackGiven(true);
      const ack = await getFeedbackAcknowledgment('like');
      if (ack) setIntelligenceMessage(ack);
    }
  };
  
  const handleDislike = async () => {
    if (generatedOutfit) {
      await dislikeOutfit(generatedOutfit.id, 'vibe');
      setFeedbackGiven(true);
      const ack = await getFeedbackAcknowledgment('dislike');
      if (ack) setIntelligenceMessage(ack);
    }
  };
  
  // Check if user has enough wardrobe items
  const hasEnoughItems = wardrobeItems.length >= 3;
  
  // Render Step 1: Occasion (skippable)
  const renderOccasionStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What are you dressing for?</Text>
      <Text style={styles.stepSubtitle}>Optional — skip if you just want inspiration</Text>
      
      {weather && (
        <View style={styles.weatherPill}>
          <MaterialCommunityIcons name={weather.icon} size={16} color={weather.iconColor} />
          <Text style={styles.weatherText}>{weather.tempDisplay}</Text>
        </View>
      )}
      
      <View style={styles.occasionGrid}>
        {OCCASIONS.map((occ) => (
          <TouchableOpacity
            key={occ.id}
            style={[
              styles.occasionChip,
              selectedOccasion === occ.id && styles.occasionChipSelected,
            ]}
            onPress={() => setSelectedOccasion(occ.id)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={occ.icon} 
              size={20} 
              color={selectedOccasion === occ.id ? '#FFFFFF' : COLORS.primary} 
            />
            <Text style={[
              styles.occasionLabel,
              selectedOccasion === occ.id && styles.occasionLabelSelected,
            ]}>{occ.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => setStep(2)}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryButtonText}>
          {selectedOccasion ? 'Continue' : 'Skip — Surprise Me'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render Step 2: Style (skippable)
  const renderStyleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Any style preference?</Text>
      <Text style={styles.stepSubtitle}>Pick up to 2, or skip</Text>
      
      <View style={styles.styleGrid}>
        {STYLES.map((style) => (
          <TouchableOpacity
            key={style}
            style={[
              styles.styleChip,
              selectedStyles.includes(style) && styles.styleChipSelected,
            ]}
            onPress={() => toggleStyle(style)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.styleLabel,
              selectedStyles.includes(style) && styles.styleLabelSelected,
            ]}>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={generateOutfit}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Creating...' : (selectedStyles.length > 0 ? 'Show Me' : 'Surprise Me')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backLink}
        onPress={() => setStep(1)}
      >
        <Text style={styles.backLinkText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render Step 3: Result
  const renderResultStep = () => (
    <View style={styles.stepContent}>
      {generatedOutfit ? (
        <>
          <Text style={styles.resultTitle}>{generatedOutfit.title}</Text>
          <Text style={styles.resultSubtitle}>{generatedOutfit.style} • {generatedOutfit.occasion}</Text>
          
          {/* Outfit Items */}
          <View style={styles.outfitGrid}>
            {generatedOutfit.items.map((item, index) => (
              <View key={item.id || index} style={styles.outfitItem}>
                <Image source={{ uri: item.image }} style={styles.outfitImage} />
                <Text style={styles.outfitItemLabel}>{item.category}</Text>
              </View>
            ))}
          </View>
          
          {/* Stylist Tip */}
          <View style={styles.tipBox}>
            <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#FFD93D" />
            <Text style={styles.tipText}>{generatedOutfit.tip}</Text>
          </View>
          
          {/* Quiet Intelligence Message */}
          {intelligenceMessage && (
            <View style={styles.intelligenceBox}>
              <Text style={styles.intelligenceText}>{intelligenceMessage}</Text>
            </View>
          )}
          
          {/* Feedback */}
          {!feedbackGiven ? (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackLabel}>How is this?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity style={styles.feedbackButton} onPress={handleLike}>
                  <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#4ADE80" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.feedbackButton} onPress={handleDislike}>
                  <MaterialCommunityIcons name="thumb-down-outline" size={20} color="#F87171" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.feedbackThanks}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.primary} />
              <Text style={styles.feedbackThanksText}>Thanks for the feedback</Text>
            </View>
          )}
          
          {/* Actions */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => { resetState(); setStep(1); }}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons name="refresh" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Try Another</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyResult}>
          <MaterialCommunityIcons name="hanger" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyResultText}>Add more items to your closet for outfit suggestions</Text>
        </View>
      )}
    </View>
  );
  
  // Render not enough items state
  const renderNotEnoughItems = () => (
    <View style={styles.stepContent}>
      <View style={styles.notEnoughState}>
        <MaterialCommunityIcons name="wardrobe-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.notEnoughTitle}>Almost there</Text>
        <Text style={styles.notEnoughText}>
          Add a few more items to your closet and I can start helping you put outfits together.
        </Text>
      </View>
    </View>
  );
  
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={(index) => {
        if (index === -1) resetState();
      }}
    >
      <View style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help Me Decide</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          {!hasEnoughItems ? (
            renderNotEnoughItems()
          ) : (
            <>
              {step === 1 && renderOccasionStep()}
              {step === 2 && renderStyleStep()}
              {step === 3 && renderResultStep()}
            </>
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  weatherText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  occasionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  occasionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  occasionLabelSelected: {
    color: '#FFFFFF',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  styleChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  styleChipSelected: {
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    borderColor: COLORS.primary,
  },
  styleLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  styleLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 12,
    marginTop: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Result styles
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  outfitItem: {
    width: (width - 40 - 24) / 3,
    alignItems: 'center',
  },
  outfitImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  outfitItemLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255, 217, 61, 0.08)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  intelligenceBox: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  intelligenceText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  feedbackLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackThanks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  feedbackThanksText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Not enough items state
  notEnoughState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  notEnoughTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  notEnoughText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyResultText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default HelpMeDecideModal;
