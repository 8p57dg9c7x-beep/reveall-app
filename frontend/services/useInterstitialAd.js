// REVEAL useInterstitialAd Hook - Web Safe Version
// This version does NOT import AdMob library to prevent web bundling errors
// AdMob functionality only works on native iOS/Android builds via EAS

import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { shouldShowAd, recordAdShown } from './adService';

const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * useInterstitialAd - Shows one interstitial ad per day
 * 
 * IMPLEMENTATION NOTE:
 * - On WEB: This hook simulates ad behavior without actually showing ads
 * - On NATIVE (EAS Build): You need to create a native-specific hook that imports AdMob
 * 
 * The AdMob library (react-native-google-mobile-ads) cannot be imported in web builds.
 * For production native builds, the actual AdMob code will be in useInterstitialAd.native.js
 */
export const useInterstitialAd = () => {
  const hasCheckedRef = useRef(false);

  const showAdIfEligible = useCallback(async () => {
    if (hasCheckedRef.current) {
      console.log('📺 Ad eligibility already checked this session');
      return false;
    }
    
    hasCheckedRef.current = true;

    // Check cooldown and pro status
    const eligible = await shouldShowAd();
    
    if (!eligible) {
      console.log('📺 User not eligible for ad (cooldown or pro)');
      return false;
    }

    if (!isNativePlatform) {
      // Web preview: simulate ad shown
      console.log('📺 [WEB PREVIEW] Interstitial ad would display here on native device');
      console.log('📺 [WEB PREVIEW] Test on real device via EAS build to see actual ads');
      // Still record for testing cooldown logic
      await recordAdShown();
      return true; // Return true so we can test the cooldown
    }

    // Native: Ad would be shown here
    // For actual native implementation, use useInterstitialAd.native.js
    console.log('📺 [NATIVE] Showing interstitial ad...');
    await recordAdShown();
    return true;
  }, []);

  const forceShowAd = useCallback(async () => {
    console.log('📺 Force show ad (testing only)');
    return false;
  }, []);

  const reloadAd = useCallback(() => {
    console.log('📺 Reload ad requested');
  }, []);

  return {
    showAdIfEligible,
    forceShowAd,
    reloadAd,
    isAdReady: false,
    isLoading: false,
    adError: null,
    isNativePlatform,
  };
};

export default useInterstitialAd;
