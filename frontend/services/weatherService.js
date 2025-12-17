// Weather Service for REVEAL - v1 with Real Location & Weather
// Simple, reliable, and premium — never blocks UI
// Auto-detects locale for temperature units (°C for metric, °F for US)

import * as Location from 'expo-location';
import * as Localization from 'expo-localization';

// Detect if user prefers metric (Celsius) or imperial (Fahrenheit)
// US uses Fahrenheit, most of the world uses Celsius
const getUserTempPreference = () => {
  try {
    // Get device region/locale
    const region = Localization.getLocales()[0]?.regionCode || '';
    
    // Countries that use Fahrenheit: US, Bahamas, Cayman Islands, Liberia, Palau, Myanmar (primarily)
    const fahrenheitCountries = ['US', 'BS', 'KY', 'LR', 'PW', 'MM'];
    
    return fahrenheitCountries.includes(region) ? 'fahrenheit' : 'celsius';
  } catch (error) {
    console.log('Locale detection error, defaulting to Celsius:', error.message);
    return 'celsius'; // Default to metric (most of the world)
  }
};

// Export for use elsewhere
export const TEMP_UNIT = getUserTempPreference();

// OpenWeatherMap API (free tier - 1000 calls/day)
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '0c4fde9fab4de5bec9ae45330a257380';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Helper to format temperature display based on user preference
const formatTempDisplay = (tempF) => {
  if (TEMP_UNIT === 'celsius') {
    const tempC = Math.round((tempF - 32) * 5/9);
    return `${tempC}°C`;
  }
  return `${tempF}°F`;
};

// Default fallback data (Los Angeles)
const DEFAULT_WEATHER = {
  location: 'Los Angeles',
  temp: 75,
  tempF: '75°F',
  tempC: '24°C',
  tempDisplay: formatTempDisplay(75), // Auto-detected based on locale
  condition: 'sunny',
  conditionLabel: 'Sunny',
  icon: 'weather-sunny',
  iconColor: '#FFD93D',
  humidity: 45,
  tempCategory: 'warm',
  outfitSuggestion: {
    range: TEMP_UNIT === 'celsius' ? '21-29°C' : '70-84°F',
    style: 'Casual Summer',
    items: ['T-shirt', 'Light pants', 'Sneakers', 'Cap'],
    colors: ['Light blue', 'Mint', 'Coral'],
    tip: 'Perfect weather for outdoor activities',
  },
  greeting: getGreeting(),
  dayOfWeek: getDayOfWeek(),
  date: getFormattedDate(),
  isDefault: true,
};

// Weather condition mappings
export const WEATHER_CONDITIONS = {
  sunny: { icon: 'weather-sunny', color: '#FFD93D', label: 'Sunny' },
  cloudy: { icon: 'weather-cloudy', color: '#9CA3AF', label: 'Cloudy' },
  rainy: { icon: 'weather-rainy', color: '#60A5FA', label: 'Rainy' },
  stormy: { icon: 'weather-lightning-rainy', color: '#6366F1', label: 'Stormy' },
  snowy: { icon: 'weather-snowy', color: '#E0F2FE', label: 'Snowy' },
  windy: { icon: 'weather-windy', color: '#06B6D4', label: 'Windy' },
  hot: { icon: 'weather-sunny-alert', color: '#F97316', label: 'Hot' },
  cold: { icon: 'snowflake', color: '#38BDF8', label: 'Cold' },
  clear: { icon: 'weather-sunny', color: '#FFD93D', label: 'Clear' },
  mist: { icon: 'weather-fog', color: '#9CA3AF', label: 'Misty' },
};

