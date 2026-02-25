// src/components/Auth/UserProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransaction } from '../../context/TransactionContext';
import { useSettings } from '../../context/SettingsContext';
import { useConfirm } from '../../context/ConfirmContext';
import './UserProfileDropdown.css';

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const { navigateToTransaction, isTransactionActive } = useTransaction();
  const { settings, updateSetting } = useSettings();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const confirm = useConfirm();

  const isMobile = window.innerWidth <= 786;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirm('Are you sure you want to log out?', 'danger');
    if (confirmed) {
      logout();
    }

  };

  const handleNavigateToProfile = async () => {
    setShowDropdown(false);
    if (isTransactionActive) {
      await confirm('Please exit current transaction before navigating', 'danger');
      return;
    }
    navigateToTransaction('SU01');
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSetting('theme', newTheme);
  };

  const getInitials = () => {
    if (user) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="sap-user-menu" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="sap-user-button"
      >
        <div className="sap-user-avatar">
          {getInitials()}
        </div>

        {!isMobile &&
          <>
            <span className="sap-user-name">
              {user?.username}
            </span>
            <span className="sap-user-caret">▾</span>
          </>
        }
      </button>

      {showDropdown && (
        <div className="sap-user-dropdown">

          {/* Blue Accent Bar */}
          <div className="sap-user-accent-bar" />

          {/* Header */}
          <div className="sap-user-header">
            <div className="sap-user-avatar-large">
              {getInitials()}
            </div>

            <div className="sap-user-info">
              <div className="sap-user-fullname">
                {user?.fullName}
              </div>
              <div className="sap-user-email">
                {user?.email}
              </div>

              <div className="sap-user-meta">
                <span className={`sap-badge ${user?.isAdmin ? 'admin' : ''}`}>
                  {user?.isAdmin ? '🔐 ' : ''}{user?.role}
                </span>
                <span className="sap-badge">
                  {user?.department}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="sap-user-quick-settings">
            <span>Quick Settings</span>

            {/* DO NOT TOUCH TOGGLE STYLE */}
            <button
              onClick={handleThemeToggle}
              className="theme-switch"
              aria-label={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              <span className="theme-switch-track">
                <span className="theme-switch-thumb">
                  {settings.theme === 'dark' ? '🌙' : '☀️'}
                </span>
              </span>
            </button>
          </div>

          {/* Menu */}
          <div className="sap-user-menu-items">
            <div
              onClick={handleNavigateToProfile}
              className={`sap-user-item ${isTransactionActive ? 'disabled' : ''}`}
            >
              <span className="sap-item-icon">👤</span>
              My Profile
            </div>

            <div
              onClick={() => {
                setShowDropdown(false);
                if (!isTransactionActive) navigateToTransaction('SU01');
              }}
              className={`sap-user-item ${isTransactionActive ? 'disabled' : ''}`}
            >
              <span className="sap-item-icon">⚙️</span>
              Settings
            </div>

            <div className="sap-user-divider" />

            <div
              onClick={handleLogout}
              className="sap-user-item logout"
            >
              <span className="sap-item-icon">🚪</span>
              Log Out
            </div>
          </div>

          <div className="sap-user-footer">
            Client {user?.client} • Session {new Date(user?.loginTime).toLocaleTimeString()}
          </div>

        </div>
      )}
    </div>

  );
};

export default UserProfileDropdown;