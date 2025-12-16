// REVEAL useInterstitialAd Hook
// Manages interstitial ad loading and display with 24-hour cooldown
// 
// IMPORTANT: This is a WEB-SAFE version that doesn't import AdMob.
// AdMob only works on native iOS/Android builds, not in web preview.
// The actual ad logic will work when running on a real device via EAS build.

import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { shouldShowAd, recordAdShown } from './adService';

// Check if we're on native platform where AdMob works
const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Custom hook for managing interstitial ads
 * Shows ad once per 24 hours when triggered
 * 
 * IMPORTANT: AdMob only works on native iOS/Android builds.
 * On web preview, this hook logs messages but doesn't show ads.
 * Test ads on real device using EAS build.
 * 
 * Usage:
 * const { showAdIfEligible } = useInterstitialAd();
 * 
 * // Call on screen entry
 * useEffect(() => {
 *   showAdIfEligible();
 * }, []);
 */
export const useInterstitialAd = () => {
  const hasCheckedRef = useRef(false);

  /**
   * Show ad if eligible (24h cooldown check)
   * Returns true if ad was shown, false otherwise
   * 
   * On web: Just logs and checks eligibility without showing ad
   * On native: Will load and show actual AdMob interstitial
   */
  const showAdIfEligible = useCallback(async () => {
    // Prevent multiple checks in same session
    if (hasCheckedRef.current) {
      console.log('📺 Already checked ad eligibility this session');
      return false;
    }
    
    hasCheckedRef.current = true;

    // Check if we should show ad (24h cooldown + pro status)
    const eligible = await shouldShowAd();
    
    if (!eligible) {
      console.log('📺 Not eligible for ad (cooldown active or pro user)');
      return false;
    }

    // On web, we just log that ad would be shown
    if (!isNativePlatform) {
      console.log('📺 [Web Preview] Ad would show here on native device');
      console.log('📺 Recording ad shown for testing cooldown...');
      await recordAdShown();
      return false;
    }

    // On native platforms, dynamically load and show the ad
    // This code path only runs on iOS/Android native builds
    console.log('📺 Native platform detected - loading AdMob...');
    
    try {
      // Dynamic import for native only (prevents web bundling issues)
      const { InterstitialAd, TestIds, AdEventType } = require('react-native-google-mobile-ads');
      
      const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxx/xxxxx';
      
      const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      // Wait for ad to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Ad load timeout')), 10000);
        
        interstitial.addAdEventListener(AdEventType.LOADED, () => {
          clearTimeout(timeout);
          resolve();
        });
        
        interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        
        interstitial.load();
      });

      // Show the ad
      console.log('📺 Showing interstitial ad...');
      await interstitial.show();
      
      // Record that we showed an ad
      await recordAdShown();
      
      return true;
    } catch (error) {
      console.log('📺 Error showing ad:', error.message);
      return false;
    }
  }, []);

  /**
   * Force show ad (bypasses cooldown - for testing only)
   */
  const forceShowAd = useCallback(async () => {
    if (!isNativePlatform) {
      console.log('📺 [Web] Cannot force show ad on web platform');
      return false;
    }
    // Native implementation would go here
    return false;
  }, []);

  /**
   * Reload the ad manually
   */
  const reloadAd = useCallback(() => {
    console.log('📺 Reload ad requested (no-op on web)');
  }, []);

  return {
    showAdIfEligible,
    forceShowAd,
    reloadAd,
    isAdReady: false, // Always false on web
    isLoading: false,
    adError: null,
    isNativePlatform,
  };
};

export default useInterstitialAd;
