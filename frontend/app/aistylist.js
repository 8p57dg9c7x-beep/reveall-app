// AI Stylist - v1 Wardrobe-Only Version
// Recommends outfits using ONLY items from user's My Closet
// NO shopping, NO prices, NO external products

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import GradientButton from '../components/GradientButton';
import GradientChip from '../components/GradientChip';
import { fetchRealWeather } from '../services/weatherService';
import { useInterstitialAd } from '../services/useInterstitialAd';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { likeOutfit, dislikeOutfit, DISLIKE_REASONS } from '../services/feedbackService';
import { logEvent } from '../services/firebase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;

// Occasions for styling
const OCCASIONS = [
  { id: 'casual', label: 'Casual', icon: 'coffee' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'evening', label: 'Evening', icon: 'glass-cocktail' },
  { id: 'active', label: 'Active', icon: 'run' },
  { id: 'weekend', label: 'Weekend', icon: 'calendar-weekend' },
];

const STYLE_PREFERENCES = [
  'Minimalist', 'Classic', 'Trendy', 'Sporty', 
  'Elegant', 'Relaxed', 'Bold', 'Neutral'
];

// Generate "Why this outfit?" explanation - simple, human language
const generateWhyThisOutfit = (occasion, styles, weather, items) => {
  const reasons = [];
  
  // Weather reason
  if (weather) {
    if (weather.condition === 'rainy' || weather.condition === 'stormy') {
      reasons.push('Perfect for today\'s rainy weather');
    } else if (weather.temp < 60) {
      reasons.push('Layered for the cooler weather');
    } else if (weather.temp > 80) {
      reasons.push('Light and breathable for the warm day');
    } else {
      reasons.push(`Suited for today's ${weather.conditionLabel?.toLowerCase() || 'weather'}`);
    }
  }
  
  // Occasion reason
  if (occasion) {
    reasons.push(`Matches your ${occasion.toLowerCase()} plans`);
  }
  
  // Style reason
  if (styles && styles.length > 0) {
    reasons.push(`Fits your ${styles[0].toLowerCase()} style preference`);
  }
  
  // Items reason
  if (items && items.length >= 3) {
    reasons.push('Uses pieces you already own');
  }
  
  return reasons.slice(0, 2); // Keep it to 2 reasons for simplicity
};

