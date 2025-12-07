import Constants from 'expo-constants';

// Get API URL from expo constants (injected via app.config.js)
const getApiUrl = () => {
  // First try to get from expo config
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  
  // Fallback to environment variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Final fallback (locked stable URL)
  const fallbackUrl = 'https://social-granted-runner-mas.trycloudflare.com';
  
  const finalUrl = configUrl || envUrl || fallbackUrl;
  
  console.log('🔧 Config System:');
  console.log('  - From expo config:', configUrl);
  console.log('  - From env variable:', envUrl);
  console.log('  - Using API URL:', finalUrl);
  
  return finalUrl;
};

export const API_BASE_URL = getApiUrl();

export default {
  API_BASE_URL,
};
