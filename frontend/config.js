import Constants from 'expo-constants';

// LOCAL DEVELOPMENT CONFIGURATION
const API_BASE_URL_STABLE = 'http://localhost:8001';
const BUILD_VERSION = 'v1.0.0 (Local Development)';

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
