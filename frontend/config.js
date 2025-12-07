import Constants from 'expo-constants';

// PRODUCTION CONFIGURATION - Render Backend
const API_BASE_URL_STABLE = 'https://cinescan-backend-1.onrender.com';
const BUILD_VERSION = 'v1.0.0 (Render Production)';

// Get API URL from expo constants
const getApiUrl = () => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const finalUrl = configUrl || envUrl || API_BASE_URL_STABLE;
  
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
