import Constants from 'expo-constants';

// FINAL STABLE CONFIGURATION - DO NOT CHANGE
const STABLE_API_URL = 'https://officially-began-morris-audio.trycloudflare.com';
const BUILD_VERSION = 'v0.4.3 (Dec 7 - Final)';

// Get API URL from expo constants
const getApiUrl = () => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const finalUrl = configUrl || envUrl || STABLE_API_URL;
  
  console.log(`✅ REVEAL ${BUILD_VERSION}`);
  console.log(`🌐 API: ${finalUrl}`);
  
  return finalUrl;
};

export const API_BASE_URL = getApiUrl();
export { BUILD_VERSION };

export default {
  API_BASE_URL,
  BUILD_VERSION,
};
