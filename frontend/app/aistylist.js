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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import GradientButton from '../components/GradientButton';
import GradientChip from '../components/GradientChip';
import { uploadImage, pollJobResult } from '../services/revealAPI';
import { getMockWeather } from '../services/weatherService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;

// Premium outfit recommendation data with structured format
const PREMIUM_RECOMMENDATIONS = [
  {
    id: 1,
    title: 'Urban Street Chic',
    description: 'Perfect for casual weekend outings with a modern edge',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    confidence: 0.95,
    occasion: 'Casual',
    season: 'Spring/Summer',
    vibe: 'Relaxed yet stylish',
    items: [
      { type: 'Top', name: 'Oversized Denim Jacket', price: '$89', brand: 'Levi\'s', color: 'Light Blue' },
      { type: 'Base', name: 'White Cotton Tee', price: '$24', brand: 'Everlane', color: 'White' },
      { type: 'Bottom', name: 'Slim Black Jeans', price: '$79', brand: 'AGOLDE', color: 'Black' },
      { type: 'Shoes', name: 'White Sneakers', price: '$95', brand: 'Veja', color: 'White' },
    ],
    totalPrice: '$287',
    tags: ['streetwear', 'casual', 'denim', 'weekend'],
    stylistTip: 'Roll up the sleeves for a more relaxed look. Add a silver chain necklace for extra edge.',
  },
  {
    id: 2,
    title: 'Elegant Evening Look',
    description: 'Sophisticated style for dinner dates and special occasions',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    confidence: 0.92,
    occasion: 'Evening',
    season: 'All Season',
    vibe: 'Elegant & refined',
    items: [
      { type: 'Top', name: 'Tailored Blazer', price: '$299', brand: 'Theory', color: 'Black' },
      { type: 'Base', name: 'Silk Blouse', price: '$149', brand: 'Reformation', color: 'Ivory' },
      { type: 'Bottom', name: 'High-Waist Trousers', price: '$189', brand: 'COS', color: 'Charcoal' },
      { type: 'Shoes', name: 'Leather Heels', price: '$175', brand: 'Sam Edelman', color: 'Nude' },
    ],
    totalPrice: '$812',
    tags: ['elegant', 'evening', 'formal', 'date-night'],
    stylistTip: 'Add gold hoop earrings and a structured clutch to complete the look.',
  },
  {
    id: 3,
    title: 'Minimalist Daily Wear',
    description: 'Effortless everyday comfort with clean lines',
    image: 'https://images.unsplash.com/photo-1445384763658-0400939829cd?w=600&q=80',
    confidence: 0.88,
    occasion: 'Everyday',
    season: 'All Season',
    vibe: 'Clean & simple',
    items: [
      { type: 'Top', name: 'Cashmere Sweater', price: '$195', brand: 'Naadam', color: 'Oatmeal' },
      { type: 'Bottom', name: 'Relaxed Chinos', price: '$69', brand: 'Uniqlo', color: 'Beige' },
      { type: 'Shoes', name: 'Leather Loafers', price: '$145', brand: 'Madewell', color: 'Cognac' },
      { type: 'Accessory', name: 'Canvas Tote', price: '$48', brand: 'Baggu', color: 'Natural' },
    ],
    totalPrice: '$457',
    tags: ['minimal', 'everyday', 'neutral', 'comfortable'],
    stylistTip: 'This palette works great with a simple watch. Less is more!',
  },
  {
    id: 4,
    title: 'Active Athleisure',
    description: 'From gym to brunch without missing a beat',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
    confidence: 0.90,
    occasion: 'Active',
    season: 'All Season',
    vibe: 'Sporty & fresh',
    items: [
      { type: 'Top', name: 'Tech Zip Hoodie', price: '$98', brand: 'Lululemon', color: 'Heather Grey' },
      { type: 'Base', name: 'Seamless Tank', price: '$58', brand: 'Alo Yoga', color: 'Black' },
      { type: 'Bottom', name: 'High-Rise Joggers', price: '$88', brand: 'Athleta', color: 'Navy' },
      { type: 'Shoes', name: 'Running Sneakers', price: '$140', brand: 'Nike', color: 'White/Grey' },
    ],
    totalPrice: '$384',
    tags: ['athleisure', 'sporty', 'comfortable', 'versatile'],
    stylistTip: 'Add a baseball cap and sleek sunglasses for the ultimate off-duty look.',
  },
];