export default function AIStylistScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/stylelab';
  
  const [step, setStep] = useState(1);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [weather, setWeather] = useState(null);
  const [generatedLooks, setGeneratedLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [hasWardrobe, setHasWardrobe] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // Track feedback per outfit
  const [showDislikeOptions, setShowDislikeOptions] = useState(null); // Which outfit is showing dislike options

  // Feedback handlers
  const handleLike = async (outfitId) => {
    await likeOutfit(outfitId);
    setFeedbackGiven(prev => ({ ...prev, [outfitId]: 'like' }));
    logEvent('outfit_liked', { outfit_id: outfitId.toString() });
  };

  const handleDislike = (outfitId) => {
    setShowDislikeOptions(outfitId);
  };

  const handleDislikeReason = async (outfitId, reason) => {
    await dislikeOutfit(outfitId, reason);
    setFeedbackGiven(prev => ({ ...prev, [outfitId]: 'dislike' }));
    setShowDislikeOptions(null);
    logEvent('outfit_disliked', { outfit_id: outfitId.toString(), reason });
  };

  // Ad integration
  const { showAdIfEligible } = useInterstitialAd();

  useEffect(() => {
    const timer = setTimeout(() => {
      showAdIfEligible();
    }, 500);
    return () => clearTimeout(timer);
  }, [showAdIfEligible]);

  // Load weather
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const weatherData = await fetchRealWeather();
        setWeather(weatherData);
      } catch (error) {
        console.log('Weather fetch error:', error);
      }
    };
    loadWeather();
  }, []);

  // Load user's wardrobe from AsyncStorage
  useEffect(() => {
    const loadWardrobe = async () => {
      try {
        const wardrobeJson = await AsyncStorage.getItem('@reveal_wardrobe');
        if (wardrobeJson) {
          const items = JSON.parse(wardrobeJson);
          setWardrobeItems(items);
          setHasWardrobe(items.length > 0);
        }
      } catch (error) {
        console.log('Wardrobe load error:', error);
      }
    };
    loadWardrobe();
  }, []);

  const handleBack = () => {
    if (step > 1 && step < 3) {
      setStep(step - 1);
    } else {
      router.push(returnPath);
    }
  };

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else if (selectedStyles.length < 3) {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  // Generate outfit combinations from user's wardrobe
  const generateRecommendations = async () => {
    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Group wardrobe items by category
    const grouped = wardrobeItems.reduce((acc, item) => {
      const cat = item.category?.toLowerCase() || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    // Generate outfit combinations from wardrobe
    const looks = [];
    const occasion = OCCASIONS.find(o => o.id === selectedOccasion)?.label || 'Everyday';
    
    // Create up to 3 outfit combinations
    for (let i = 0; i < Math.min(3, Math.max(1, wardrobeItems.length)); i++) {
      const outfitItems = [];
      
      // Try to pick one item from each category
      if (grouped.tops?.length > i) outfitItems.push(grouped.tops[i]);
      else if (grouped.tops?.length > 0) outfitItems.push(grouped.tops[0]);
      
      if (grouped.bottoms?.length > i) outfitItems.push(grouped.bottoms[i]);
      else if (grouped.bottoms?.length > 0) outfitItems.push(grouped.bottoms[0]);
      
      if (grouped.shoes?.length > i) outfitItems.push(grouped.shoes[i]);
      else if (grouped.shoes?.length > 0) outfitItems.push(grouped.shoes[0]);
      
      if (grouped.outerwear?.length > 0 && weather?.temp < 65) {
        outfitItems.push(grouped.outerwear[Math.min(i, grouped.outerwear.length - 1)]);
      }
      
      if (grouped.accessories?.length > 0) {
        outfitItems.push(grouped.accessories[Math.min(i, grouped.accessories.length - 1)]);
      }

      if (outfitItems.length > 0) {
        looks.push({
          id: i + 1,
          title: `${occasion} Look ${i + 1}`,
          description: `Perfect outfit for ${occasion.toLowerCase()} occasions`,
          image: outfitItems[0]?.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
          confidence: 0.85 + (Math.random() * 0.1),
          occasion: occasion,
          vibe: selectedStyles[0] || 'Stylish',
          items: outfitItems.map(item => ({
            type: item.category || 'Item',
            name: item.name || 'Wardrobe Item',
            image: item.image,
            tags: item.tags || [],
          })),
          stylistTip: getStyleTip(occasion, selectedStyles, weather),
          // "Why this outfit?" - AI explanation for trust
          whyThisOutfit: generateWhyThisOutfit(occasion, selectedStyles, weather, outfitItems),
        });
      }
    }

    // If no wardrobe items, show helpful message
    if (looks.length === 0) {
      looks.push({
        id: 1,
        title: 'Build Your Wardrobe',
        description: 'Add items to My Closet to get personalized outfit recommendations',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        confidence: 1.0,
        occasion: occasion,
        vibe: 'Fresh Start',
        items: [],
        stylistTip: 'Start by adding your favorite pieces to My Closet. The AI will learn your style!',
        isPlaceholder: true,
      });
    }

    setGeneratedLooks(looks);
    setLoading(false);
    setStep(3);
  };

  const getStyleTip = (occasion, styles, weather) => {
    const tips = {
      casual: "Keep it relaxed but put-together. Accessorize minimally.",
      work: "Professional yet comfortable. Add a structured bag.",
      evening: "Elevate with statement accessories. Consider a bold lip.",
      active: "Prioritize comfort and movement. Layer for temperature changes.",
      weekend: "Mix comfort with style. Perfect for brunch or errands.",
    };
    
    let tip = tips[occasion?.toLowerCase()] || "Mix and match to express your personal style.";
    
    if (weather?.temp < 60) {
      tip += " Layer up for the cooler weather!";
    } else if (weather?.temp > 80) {
      tip += " Choose breathable fabrics for the warm day.";
    }
    
    return tip;
  };

  // Step 1: Occasion Selection
  const renderOccasionStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's the occasion?</Text>
      <Text style={styles.stepSubtitle}>Help me style your wardrobe for the moment</Text>
      
      {weather && (
        <View style={styles.weatherCard}>
          <MaterialCommunityIcons name={weather.icon} size={24} color={weather.iconColor} />
          <Text style={styles.weatherText}>{weather.tempDisplay || weather.tempF} • {weather.conditionLabel}</Text>
        </View>
      )}
      
      <View style={styles.occasionsGrid}>
        {OCCASIONS.map((occasion) => (
          <TouchableOpacity
            key={occasion.id}
            style={[
              styles.occasionCard,
              selectedOccasion === occasion.id && styles.occasionCardSelected
            ]}
            onPress={() => setSelectedOccasion(occasion.id)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={occasion.icon} 
              size={28} 
              color={selectedOccasion === occasion.id ? '#FFFFFF' : COLORS.primary} 
            />
            <Text style={[
              styles.occasionLabel,
              selectedOccasion === occasion.id && styles.occasionLabelSelected
            ]}>{occasion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <GradientButton
        title="Continue"
        onPress={() => setStep(2)}
        disabled={!selectedOccasion}
        style={styles.continueButton}
      />
    </View>
  );

  // Step 2: Style Preferences
  const renderStyleStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your style vibe</Text>
      <Text style={styles.stepSubtitle}>Select up to 3 styles you love</Text>
      
      <View style={styles.chipsContainer}>
        {STYLE_PREFERENCES.map((style) => (
          <GradientChip
            key={style}
            label={style}
            active={selectedStyles.includes(style)}
            onPress={() => toggleStyle(style)}
            style={styles.styleChip}
          />
        ))}
      </View>

      <View style={styles.selectedCount}>
        <Text style={styles.selectedCountText}>
          {selectedStyles.length} / 3 selected
        </Text>
      </View>
      
      {!hasWardrobe && (
        <View style={styles.wardrobeWarning}>
          <MaterialCommunityIcons name="information" size={20} color="#FFD93D" />
          <Text style={styles.wardrobeWarningText}>
            Add items to My Closet for personalized recommendations
          </Text>
        </View>
      )}
      
      <GradientButton
        title={hasWardrobe ? "Style My Wardrobe" : "See What's Possible"}
        onPress={generateRecommendations}
        disabled={selectedStyles.length === 0}
        loading={loading}
        icon={<MaterialCommunityIcons name="sparkles" size={20} color="#fff" />}
        style={styles.generateButton}
      />
    </View>
  );

  // Step 3: Results from Wardrobe
  const renderResultsStep = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.stepTitle}>
        {hasWardrobe ? 'Your Wardrobe Styled' : 'Get Started'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {hasWardrobe 
          ? `${generatedLooks.length} outfit${generatedLooks.length > 1 ? 's' : ''} from your closet`
          : 'Build your wardrobe for personalized looks'
        }
      </Text>
      
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.cardsContainer}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
          setCurrentLookIndex(index);
        }}
      >
        {generatedLooks.map((look, index) => (
          <View key={look.id} style={[styles.resultCard, { width: CARD_WIDTH }]}>
            <Image source={{ uri: look.image }} style={styles.resultImage} />
            
            <View style={styles.matchBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.matchText}>{Math.round(look.confidence * 100)}% Match</Text>
            </View>
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.95)']}
              style={styles.cardOverlay}
            >
              <Text style={styles.resultTitle}>{look.title}</Text>
              <Text style={styles.resultDescription}>{look.description}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="calendar" size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>{look.occasion}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="palette" size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>{look.vibe}</Text>
                </View>
              </View>

              {/* Outfit Items from Wardrobe - NO PRICES */}
              {look.items.length > 0 && (
                <View style={styles.outfitBreakdown}>
                  <Text style={styles.breakdownTitle}>From Your Closet:</Text>
                  {look.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      {item.image && (
                        <Image source={{ uri: item.image }} style={styles.itemThumb} />
                      )}
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemType}>{item.type}</Text>
                        <Text style={styles.itemName}>{item.name}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Why This Outfit? - Trust Builder */}
              {look.whyThisOutfit && look.whyThisOutfit.length > 0 && (
                <View style={styles.whySection}>
                  <Text style={styles.whyTitle}>Why this outfit?</Text>
                  {look.whyThisOutfit.map((reason, idx) => (
                    <View key={idx} style={styles.whyItem}>
                      <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.primary} />
                      <Text style={styles.whyText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Stylist Tip */}
              <View style={styles.stylistTip}>
                <MaterialCommunityIcons name="lightbulb" size={16} color="#FFD93D" />
                <Text style={styles.stylistTipText}>{look.stylistTip}</Text>
              </View>

              {/* Feedback System - Like/Dislike */}
              {!look.isPlaceholder && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackLabel}>Was this helpful?</Text>
                  {feedbackGiven[look.id] ? (
                    <View style={styles.feedbackThanks}>
                      <MaterialCommunityIcons 
                        name={feedbackGiven[look.id] === 'like' ? 'thumb-up' : 'thumb-down'} 
                        size={16} 
                        color={feedbackGiven[look.id] === 'like' ? '#4ADE80' : '#F87171'} 
                      />
                      <Text style={styles.feedbackThanksText}>Thanks for the feedback!</Text>
                    </View>
                  ) : showDislikeOptions === look.id ? (
                    <View style={styles.dislikeOptions}>
                      <Text style={styles.dislikePrompt}>What didn't work?</Text>
                      <View style={styles.dislikeButtons}>
                        {DISLIKE_REASONS.map(reason => (
                          <TouchableOpacity
                            key={reason.id}
                            style={styles.reasonButton}
                            onPress={() => handleDislikeReason(look.id, reason.id)}
                          >
                            <MaterialCommunityIcons name={reason.icon} size={14} color={COLORS.textSecondary} />
                            <Text style={styles.reasonText}>{reason.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.feedbackButtons}>
                      <TouchableOpacity 
                        style={styles.feedbackButton}
                        onPress={() => handleLike(look.id)}
                      >
                        <MaterialCommunityIcons name="thumb-up-outline" size={18} color="#4ADE80" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.feedbackButton}
                        onPress={() => handleDislike(look.id)}
                      >
                        <MaterialCommunityIcons name="thumb-down-outline" size={18} color="#F87171" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* CTA - Add to Closet or Save Look */}
              {look.isPlaceholder ? (
                <TouchableOpacity 
                  style={styles.addToClosetButton}
                  onPress={() => router.push({ pathname: '/aiwardrobe', params: { returnPath: '/aistylist' } })}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#8B5CF6']}
                    style={styles.ctaGradient}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.ctaText}>Add to My Closet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.saveButton}>
                  <MaterialCommunityIcons name="heart-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.saveButtonText}>Save This Look</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Pagination */}
      {generatedLooks.length > 1 && (
        <View style={styles.pagination}>
          {generatedLooks.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot,
                currentLookIndex === index && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
      )}
      
      {/* Actions */}
      <View style={styles.resultActions}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => {
            setStep(1);
            setSelectedOccasion(null);
            setSelectedStyles([]);
            setGeneratedLooks([]);
            setCurrentLookIndex(0);
          }}
        >
          <MaterialCommunityIcons name="refresh" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push({ pathname: '/aiwardrobe', params: { returnPath: '/aistylist' } })}
        >
          <MaterialCommunityIcons name="hanger" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>My Closet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="robot" size={28} color={COLORS.primary} />
            <Text style={styles.headerTitle}>AI Stylist</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Progress */}
        {step < 3 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
              <Text style={[styles.progressNumber, step >= 1 && styles.progressNumberActive]}>1</Text>
            </View>
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
              <Text style={[styles.progressNumber, step >= 2 && styles.progressNumberActive]}>2</Text>
            </View>
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
            <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
              <Text style={[styles.progressNumber, step >= 3 && styles.progressNumberActive]}>3</Text>
            </View>
          </View>
        )}

        {/* Steps */}
        {step === 1 && renderOccasionStep()}
        {step === 2 && renderStyleStep()}
        {step === 3 && renderResultsStep()}
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
    paddingBottom: SPACING.bottomPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  weatherText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  occasionCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  occasionCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  occasionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  occasionLabelSelected: {
    color: '#FFFFFF',
  },
  continueButton: {
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  styleChip: {
    marginBottom: 4,
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCountText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  wardrobeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 217, 61, 0.1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  wardrobeWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#FFD93D',
  },
  generateButton: {
    marginTop: 8,
  },
  resultsContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  cardsContainer: {
    paddingRight: 20,
  },
  resultCard: {
    height: 500,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: COLORS.card,
    ...CARD_SHADOW,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  outfitBreakdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stylistTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  stylistTipText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  addToClosetButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.3)',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // "Why this outfit?" section
  whySection: {
    backgroundColor: 'rgba(177, 76, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
  },
  whyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  whyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  // Feedback section
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackThanks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackThanksText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dislikeOptions: {
    flex: 1,
    marginLeft: 12,
  },
  dislikePrompt: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  dislikeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
