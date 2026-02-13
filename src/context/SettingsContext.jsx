// src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

const SETTINGS_KEY = 'sap_user_settings';

const defaultSettings = {
  theme: 'light', // 'light', 'dark', 'blue'
  language: 'EN',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '24h',
  decimalNotation: '1,234,567.89',
  fontSize: 'medium', // 'small', 'medium', 'large'
  sidebarCollapsed: false,
  showNotifications: true,
  soundEnabled: false,
  autoLogoutMinutes: 30,
  rowsPerPage: 20,
  confirmOnExit: true,
  showTooltips: true
};

export const SettingsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings when user changes
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      loadSettings(user.userId);
    } else {
      setSettings(defaultSettings);
    }
    setIsLoading(false);
  }, [isAuthenticated, user?.userId]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
  }, [settings.theme, settings.fontSize]);

  // Load settings from localStorage
  const loadSettings = (userId) => {
    try {
      const key = `${SETTINGS_KEY}_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    }
  };

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings) => {
    if (!user?.userId) return false;
    
    try {
      const key = `${SETTINGS_KEY}_${user.userId}`;
      const merged = { ...settings, ...newSettings };
      localStorage.setItem(key, JSON.stringify(merged));
      setSettings(merged);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }, [user?.userId, settings]);

  // Update single setting
  const updateSetting = useCallback((key, value) => {
    return saveSettings({ [key]: value });
  }, [saveSettings]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    if (!user?.userId) return false;
    
    try {
      const key = `${SETTINGS_KEY}_${user.userId}`;
      localStorage.removeItem(key);
      setSettings(defaultSettings);
      return true;
    } catch (error) {
      return false;
    }
  }, [user?.userId]);

  // Apply theme to document
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      document.body.style.setProperty('--sap-content-bg', '#1a1a2e');
      document.body.style.setProperty('--sap-base', '#16213e');
      document.body.style.setProperty('--sap-text-primary', '#eaeaea');
      document.body.style.setProperty('--sap-text-secondary', '#a0a0a0');
      document.body.style.setProperty('--sap-border', '#2a2a4a');
      document.body.style.setProperty('--sap-panel-bg', '#1f1f3a');
      document.body.style.setProperty('--sap-highlight', '#2a2a4a');
    } else {
      // Reset to default light theme
      document.body.style.removeProperty('--sap-content-bg');
      document.body.style.removeProperty('--sap-base');
      document.body.style.removeProperty('--sap-text-primary');
      document.body.style.removeProperty('--sap-text-secondary');
      document.body.style.removeProperty('--sap-border');
      document.body.style.removeProperty('--sap-panel-bg');
      document.body.style.removeProperty('--sap-highlight');
    }
  };

  // Apply font size
  const applyFontSize = (size) => {
    const sizes = {
      small: '12px',
      medium: '14px',
      large: '16px'
    };
    document.documentElement.style.fontSize = sizes[size] || sizes.medium;
  };

  const value = {
    settings,
    isLoading,
    updateSetting,
    saveSettings,
    resetSettings,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;