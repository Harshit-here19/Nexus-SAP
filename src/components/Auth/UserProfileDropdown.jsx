// src/components/Auth/UserProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransaction } from '../../context/TransactionContext';
import { useSettings } from '../../context/SettingsContext';
import './UserProfileDropdown.css';

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const { navigateToTransaction, isTransactionActive } = useTransaction();
  const { settings, updateSetting } = useSettings();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleNavigateToProfile = () => {
    setShowDropdown(false);
    if (isTransactionActive) {
      alert('Please exit current transaction before navigating');
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
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          color: 'white',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {getInitials()}
        </div>
        <span style={{ fontSize: '13px' }}>{user?.username}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          minWidth: '300px',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* User Info Header */}
          <div style={{
            background: 'linear-gradient(135deg, #354a5f 0%, #2c3e50 100%)',
            padding: '20px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {getInitials()}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>
                  {user?.fullName}
                </div>
                <div style={{ opacity: 0.9, fontSize: '12px' }}>
                  {user?.email}
                </div>
                <div style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    background: user?.isAdmin ? 'rgba(233,115,12,0.3)' : 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {user?.isAdmin ? '🔐 ' : ''}{user?.role}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {user?.department}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div style={{
            padding: '12px 16px',
            background: '#f5f6f7',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Quick Settings</span>
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

          {/* Menu Items */}
          <div style={{ padding: '8px 0' }}>
            <div
              onClick={handleNavigateToProfile}
              style={{
                padding: '12px 20px',
                cursor: isTransactionActive ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: isTransactionActive ? '#999' : '#32363a',
                opacity: isTransactionActive ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isTransactionActive) e.currentTarget.style.background = '#f5f6f7';
              }}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>👤</span>
              <span>My Profile</span>
              {isTransactionActive && (
                <span style={{ fontSize: '10px', color: '#999' }}>(exit transaction first)</span>
              )}
            </div>

            <div
              onClick={() => {
                setShowDropdown(false);
                if (isTransactionActive) {
                  alert('Please exit current transaction before navigating');
                  return;
                }
                navigateToTransaction('SU01');
              }}
              style={{
                padding: '12px 20px',
                cursor: isTransactionActive ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: isTransactionActive ? '#999' : '#32363a',
                opacity: isTransactionActive ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isTransactionActive) e.currentTarget.style.background = '#f5f6f7';
              }}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </div>

            <div style={{ borderTop: '1px solid #e5e5e5', margin: '8px 0' }} />

            <div
              onClick={handleLogout}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: '#bb0000'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#ffeaea'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>🚪</span>
              <span>Log Out</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: '#f7f7f7',
            padding: '10px 20px',
            fontSize: '11px',
            color: '#6a6d70',
            borderTop: '1px solid #e5e5e5'
          }}>
            Client: {user?.client} | Session: {new Date(user?.loginTime).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;