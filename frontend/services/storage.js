import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_KEY = 'watchlist';

export const getWatchlist = async () => {
  try {
    const data = await AsyncStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading watchlist:', error);
    return [];
  }
};

export const addToWatchlist = async (movie) => {
  try {
    const watchlist = await getWatchlist();
    
    // Check if already exists
    if (watchlist.find(m => m.id === movie.id)) {
      return { success: false, message: 'Already in watchlist!' };
    }

    watchlist.push(movie);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    return { success: true, message: 'Added to watchlist!' };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, message: 'Failed to add to watchlist' };
  }
};

export const removeFromWatchlist = async (movieId) => {
  try {
    const watchlist = await getWatchlist();
    const updated = watchlist.filter(m => m.id !== movieId);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, message: 'Failed to remove from watchlist' };
  }
};

export const isInWatchlist = async (movieId) => {
  try {
    const watchlist = await getWatchlist();
    return watchlist.some(m => m.id === movieId);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};
