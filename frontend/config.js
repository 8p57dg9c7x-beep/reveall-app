import Constants from 'expo-constants';

// Stable locked configuration
const STABLE_API_URL = 'https://social-granted-runner-mas.trycloudflare.com';
const BUILD_VERSION = 'v0.4.1 (Dec 7)';

// Get API URL from expo constants (injected via app.config.js)
const getApiUrl = () => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const finalUrl = configUrl || envUrl || STABLE_API_URL;
  
  console.log(`✅ REVEAL ${BUILD_VERSION} | API: ${finalUrl.substring(0, 50)}...`);
  
  return finalUrl;
};

export const API_BASE_URL = getApiUrl();
export { BUILD_VERSION };

export default {
  API_BASE_URL,
  BUILD_VERSION,
};