// Occasion options
const OCCASIONS = [
  { id: 'casual', label: 'Casual', icon: 'tshirt-crew' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'date', label: 'Date Night', icon: 'heart' },
  { id: 'event', label: 'Event', icon: 'star' },
  { id: 'active', label: 'Active', icon: 'run' },
];

// Style preferences
const STYLE_PREFERENCES = [
  'Streetwear', 'Minimalist', 'Bohemian', 'Classic', 'Edgy', 
  'Preppy', 'Sporty', 'Romantic', 'Vintage', 'Modern'
];

export default function AIStylistScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/stylelab';
  
  const [step, setStep] = useState(1); // 1: Context, 2: Style, 3: Results
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [weather, setWeather] = useState(null);
  const [generatedLooks, setGeneratedLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);

  // Load weather on mount
  useEffect(() => {
    const data = getMockWeather('Los Angeles');
    setWeather(data);
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

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filter recommendations based on occasion
    let filtered = [...PREMIUM_RECOMMENDATIONS];
    if (selectedOccasion === 'active') {
      filtered = filtered.filter(r => r.occasion === 'Active' || r.tags.includes('sporty'));
    } else if (selectedOccasion === 'date' || selectedOccasion === 'event') {
      filtered = filtered.filter(r => r.occasion === 'Evening' || r.tags.includes('elegant'));
    }
    
    // Ensure we have at least 3 recommendations
    if (filtered.length < 3) {
      filtered = PREMIUM_RECOMMENDATIONS.slice(0, 4);
    }
    
    setGeneratedLooks(filtered);
    setLoading(false);
    setStep(3);
  };

  // Step 1: Context Selection (Weather-aware + Occasion)
  const renderContextStep = () => (
    <View style={styles.stepContainer}>
      {/* Weather Context Card */}
      {weather && (
        <View style={styles.weatherContext}>
          <LinearGradient
            colors={[weather.iconColor, `${weather.iconColor}80`]}
            style={styles.weatherContextGradient}
          >
            <MaterialCommunityIcons name={weather.icon} size={36} color="#FFFFFF" />
            <View style={styles.weatherContextText}>
              <Text style={styles.weatherContextTemp}>{weather.tempF} • {weather.conditionLabel}</Text>
              <Text style={styles.weatherContextSuggestion}>{weather.outfitSuggestion.style} weather</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      <Text style={styles.stepTitle}>What's the occasion?</Text>
      <Text style={styles.stepSubtitle}>Help us tailor recommendations to your day</Text>
      
      <View style={styles.occasionGrid}>
        {OCCASIONS.map((occasion) => (
          <TouchableOpacity
            key={occasion.id}
            style={[
              styles.occasionCard,
              selectedOccasion === occasion.id && styles.occasionCardActive
            ]}
            onPress={() => setSelectedOccasion(occasion.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedOccasion === occasion.id 
                ? [COLORS.primary, '#8B5CF6'] 
                : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
              }
              style={styles.occasionGradient}
            >
              <MaterialCommunityIcons 
                name={occasion.icon} 
                size={28} 
                color={selectedOccasion === occasion.id ? '#FFFFFF' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.occasionLabel,
                selectedOccasion === occasion.id && styles.occasionLabelActive
              ]}>
                {occasion.label}
              </Text>
            </LinearGradient>
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
      
      <GradientButton
        title="Generate My Looks"
        onPress={generateRecommendations}
        disabled={selectedStyles.length === 0}
        icon={<MaterialCommunityIcons name="sparkles" size={20} color="#fff" />}
        style={styles.generateButton}
      />
    </View>
  );

  // Step 3: Premium Results
  const renderResultsStep = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.stepTitle}>Your Personalized Looks</Text>
      <Text style={styles.stepSubtitle}>
        {generatedLooks.length} curated outfits for {OCCASIONS.find(o => o.id === selectedOccasion)?.label || 'you'}
      </Text>
      
      {/* Horizontal Scrollable Cards */}
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
            {/* Image */}
            <Image source={{ uri: look.image }} style={styles.resultImage} />
            
            {/* Match Badge */}
            <View style={styles.matchBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.matchText}>{Math.round(look.confidence * 100)}% Match</Text>
            </View>
            
            {/* Content Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.95)']}
              style={styles.cardOverlay}
            >
              {/* Title & Description */}
              <Text style={styles.resultTitle}>{look.title}</Text>
              <Text style={styles.resultDescription}>{look.description}</Text>
              
              {/* Occasion & Vibe */}
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

              {/* Outfit Breakdown */}
              <View style={styles.outfitBreakdown}>
                <Text style={styles.breakdownTitle}>The Look:</Text>
                {look.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemType}>{item.type}</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    </View>
                    <TouchableOpacity style={styles.itemPrice}>
                      <Text style={styles.itemPriceText}>{item.price}</Text>
                      <MaterialCommunityIcons name="cart-plus" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Stylist Tip */}
              <View style={styles.stylistTip}>
                <MaterialCommunityIcons name="lightbulb" size={16} color="#FFD93D" />
                <Text style={styles.stylistTipText}>{look.stylistTip}</Text>
              </View>

              {/* Shop All CTA */}
              <TouchableOpacity 
                style={styles.shopAllButton}
                onPress={() => router.push({ pathname: '/style', params: { returnPath: '/aistylist' } })}
              >
                <LinearGradient
                  colors={[COLORS.primary, '#8B5CF6']}
                  style={styles.shopAllGradient}
                >
                  <MaterialCommunityIcons name="shopping" size={18} color="#FFFFFF" />
                  <Text style={styles.shopAllText}>Shop This Look • {look.totalPrice}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Pagination */}
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
          <Text style={styles.secondaryButtonText}>New Search</Text>
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

        {/* Progress Indicator */}
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

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIcon}>
              <MaterialCommunityIcons name="shimmer" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.loadingText}>Creating your perfect looks...</Text>
            <Text style={styles.loadingSubtext}>Analyzing style preferences & weather</Text>
          </View>
        ) : (
          <>
            {step === 1 && renderContextStep()}
            {step === 2 && renderStyleStep()}
            {step === 3 && renderResultsStep()}
          </>
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
    paddingBottom: SPACING.bottomPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 16,
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
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
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
  // Steps
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
  // Weather Context
  weatherContext: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  weatherContextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  weatherContextText: {
    flex: 1,
  },
  weatherContextTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weatherContextSuggestion: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  // Occasion Grid
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  occasionCard: {
    width: '30%',
    borderRadius: 16,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  occasionCardActive: {
    transform: [{ scale: 1.02 }],
  },
  occasionGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
    borderRadius: 16,
  },
  occasionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  occasionLabelActive: {
    color: '#FFFFFF',
  },
  // Chips
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
    marginBottom: 24,
  },
  selectedCountText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  // Buttons
  continueButton: {
    marginTop: 8,
  },
  generateButton: {
    marginTop: 8,
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Results
  resultsContainer: {
    paddingHorizontal: SPACING.screenHorizontal,
  },
  cardsContainer: {
    paddingRight: 20,
  },
  resultCard: {
    height: 580,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
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
    color: '#FFFFFF',
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
    fontWeight: '800',
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
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  // Outfit Breakdown
  outfitBreakdown: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemBrand: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(177, 76, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  itemPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Stylist Tip
  stylistTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  stylistTipText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // Shop All
  shopAllButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  shopAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
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
  // Actions
  resultActions: {
    alignItems: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(177, 76, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