// Temperature-based outfit suggestions
export const TEMP_OUTFITS = {
  hot: {
    range: '85°F+',
    style: 'Light & Minimal',
    items: ['Tank top', 'Shorts', 'Sandals', 'Sunglasses'],
    colors: ['White', 'Beige', 'Pastels'],
    tip: 'Stay cool with breathable fabrics',
  },
  warm: {
    range: '70-84°F',
    style: 'Casual Summer',
    items: ['T-shirt', 'Light pants', 'Sneakers', 'Cap'],
    colors: ['Light blue', 'Mint', 'Coral'],
    tip: 'Perfect weather for outdoor activities',
  },
  mild: {
    range: '55-69°F',
    style: 'Light Layers',
    items: ['Long sleeve', 'Jeans', 'Light jacket', 'Boots'],
    colors: ['Earth tones', 'Navy', 'Olive'],
    tip: 'Layer up for temperature changes',
  },
  cool: {
    range: '40-54°F',
    style: 'Cozy Layers',
    items: ['Sweater', 'Coat', 'Scarf', 'Ankle boots'],
    colors: ['Burgundy', 'Camel', 'Forest green'],
    tip: 'Add a warm layer for comfort',
  },
  cold: {
    range: 'Below 40°F',
    style: 'Winter Warm',
    items: ['Heavy coat', 'Layers', 'Beanie', 'Warm boots'],
    colors: ['Black', 'Charcoal', 'Deep red'],
    tip: 'Bundle up and stay warm',
  },
};

// Get temperature category
export const getTempCategory = (temp) => {
  if (temp >= 85) return 'hot';
  if (temp >= 70) return 'warm';
  if (temp >= 55) return 'mild';
  if (temp >= 40) return 'cool';
  return 'cold';
};

// Map OpenWeatherMap condition to our condition
const mapWeatherCondition = (weatherMain, weatherId) => {
  const main = weatherMain?.toLowerCase() || '';
  
  if (weatherId >= 200 && weatherId < 300) return 'stormy'; // Thunderstorm
  if (weatherId >= 300 && weatherId < 400) return 'rainy';  // Drizzle
  if (weatherId >= 500 && weatherId < 600) return 'rainy';  // Rain
  if (weatherId >= 600 && weatherId < 700) return 'snowy';  // Snow
  if (weatherId >= 700 && weatherId < 800) return 'mist';   // Atmosphere (fog, mist)
  if (weatherId === 800) return 'clear';                     // Clear
  if (weatherId > 800) return 'cloudy';                      // Clouds
  
  // Fallback based on main
  if (main.includes('rain') || main.includes('drizzle')) return 'rainy';
  if (main.includes('storm') || main.includes('thunder')) return 'stormy';
  if (main.includes('snow')) return 'snowy';
  if (main.includes('cloud') || main.includes('overcast')) return 'cloudy';
  if (main.includes('wind')) return 'windy';
  if (main.includes('fog') || main.includes('mist')) return 'mist';
  
  return 'clear';
};

// Get time-aware greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: 'weather-sunset-up', period: 'morning' };
  if (hour < 17) return { text: 'Good Afternoon', icon: 'white-balance-sunny', period: 'afternoon' };
  if (hour < 21) return { text: 'Good Evening', icon: 'weather-sunset-down', period: 'evening' };
  return { text: 'Good Night', icon: 'weather-night', period: 'night' };
}

// Get day of week
export function getDayOfWeek() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

// Get formatted date
export function getFormattedDate() {
  const options = { month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

// Request location permission (silent - never blocks UI)
async function getDeviceLocation() {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission not granted, using default');
      return null;
    }
    
    // Get current position (city-level accuracy is fine)
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low, // Faster, city-level
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.log('Location error (using default):', error.message);
    return null;
  }
}

// Fetch weather from OpenWeatherMap API
async function fetchWeatherFromAPI(latitude, longitude) {
  try {
    const url = `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=imperial`;
    
    const response = await fetch(url, { timeout: 5000 });
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Weather API error (using default):', error.message);
    return null;
  }
}

// Parse API response into our weather format
function parseWeatherResponse(data) {
  if (!data || !data.main || !data.weather) {
    return null;
  }
  
  const temp = Math.round(data.main.temp);
  const weatherMain = data.weather[0]?.main || 'Clear';
  const weatherId = data.weather[0]?.id || 800;
  const condition = mapWeatherCondition(weatherMain, weatherId);
  const conditionData = WEATHER_CONDITIONS[condition] || WEATHER_CONDITIONS.clear;
  const tempCategory = getTempCategory(temp);
  const outfitSuggestion = TEMP_OUTFITS[tempCategory];
  const cityName = data.name || 'Your Location';
  
  return {
    location: cityName,
    temp,
    tempF: `${temp}°F`,
    tempC: `${Math.round((temp - 32) * 5/9)}°C`,
    condition,
    conditionLabel: conditionData.label,
    icon: conditionData.icon,
    iconColor: conditionData.color,
    humidity: data.main.humidity || 50,
    tempCategory,
    outfitSuggestion,
    greeting: getGreeting(),
    dayOfWeek: getDayOfWeek(),
    date: getFormattedDate(),
    isDefault: false,
  };
}

