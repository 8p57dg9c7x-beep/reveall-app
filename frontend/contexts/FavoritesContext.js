import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

const STORAGE_KEYS = {
  OUTFITS: '@reveal_favorite_outfits',
  BEAUTY: '@reveal_favorite_beauty',
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [favoriteBeauty, setFavoriteBeauty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const [outfitsData, beautyData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.OUTFITS),
        AsyncStorage.getItem(STORAGE_KEYS.BEAUTY),
      ]);

      if (outfitsData) {
        setFavoriteOutfits(JSON.parse(outfitsData));
      }
      if (beautyData) {
        setFavoriteBeauty(JSON.parse(beautyData));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save outfits to AsyncStorage
  const saveFavoriteOutfits = async (outfits) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits));
      setFavoriteOutfits(outfits);
    } catch (error) {
      console.error('Error saving favorite outfits:', error);
    }
  };

  // Save beauty looks to AsyncStorage
  const saveFavoriteBeauty = async (beauty) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BEAUTY, JSON.stringify(beauty));
      setFavoriteBeauty(beauty);
    } catch (error) {
      console.error('Error saving favorite beauty looks:', error);
    }
  };

  // Toggle outfit favorite
  const toggleOutfitFavorite = async (outfit) => {
    const isFavorite = favoriteOutfits.some(item => item.id === outfit.id);
    
    if (isFavorite) {
      const newFavorites = favoriteOutfits.filter(item => item.id !== outfit.id);
      await saveFavoriteOutfits(newFavorites);
    } else {
      const newFavorites = [...favoriteOutfits, outfit];
      await saveFavoriteOutfits(newFavorites);
    }
  };

  // Toggle beauty look favorite
  const toggleBeautyFavorite = async (look) => {
    const isFavorite = favoriteBeauty.some(item => item.id === look.id);
    
    if (isFavorite) {
      const newFavorites = favoriteBeauty.filter(item => item.id !== look.id);
      await saveFavoriteBeauty(newFavorites);
    } else {
      const newFavorites = [...favoriteBeauty, look];
      await saveFavoriteBeauty(newFavorites);
    }
  };

  // Check if outfit is favorited
  const isOutfitFavorite = (outfitId) => {
    return favoriteOutfits.some(item => item.id === outfitId);
  };

  // Check if beauty look is favorited
  const isBeautyFavorite = (beautyId) => {
    return favoriteBeauty.some(item => item.id === beautyId);
  };

  const value = {
    favoriteOutfits,
    favoriteBeauty,
    toggleOutfitFavorite,
    toggleBeautyFavorite,
    isOutfitFavorite,
    isBeautyFavorite,
    loading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
