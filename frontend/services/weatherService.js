// Weather Service for REVEAL
// Provides weather data for outfit recommendations

const WEATHER_API_KEY = 'demo'; // Will use mock data for v1, can add real API later

// Weather condition mappings for outfit recommendations
export const WEATHER_CONDITIONS = {
  sunny: { icon: 'weather-sunny', color: '#FFD93D', label: 'Sunny' },
  cloudy: { icon: 'weather-cloudy', color: '#9CA3AF', label: 'Cloudy' },
  rainy: { icon: 'weather-rainy', color: '#60A5FA', label: 'Rainy' },
  stormy: { icon: 'weather-lightning-rainy', color: '#6366F1', label: 'Stormy' },
  snowy: { icon: 'weather-snowy', color: '#E0F2FE', label: 'Snowy' },
  windy: { icon: 'weather-windy', color: '#06B6D4', label: 'Windy' },
  hot: { icon: 'weather-sunny-alert', color: '#F97316', label: 'Hot' },
  cold: { icon: 'snowflake', color: '#38BDF8', label: 'Cold' },
};

// Temperature-based outfit suggestions
export const TEMP_OUTFITS = {
  hot: { // 85°F+
    range: '85°F+',
    style: 'Light & Minimal',
    items: ['Tank top', 'Shorts', 'Sandals', 'Sunglasses'],
    colors: ['White', 'Beige', 'Pastels'],
    tip: 'Stay cool with breathable fabrics',
  },
  warm: { // 70-84°F
    range: '70-84°F',
    style: 'Casual Summer',
    items: ['T-shirt', 'Light pants', 'Sneakers', 'Cap'],
    colors: ['Light blue', 'Mint', 'Coral'],
    tip: 'Perfect weather for outdoor activities',
  },
  mild: { // 55-69°F
    range: '55-69°F',
    style: 'Light Layers',
    items: ['Long sleeve', 'Jeans', 'Light jacket', 'Boots'],
    colors: ['Earth tones', 'Navy', 'Olive'],
    tip: 'Layer up for temperature changes',
  },
  cool: { // 40-54°F
    range: '40-54°F',
    style: 'Cozy Layers',
    items: ['Sweater', 'Coat', 'Scarf', 'Ankle boots'],
    colors: ['Burgundy', 'Camel', 'Forest green'],
    tip: 'Add a warm layer for comfort',
  },
  cold: { // Below 40°F
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

// Get weather condition from code/description
export const getWeatherCondition = (description) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('rain') || desc.includes('drizzle')) return 'rainy';
  if (desc.includes('storm') || desc.includes('thunder')) return 'stormy';
  if (desc.includes('snow')) return 'snowy';
  if (desc.includes('wind')) return 'windy';
  if (desc.includes('cloud') || desc.includes('overcast')) return 'cloudy';
  return 'sunny';
};

// Get time-aware greeting
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: 'weather-sunset-up', period: 'morning' };
  if (hour < 17) return { text: 'Good Afternoon', icon: 'white-balance-sunny', period: 'afternoon' };
  if (hour < 21) return { text: 'Good Evening', icon: 'weather-sunset-down', period: 'evening' };
  return { text: 'Good Night', icon: 'weather-night', period: 'night' };
};

// Get day of week
export const getDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Get formatted date
export const getFormattedDate = () => {
  const options = { month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

// Mock weather data generator based on location (for v1)
export const getMockWeather = (location = 'Los Angeles') => {
  // Simulate different weather based on mock locations
  const weatherByLocation = {
    'Los Angeles': { temp: 75, condition: 'sunny', humidity: 45 },
    'New York': { temp: 58, condition: 'cloudy', humidity: 65 },
    'Seattle': { temp: 52, condition: 'rainy', humidity: 80 },
    'Miami': { temp: 85, condition: 'sunny', humidity: 70 },
    'Chicago': { temp: 48, condition: 'windy', humidity: 55 },
    'Denver': { temp: 62, condition: 'sunny', humidity: 30 },
  };

  const data = weatherByLocation[location] || weatherByLocation['Los Angeles'];
  const conditionData = WEATHER_CONDITIONS[data.condition];
  const tempCategory = getTempCategory(data.temp);
  const outfitSuggestion = TEMP_OUTFITS[tempCategory];

  return {
    location,
    temp: data.temp,
    tempF: `${data.temp}°F`,
    tempC: `${Math.round((data.temp - 32) * 5/9)}°C`,
    condition: data.condition,
    conditionLabel: conditionData.label,
    icon: conditionData.icon,
    iconColor: conditionData.color,
    humidity: data.humidity,
    tempCategory,
    outfitSuggestion,
    greeting: getGreeting(),
    dayOfWeek: getDayOfWeek(),
    date: getFormattedDate(),
  };
};

// Fetch real weather (placeholder for future API integration)
export const fetchWeather = async (latitude, longitude) => {
  // For v1, return mock data
  // In future, integrate with OpenWeatherMap or similar
  return getMockWeather('Los Angeles');
};

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
  getMockWeather,
  fetchWeather,
  getGreeting,
  getDayOfWeek,
  getFormattedDate,
  getTempCategory,
  getWeatherCondition,
  getWeatherOutfitImages,
  WEATHER_CONDITIONS,
  TEMP_OUTFITS,
};
