// src/components/Screens/UserProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import styles from './UserProfileScreen.module.css';
import SapButton from '../Common/SapButton';
import SapInput from '../Common/SapInput';
import SapSelect from '../Common/SapSelect';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useConfirm } from '../../context/ConfirmContext';
import { 
  getUsers, 
  updateUserProfile, 
  changePassword 
} from '../../utils/storage';

const UserProfileScreen = () => {
  const { updateStatus, markAsChanged, markAsSaved } = useTransaction();
  const { user } = useAuth();
  const { settings, updateSetting, saveSettings, resetSettings } = useSettings();
  const { confirm } = useConfirm();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [originalData, setOriginalData] = useState({});
  const [saveAnimation, setSaveAnimation] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (user?.userId) {
      const users = getUsers();
      const currentUser = users.find(u => u.id === user.userId);
      if (currentUser) {
        const data = {
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          department: currentUser.department || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          city: currentUser.city || '',
          country: currentUser.country || ''
        };
        setProfileData(data);
        setOriginalData(data);
      }
    }
  }, [user?.userId]);

  // Handle profile field change
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    markAsChanged();
  };

  // Save profile
  const handleSaveProfile = () => {
    setSaveAnimation(true);
    const result = updateUserProfile(user.userId, profileData);
    
    setTimeout(() => {
      setSaveAnimation(false);
      if (result.success) {
        setOriginalData(profileData);
        markAsSaved();
        updateStatus('Profile updated successfully', 'success');
      } else {
        updateStatus(result.message || 'Failed to update profile', 'error');
      }
    }, 600);
  };

  // Reset profile changes
  const handleResetProfile = () => {
    setProfileData(originalData);
    markAsSaved();
    updateStatus('Changes discarded', 'info');
  };

  // Handle password change
  const handleChangePassword = () => {
    setPasswordError('');

    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    const result = changePassword(
      user.userId, 
      passwordData.currentPassword, 
      passwordData.newPassword
    );

    if (result.success) {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      updateStatus('Password changed successfully', 'success');
    } else {
      setPasswordError(result.message);
    }
  };

  // Handle settings change
  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
    updateStatus(`Setting updated: ${key}`, 'success');
  };

  // Calculate session duration
  const calculateDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get user initials
  const getInitials = () => {
    const first = profileData.firstName?.[0] || user?.username?.[0] || '';
    const last = profileData.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  // Check if profile has changes
  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '🔐' }
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>{getInitials()}</span>
              <div className={styles.avatarStatus} />
              <button className={styles.avatarEdit}>
                <span>📷</span>
              </button>
            </div>
            
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>
                {profileData.firstName && profileData.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : user?.fullName || user?.username}
              </h1>
              <p className={styles.userRole}>
                <span className={`${styles.roleBadge} ${user?.isAdmin ? styles.admin : ''}`}>
                  {user?.role}
                </span>
                <span className={styles.userDept}>
                  {profileData.department || 'No Department'}
                </span>
              </p>
              <p className={styles.userEmail}>
                {profileData.email || 'No email set'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🕐</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {user?.loginTime ? calculateDuration(user.loginTime) : '-'}
                </span>
                <span className={styles.statLabel}>Session</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🏢</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{user?.client || '100'}</span>
                <span className={styles.statLabel}>Client</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🔑</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{user?.userId}</span>
                <span className={styles.statLabel}>User ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.id === 'profile' && hasChanges && (
                <span className={styles.tabBadge}>●</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              {/* Personal Information Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>👤</span>
                  <h3 className={styles.cardTitle}>Personal Information</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Username</label>
                    <div className={styles.readOnlyField}>
                      {user?.username}
                      <span className={styles.lockIcon}>🔒</span>
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>First Name</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Last Name</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="name@company.com"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      className={styles.input}
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Work Information Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>🏢</span>
                  <h3 className={styles.cardTitle}>Work Information</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Role</label>
                    <div className={styles.readOnlyField}>
                      {user?.role}
                      <span className={styles.lockIcon}>🔒</span>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Department</label>
                    <select
                      className={styles.select}
                      value={profileData.department}
                      onChange={(e) => handleProfileChange('department', e.target.value)}
                    >
                      <option value="">Select Department</option>
                      <option value="Sales">Sales</option>
                      <option value="Purchasing">Purchasing</option>
                      <option value="Finance">Finance</option>
                      <option value="IT">IT</option>
                      <option value="HR">Human Resources</option>
                      <option value="Production">Production</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Address</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={profileData.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>City</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={profileData.city}
                        onChange={(e) => handleProfileChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Country</label>
                      <select
                        className={styles.select}
                        value={profileData.country}
                        onChange={(e) => handleProfileChange('country', e.target.value)}
                      >
                        <option value="">Select Country</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IN">India</option>
                        <option value="CN">China</option>
                        <option value="JP">Japan</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button 
                className={`${styles.btnPrimary} ${saveAnimation ? styles.saving : ''}`}
                onClick={handleSaveProfile}
                disabled={!hasChanges}
              >
                {saveAnimation ? (
                  <>
                    <span className={styles.spinner}></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Changes
                  </>
                )}
              </button>
              <button 
                className={styles.btnSecondary}
                onClick={handleResetProfile}
                disabled={!hasChanges}
              >
                <span>↩️</span>
                Discard Changes
              </button>
              <button 
                className={styles.btnOutline}
                onClick={() => setShowPasswordModal(true)}
              >
                <span>🔑</span>
                Change Password
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <div className={styles.settingsGrid}>
              {/* Display Settings */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>🎨</span>
                  <h3 className={styles.cardTitle}>Display</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Theme</span>
                      <span className={styles.settingDesc}>Choose your preferred color scheme</span>
                    </div>
                    <div className={styles.themeToggle}>
                      <button
                        className={`${styles.themeBtn} ${settings.theme === 'light' ? styles.active : ''}`}
                        onClick={() => handleSettingChange('theme', 'light')}
                      >
                        ☀️ Light
                      </button>
                      <button
                        className={`${styles.themeBtn} ${settings.theme === 'dark' ? styles.active : ''}`}
                        onClick={() => handleSettingChange('theme', 'dark')}
                      >
                        🌙 Dark
                      </button>
                    </div>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Font Size</span>
                      <span className={styles.settingDesc}>Adjust text size for better readability</span>
                    </div>
                    <select
                      className={styles.settingSelect}
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Code Theme</span>
                      <span className={styles.settingDesc}>Syntax highlighting for code blocks</span>
                    </div>
                    <select
                      className={styles.settingSelect}
                      value={settings.codeTheme}
                      onChange={(e) => handleSettingChange('codeTheme', e.target.value)}
                    >
                      <option value="Dracula">🦇 Dracula</option>
                      <option value="MacOS">💻 MacOS</option>
                      <option value="Githubdark">🐙 GitHub Dark</option>
                      <option value="Glass">🧊 Glass</option>
                      <option value="Cyberpunk">🤖 Cyberpunk</option>
                      <option value="TokyoNight">🗼 Tokyo Night</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Rows Per Page</span>
                      <span className={styles.settingDesc}>Number of items to display in tables</span>
                    </div>
                    <select
                      className={styles.settingSelect}
                      value={settings.rowsPerPage?.toString()}
                      onChange={(e) => handleSettingChange('rowsPerPage', parseInt(e.target.value))}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Format Settings */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>📅</span>
                  <h3 className={styles.cardTitle}>Formats</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Date Format</span>
                      <span className={styles.settingDesc}>How dates are displayed</span>
                    </div>
                    <select
                      className={styles.settingSelect}
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Time Format</span>
                      <span className={styles.settingDesc}>12-hour or 24-hour clock</span>
                    </div>
                    <select
                      className={styles.settingSelect}
                      value={settings.timeFormat}
                      onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                    >
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Number Format</span>
                      <span className={styles.settingDesc}>Decimal and thousand separators</span>
                    </div>
                    <select
                      className={styles.settingSelect}
                      value={settings.decimalNotation}
                      onChange={(e) => handleSettingChange('decimalNotation', e.target.value)}
                    >
                      <option value="1,234,567.89">1,234,567.89</option>
                      <option value="1.234.567,89">1.234.567,89</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Behavior Settings */}
              <div className={`${styles.card} ${styles.fullWidth}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>⚙️</span>
                  <h3 className={styles.cardTitle}>Behavior</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.toggleGrid}>
                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Confirm on Exit</span>
                        <span className={styles.toggleDesc}>Ask before leaving unsaved changes</span>
                      </div>
                      <div className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settings.confirmOnExit}
                          onChange={(e) => handleSettingChange('confirmOnExit', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </div>
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Show Tooltips</span>
                        <span className={styles.toggleDesc}>Display helpful hints on hover</span>
                      </div>
                      <div className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settings.showTooltips}
                          onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </div>
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Notifications</span>
                        <span className={styles.toggleDesc}>Show system notifications</span>
                      </div>
                      <div className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settings.showNotifications}
                          onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </div>
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Sound Effects</span>
                        <span className={styles.toggleDesc}>Play sounds for actions</span>
                      </div>
                      <div className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settings.soundEnabled}
                          onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Settings Button */}
            <div className={styles.actions}>
              <button 
                className={styles.btnDanger}
                onClick={async () => {
                  const confirmed = await confirm('Reset all settings to default? This cannot be undone.');
                  if (confirmed) {
                    resetSettings();
                    updateStatus('Settings reset to default', 'success');
                  }
                }}
              >
                <span>🔄</span>
                Reset to Defaults
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className={styles.tabContent}>
            {/* Info Banner */}
            <div className={styles.infoBanner}>
              <span className={styles.infoIcon}>ℹ️</span>
              <span>Account information is managed by your administrator. Contact support for changes.</span>
            </div>

            <div className={styles.accountGrid}>
              {/* Account Details */}
              <div className={styles.accountCard}>
                <div className={styles.accountCardHeader}>
                  <span>📋</span>
                  <h4>Account Details</h4>
                </div>
                <div className={styles.accountCardContent}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>User ID</span>
                    <span className={styles.detailValue}>{user?.userId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Username</span>
                    <span className={styles.detailValue}>{user?.username}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Role</span>
                    <span className={`${styles.badge} ${user?.isAdmin ? styles.badgeAdmin : styles.badgeUser}`}>
                      {user?.role}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Client</span>
                    <span className={styles.detailValue}>{user?.client}</span>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className={styles.accountCard}>
                <div className={styles.accountCardHeader}>
                  <span>🔐</span>
                  <h4>Current Session</h4>
                </div>
                <div className={styles.accountCardContent}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Login Time</span>
                    <span className={styles.detailValue}>
                      {user?.loginTime ? new Date(user.loginTime).toLocaleString() : '-'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Duration</span>
                    <span className={styles.detailValue}>
                      {user?.loginTime ? calculateDuration(user.loginTime) : '-'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      <span className={styles.statusDot}></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className={`${styles.accountCard} ${styles.fullWidth}`}>
                <div className={styles.accountCardHeader}>
                  <span>🔓</span>
                  <h4>Permissions & Access</h4>
                </div>
                <div className={styles.accountCardContent}>
                  <div className={styles.permissionsGrid}>
                    <div className={styles.permissionItem}>
                      <span className={styles.permissionIcon}>📦</span>
                      <span className={styles.permissionLabel}>Materials (MM)</span>
                      <span className={`${styles.permissionBadge} ${styles.granted}`}>Granted</span>
                    </div>
                    <div className={styles.permissionItem}>
                      <span className={styles.permissionIcon}>💰</span>
                      <span className={styles.permissionLabel}>Sales (SD)</span>
                      <span className={`${styles.permissionBadge} ${styles.granted}`}>Granted</span>
                    </div>
                    <div className={styles.permissionItem}>
                      <span className={styles.permissionIcon}>🗄️</span>
                      <span className={styles.permissionLabel}>Data Browser</span>
                      <span className={`${styles.permissionBadge} ${styles.granted}`}>Granted</span>
                    </div>
                    {user?.isAdmin && (
                      <>
                        <div className={styles.permissionItem}>
                          <span className={styles.permissionIcon}>👥</span>
                          <span className={styles.permissionLabel}>User Admin</span>
                          <span className={`${styles.permissionBadge} ${styles.admin}`}>Admin</span>
                        </div>
                        <div className={styles.permissionItem}>
                          <span className={styles.permissionIcon}>⚙️</span>
                          <span className={styles.permissionLabel}>System Config</span>
                          <span className={`${styles.permissionBadge} ${styles.admin}`}>Admin</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <SapModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordError('');
        }}
        title="Change Password"
        width="420px"
        footer={
          <div className={styles.modalFooter}>
            <button 
              className={styles.btnSecondary}
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError('');
              }}
            >
              Cancel
            </button>
            <button 
              className={styles.btnPrimary}
              onClick={handleChangePassword}
            >
              Update Password
            </button>
          </div>
        }
      >
        <div className={styles.passwordForm}>
          {passwordError && (
            <div className={styles.errorMessage}>
              <span>❌</span>
              {passwordError}
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Password</label>
            <input
              type="password"
              className={styles.input}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={styles.input}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              className={styles.input}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>

          <div className={styles.passwordHint}>
            <span>💡</span>
            Password must be at least 6 characters long and different from your current password.
          </div>
        </div>
      </SapModal>
    </div>
  );
};

export default UserProfileScreen;