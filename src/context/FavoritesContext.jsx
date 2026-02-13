// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getFavorites,
  addToFavorites as addFav,
  removeFromFavorites as removeFav,
  isFavorite as checkFav,
  getTransactionHistory,
  addToHistory,
  clearTransactionHistory
} from '../utils/storage';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  // Load favorites and history when user changes
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      setFavorites(getFavorites(user.userId));
      setHistory(getTransactionHistory(user.userId));
    } else {
      setFavorites([]);
      setHistory([]);
    }
  }, [isAuthenticated, user?.userId]);

  // Add to favorites
  const addToFavorites = useCallback((transaction) => {
    if (!user?.userId) return { success: false, message: 'Not logged in' };
    
    const result = addFav(transaction, user.userId);
    if (result.success) {
      setFavorites(getFavorites(user.userId));
    }
    return result;
  }, [user?.userId]);

  // Remove from favorites
  const removeFromFavorites = useCallback((tcode) => {
    if (!user?.userId) return { success: false, message: 'Not logged in' };
    
    const result = removeFav(tcode, user.userId);
    if (result.success) {
      setFavorites(getFavorites(user.userId));
    }
    return result;
  }, [user?.userId]);

  // Check if favorite
  const isFavorite = useCallback((tcode) => {
    if (!user?.userId) return false;
    return checkFav(tcode, user.userId);
  }, [user?.userId]);

  // Toggle favorite
  const toggleFavorite = useCallback((transaction) => {
    if (isFavorite(transaction.tcode)) {
      return removeFromFavorites(transaction.tcode);
    } else {
      return addToFavorites(transaction);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Add to history
  const addTransactionToHistory = useCallback((tcode, description = '') => {
    if (!user?.userId) return;
    
    addToHistory(tcode, description, user.userId);
    setHistory(getTransactionHistory(user.userId));
  }, [user?.userId]);

  // Clear history
  const clearHistory = useCallback(() => {
    if (!user?.userId) return;
    
    clearTransactionHistory(user.userId);
    setHistory([]);
  }, [user?.userId]);

  const value = {
    favorites,
    history,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    addTransactionToHistory,
    clearHistory
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;