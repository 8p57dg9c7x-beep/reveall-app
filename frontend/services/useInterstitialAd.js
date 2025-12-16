// REVEAL useInterstitialAd Hook
// Manages interstitial ad loading and display with 24-hour cooldown
// Note: AdMob only works on native builds (iOS/Android), not web preview

import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { shouldShowAd, recordAdShown, AD_UNIT_IDS } from './adService';

// Check if we're on native platform where AdMob works
const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Custom hook for managing interstitial ads
 * Shows ad once per 24 hours when triggered
 * 
 * IMPORTANT: AdMob only works on native iOS/Android builds.
 * On web, this hook gracefully skips ad functionality.
 * 
 * Usage:
 * const { showAdIfEligible, isAdReady, isLoading } = useInterstitialAd();
 * 
 * // Call on screen entry
 * useEffect(() => {
 *   showAdIfEligible();
 * }, []);
 */
export const useInterstitialAd = () => {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const interstitialRef = useRef(null);
  const hasCheckedRef = useRef(false);
  const listenersRef = useRef([]);

  // Initialize ad on mount (native only)
  useEffect(() => {
    // Skip entirely on web - don't even try to import AdMob
    if (!isNativePlatform) {
      console.log('📺 AdMob: Web platform detected, skipping ad initialization');
      return;
    }

    // Dynamically require AdMob only on native platforms
    let InterstitialAd, AdEventType, TestIds;
    try {
      const admob = require('react-native-google-mobile-ads');
      InterstitialAd = admob.InterstitialAd;
      AdEventType = admob.AdEventType;
      TestIds = admob.TestIds;
    } catch (e) {
      console.log('📺 AdMob module not available:', e.message);
      return;
    }

    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : AD_UNIT_IDS.INTERSTITIAL;
    
    console.log('📺 Creating interstitial ad with ID:', adUnitId);
    
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Event listeners
    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('📺 Interstitial ad loaded');
      setIsAdReady(true);
      setIsLoading(false);
    });

    const errorListener = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('📺 Interstitial ad error:', error);
      setAdError(error);
      setIsLoading(false);
      setIsAdReady(false);
    });

    const closedListener = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('📺 Interstitial ad closed');
        setIsAdReady(false);
        // Reload for next time
        interstitial.load();
      }
    );

    interstitialRef.current = interstitial;
    listenersRef.current = [loadedListener, errorListener, closedListener];

    // Preload ad
    setIsLoading(true);
    interstitial.load();

    // Cleanup
    return () => {
      listenersRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  /**
   * Show ad if eligible (24h cooldown check)
   * Returns true if ad was shown, false otherwise
   */
  const showAdIfEligible = useCallback(async () => {
    // Prevent multiple checks in same session
    if (hasCheckedRef.current) {
      console.log('📺 Already checked ad eligibility this session');
      return false;
    }
    
    hasCheckedRef.current = true;

    // Web preview - skip silently
    if (!isNativePlatform) {
      console.log('📺 Skipping ad on web platform');
      return false;
    }

    try {
      // Check if we should show ad (24h cooldown + pro status)
      const eligible = await shouldShowAd();
      
      if (!eligible) {
        console.log('📺 Not eligible for ad (cooldown or pro)');
        return false;
      }

      // Check if ad is loaded and ready
      if (!isAdReady || !interstitialRef.current) {
        console.log('📺 Ad not ready yet');
        return false;
      }

      // Show the ad
      console.log('📺 Showing interstitial ad...');
      await interstitialRef.current.show();
      
      // Record that we showed an ad
      await recordAdShown();
      
      return true;
    } catch (error) {
      console.log('📺 Error showing ad:', error);
      return false;
    }
  }, [isAdReady]);

  /**
   * Force show ad (bypasses cooldown - for testing only)
   */
  const forceShowAd = useCallback(async () => {
    if (!isNativePlatform || !interstitialRef.current || !isAdReady) {
      console.log('📺 Cannot force show - ad not ready or web platform');
      return false;
    }

    try {
      await interstitialRef.current.show();
      await recordAdShown();
      return true;
    } catch (error) {
      console.log('📺 Error force showing ad:', error);
      return false;
    }
  }, [isAdReady]);

  /**
   * Reload the ad manually
   */
  const reloadAd = useCallback(() => {
    if (!isNativePlatform || !interstitialRef.current) return;
    
    setIsLoading(true);
    setIsAdReady(false);
    interstitialRef.current.load();
  }, []);

  return {
    showAdIfEligible,
    forceShowAd,
    reloadAd,
    isAdReady,
    isLoading,
    adError,
    isNativePlatform,
  };
};

export default useInterstitialAd;
