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
import { useAddilets } from '../contexts/AddiletsContext';
import { COLORS, GRADIENTS, SIZES } from '../constants/theme';
import GradientButton from '../components/GradientButton';
import GradientChip from '../components/GradientChip';
import { uploadImage, pollJobResult } from '../services/revealAPI';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function AIStylistScreen() {
  const { getStylePreferences } = useAddilets();
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/stylelab';
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Preferences, 3: Results
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [generatedLooks, setGeneratedLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const scrollX = new Animated.Value(0);

  // Handle back navigation
  const handleBack = () => {
    router.push(returnPath);
  };

  // Pre-fill style preferences from Addilets when user reaches step 2
  useEffect(() => {
    if (step === 2 && selectedStyles.length === 0) {
      const addiletsPreferences = getStylePreferences();
      if (addiletsPreferences && addiletsPreferences.length > 0) {
        // Pre-select Addilets preferences that match available options
        const matching = stylePreferences.filter(style => 
          addiletsPreferences.some(pref => 
            style.toLowerCase().includes(pref.toLowerCase()) || 
            pref.toLowerCase().includes(style.toLowerCase())
          )
        );
        if (matching.length > 0) {
          setSelectedStyles(matching.slice(0, 3));
        }
      }
    }
  }, [step]);

  const stylePreferences = [
    'Streetwear', 'Luxury', 'Casual', 'Formal', 'Sporty', 'Bohemian', 
    'Minimalist', 'Vintage', 'Edgy', 'Preppy'
  ];

  const mockGenerateLooks = async () => {
    setLoading(true);
    
    try {
      // Use actual backend API if we have a photo
      if (frontPhoto) {
        console.log('🎨 Calling Reveal AI Stylist API...');
        const uploadResult = await uploadImage(frontPhoto, 'stylist', {
          preferences: selectedStyles,
        });
        
        console.log('📦 Job created:', uploadResult.jobId);
        
        // Poll for results
        const result = await pollJobResult(uploadResult.jobId);
        
        if (result.result && result.result.results) {
          // Transform backend response to match UI format
          const looks = result.result.results.map((item, index) => ({
            id: item.id || index + 1,
            image: item.image,
            confidence: item.confidence,
            tags: item.tags,
            title: item.title,
            description: item.description,
            buyLinks: item.items ? item.items.map(i => ({
              item: i.name,
              price: i.price,
              url: '#'
            })) : [],
          }));
          
          setGeneratedLooks(looks);
          setLoading(false);
          setStep(3);
          return;
        }
      }
      
      // Fallback to mock if API fails or no photo
      throw new Error('Using fallback');
    } catch (error) {
      console.log('⚠️ Using fallback mock data:', error.message);
      
      // Fallback mock results
      const mockResults = [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
          confidence: 0.95,
          tags: ['streetwear', 'casual', 'denim'],
          title: 'Urban Streetwear Look',
          description: 'Perfect for casual weekend outings',
          buyLinks: [
            { item: 'Denim Jacket', price: '$89', url: '#' },
            { item: 'White Tee', price: '$24', url: '#' },
            { item: 'Black Jeans', price: '$79', url: '#' },
          ]
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
          confidence: 0.92,
          tags: ['luxury', 'elegant', 'formal'],
          title: 'Elegant Luxury Ensemble',
          description: 'Sophisticated style for special occasions',
          buyLinks: [
            { item: 'Blazer', price: '$299', url: '#' },
            { item: 'Silk Blouse', price: '$149', url: '#' },
            { item: 'Tailored Pants', price: '$189', url: '#' },
          ]
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1445384763658-0400939829cd?w=600&q=80',
          confidence: 0.88,
          tags: ['casual', 'minimal', 'comfortable'],
          title: 'Minimalist Casual Style',
          description: 'Effortless everyday comfort',
          buyLinks: [
            { item: 'Cotton Tee', price: '$34', url: '#' },
            { item: 'Chinos', price: '$69', url: '#' },
            { item: 'Sneakers', price: '$99', url: '#' },
          ]
        },
        {
          id: 4,
          image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
          confidence: 0.90,
          tags: ['sporty', 'athleisure', 'active'],
          title: 'Sporty Athleisure',
          description: 'Active lifestyle meets street style',
          buyLinks: [
            { item: 'Track Jacket', price: '$79', url: '#' },
            { item: 'Performance Tee', price: '$45', url: '#' },
            { item: 'Joggers', price: '$65', url: '#' },
          ]
        },
      ];
      
      setGeneratedLooks(mockResults);
      setLoading(false);
      setStep(3);
    }
  };

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'Front') {
        setFrontPhoto(result.assets[0].uri);
      } else {
        setSidePhoto(result.assets[0].uri);
      }
    }
  };

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      if (selectedStyles.length < 3) {
        setSelectedStyles([...selectedStyles, style]);
      } else {
        Alert.alert('Maximum Reached', 'You can select up to 3 style preferences');
      }
    }
  };

  const renderUploadStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Upload Your Photos</Text>
      <Text style={styles.stepSubtitle}>Take or upload front and side photos for best results</Text>
      
      <View style={styles.photosRow}>
        <TouchableOpacity 
          style={styles.photoUpload}
          onPress={() => pickImage('Front')}
          activeOpacity={0.8}
        >
          {frontPhoto ? (
            <Image source={{ uri: frontPhoto }} style={styles.photoPreview} />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus" size={48} color={COLORS.primary} />
              <Text style={styles.photoLabel}>Front Photo</Text>
              <Text style={styles.photoHint}>Tap to upload</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.photoUpload}
          onPress={() => pickImage('Side')}
          activeOpacity={0.8}
        >
          {sidePhoto ? (
            <Image source={{ uri: sidePhoto }} style={styles.photoPreview} />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus" size={48} color={COLORS.primary} />
              <Text style={styles.photoLabel}>Side Photo</Text>
              <Text style={styles.photoHint}>Tap to upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <GradientButton
        title="Continue"
        onPress={() => setStep(2)}
        disabled={!frontPhoto || !sidePhoto}
        style={styles.continueButton}
      />
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Style</Text>
      <Text style={styles.stepSubtitle}>Select up to 3 style preferences</Text>
      
      <View style={styles.chipsContainer}>
        {stylePreferences.map((style) => (
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
        title="Generate Looks"
        onPress={mockGenerateLooks}
        disabled={selectedStyles.length === 0}
        icon={<MaterialCommunityIcons name="sparkles" size={20} color="#fff" />}
        style={styles.generateButton}
      />
    </View>
  );

  const renderResultsStep = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.stepTitle}>Your AI-Generated Looks</Text>
      <Text style={styles.stepSubtitle}>{generatedLooks.length} personalized outfits</Text>
      
      {/* Swipeable Cards */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
        contentContainerStyle={styles.cardsContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {generatedLooks.map((look, index) => (
          <View key={look.id} style={[styles.resultCard, { width: CARD_WIDTH }]}>
            <Image source={{ uri: look.image }} style={styles.resultImage} />
            
            {/* Overlay Info */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardOverlay}
            >
              <View style={styles.confidenceBadge}>
                <MaterialCommunityIcons name="star" size={16} color={COLORS.accent} />
                <Text style={styles.confidenceText}>{Math.round(look.confidence * 100)}% Match</Text>
              </View>
              
              <Text style={styles.resultTitle}>{look.title}</Text>
              <Text style={styles.resultDescription}>{look.description}</Text>
              
              <View style={styles.tagsRow}>
                {look.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Shopping Section */}
              <View style={styles.shoppingSection}>
                <Text style={styles.shoppingSectionTitle}>Shop This Look:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buyLinks}>
                  {look.buyLinks.map((link, idx) => (
                    <TouchableOpacity key={idx} style={styles.buyLinkCard} activeOpacity={0.8}>
                      <Text style={styles.buyLinkItem}>{link.item}</Text>
                      <Text style={styles.buyLinkPrice}>{link.price}</Text>
                      <MaterialCommunityIcons name="cart-outline" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
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
      
      <GradientButton
        title="Start New Session"
        onPress={() => {
          setStep(1);
          setFrontPhoto(null);
          setSidePhoto(null);
          setSelectedStyles([]);
          setGeneratedLooks([]);
          setCurrentLookIndex(0);
        }}
        style={styles.newSessionButton}
      />
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="robot" size={32} color={COLORS.primary} />
            <Text style={styles.headerTitle}>AI Stylist</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        {step < 3 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="shimmer" size={64} color={COLORS.primary} />
            <Text style={styles.loadingText}>Analyzing your style...</Text>
            <Text style={styles.loadingSubtext}>Generating perfect looks for you</Text>
          </View>
        ) : (
          <>
            {step === 1 && renderUploadStep()}
            {step === 2 && renderPreferencesStep()}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
    marginBottom: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.card,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  photosRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  photoUpload: {
    flex: 1,
    aspectRatio: 0.75,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(177, 76, 255, 0.3)',
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.borderRadiusCard,
  },
  photoLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  photoHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    width: '100%',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  styleChip: {
    marginRight: 0,
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedCountText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  generateButton: {
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
  },
  loadingSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  resultsContainer: {
    paddingTop: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  resultCard: {
    height: 550,
    borderRadius: SIZES.borderRadiusCard,
    overflow: 'hidden',
    marginRight: 20,
    backgroundColor: COLORS.card,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  confidenceText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(177, 76, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  shoppingSection: {
    marginTop: 8,
  },
  shoppingSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  buyLinks: {
    flexDirection: 'row',
  },
  buyLinkCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  buyLinkItem: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  buyLinkPrice: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.card,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  newSessionButton: {
    marginHorizontal: 20,
  },
});