// Main function: Get real weather (with silent fallback)
export async function fetchRealWeather() {
  try {
    // Step 1: Get device location (silent fail)
    const coords = await getDeviceLocation();
    
    if (!coords) {
      // Permission denied or error - use default silently
      return { ...DEFAULT_WEATHER, greeting: getGreeting(), dayOfWeek: getDayOfWeek(), date: getFormattedDate() };
    }
    
    // Step 2: Fetch weather from API (silent fail)
    const weatherData = await fetchWeatherFromAPI(coords.latitude, coords.longitude);
    
    if (!weatherData) {
      // API error - use default silently
      return { ...DEFAULT_WEATHER, greeting: getGreeting(), dayOfWeek: getDayOfWeek(), date: getFormattedDate() };
    }
    
    // Step 3: Parse response
    const parsed = parseWeatherResponse(weatherData);
    
    if (!parsed) {
      // Parse error - use default silently
      return { ...DEFAULT_WEATHER, greeting: getGreeting(), dayOfWeek: getDayOfWeek(), date: getFormattedDate() };
    }
    
    return parsed;
    
  } catch (error) {
    // Any unexpected error - use default silently
    console.log('Weather fetch error (using default):', error.message);
    return { ...DEFAULT_WEATHER, greeting: getGreeting(), dayOfWeek: getDayOfWeek(), date: getFormattedDate() };
  }
}

// Legacy function for backward compatibility
export function getMockWeather(location = 'Los Angeles') {
  return { ...DEFAULT_WEATHER, location, greeting: getGreeting(), dayOfWeek: getDayOfWeek(), date: getFormattedDate() };
}

// Get outfit images based on weather
export const getWeatherOutfitImages = (tempCategory) => {
  const outfitImages = {
    hot: [
      { id: 1, title: 'Summer Breeze', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', tag: 'Stay Cool' },
      { id: 2, title: 'Beach Ready', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', tag: 'UV Protection' },
      { id: 3, title: 'Effortless', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', tag: 'Breathable' },
    ],
    warm: [
      { id: 1, title: 'Casual Chic', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', tag: 'Perfect Day' },
      { id: 2, title: 'Street Style', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', tag: 'Trending' },
      { id: 3, title: 'Easy Going', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', tag: 'Comfortable' },
    ],
    mild: [
      { id: 1, title: 'Light Layers', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80', tag: 'Versatile' },
      { id: 2, title: 'Smart Casual', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80', tag: 'Work Ready' },
      { id: 3, title: 'Weekend Vibes', image: 'https://images.unsplash.com/photo-1475180429745-f689f6b5daeb?w=400&q=80', tag: 'Relaxed' },
    ],
    cool: [
      { id: 1, title: 'Cozy Layers', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&q=80', tag: 'Warm & Chic' },
      { id: 2, title: 'Autumn Ready', image: 'https://images.unsplash.com/photo-1511401139252-f158d3209c17?w=400&q=80', tag: 'Seasonal' },
      { id: 3, title: 'Sweater Weather', image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80', tag: 'Comfortable' },
    ],
    cold: [
      { id: 1, title: 'Winter Warm', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80', tag: 'Bundle Up' },
      { id: 2, title: 'Snow Ready', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&q=80', tag: 'Insulated' },
      { id: 3, title: 'Elegant Warmth', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80', tag: 'Stylish' },
    ],
  };

  return outfitImages[tempCategory] || outfitImages.warm;
};

export default {
  fetchRealWeather,
  getMockWeather,
  getGreeting,
  getDayOfWeek,
  getFormattedDate,
  getTempCategory,
  getWeatherOutfitImages,
  WEATHER_CONDITIONS,
  TEMP_OUTFITS,
};
