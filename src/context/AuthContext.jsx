// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authenticateUser,
  registerUser,
  saveSession,
  getSession,
  clearSession,
  initializeUsers,
  initializeUserData
} from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    initializeUsers();
    const session = getSession();
    
    if (session) {
      // Verify the session has all required fields
      if (session.userId && session.username) {
        // Ensure isAdmin is set correctly based on role
        const updatedSession = {
          ...session,
          isAdmin: session.role === 'Admin'
        };
        setUser(updatedSession);
        setIsAuthenticated(true);
        
        // Update session if isAdmin was missing
        if (session.isAdmin !== updatedSession.isAdmin) {
          saveSession(updatedSession);
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = useCallback((username, password) => {
    setLoginError('');
    
    if (!username || !password) {
      setLoginError('Please enter username and password');
      return false;
    }

    const result = authenticateUser(username, password);
    
    if (result.success) {
      // Double check isAdmin is set
      const userSession = {
        ...result.user,
        isAdmin: result.user.role === 'Admin'
      };
      
      setUser(userSession);
      setIsAuthenticated(true);
      saveSession(userSession);
      
      // Initialize user data
      initializeUserData(userSession.userId);
      
      // console.log('Logged in user:', userSession); // Debug log
      
      return true;
    } else {
      setLoginError(result.message);
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
  }, []);

  // Register
  const register = useCallback((userData) => {
    const result = registerUser(userData);
    return result;
  }, []);

  // Clear login error
  const clearError = useCallback(() => {
    setLoginError('');
  }, []);

  // Check if user is admin
  const checkIsAdmin = useCallback(() => {
    return user?.isAdmin === true || user?.role === 'Admin';
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    loginError,
    login,
    logout,
    register,
    clearError,
    checkIsAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;