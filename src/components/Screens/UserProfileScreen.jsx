// src/components/Screens/UserProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import SapButton from '../Common/SapButton';
import SapInput from '../Common/SapInput';
import SapSelect from '../Common/SapSelect';
import SapTabs from '../Common/SapTabs';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  getUsers, 
  updateUserProfile, 
  changePassword 
} from '../../utils/storage';

const UserProfileScreen = () => {
  const { updateStatus, markAsChanged, markAsSaved } = useTransaction();
  const { user } = useAuth();
  const { settings, updateSetting, saveSettings, resetSettings } = useSettings();
  
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
    const result = updateUserProfile(user.userId, profileData);
    if (result.success) {
      setOriginalData(profileData);
      markAsSaved();
      updateStatus('Profile updated successfully', 'success');
    } else {
      updateStatus(result.message || 'Failed to update profile', 'error');
    }
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

  // Profile Tab
  const profileTab = (
    <div className="sap-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column - Personal Info */}
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span> Personal Information
          </h4>
          
          <SapInput
            label="Username"
            value={user?.username || ''}
            readOnly={true}
          />
          
          <SapInput
            label="First Name"
            value={profileData.firstName}
            onChange={(val) => handleProfileChange('firstName', val)}
          />
          
          <SapInput
            label="Last Name"
            value={profileData.lastName}
            onChange={(val) => handleProfileChange('lastName', val)}
          />
          
          <SapInput
            label="Email"
            value={profileData.email}
            onChange={(val) => handleProfileChange('email', val)}
            type="email"
          />
          
          <SapInput
            label="Phone"
            value={profileData.phone}
            onChange={(val) => handleProfileChange('phone', val)}
          />
        </div>

        {/* Right Column - Work Info */}
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏢</span> Work Information
          </h4>
          
          <SapInput
            label="Role"
            value={user?.role || ''}
            readOnly={true}
          />
          
          <SapSelect
            label="Department"
            value={profileData.department}
            onChange={(val) => handleProfileChange('department', val)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Purchasing', label: 'Purchasing' },
              { value: 'Finance', label: 'Finance' },
              { value: 'IT', label: 'IT' },
              { value: 'HR', label: 'HR' },
              { value: 'Production', label: 'Production' },
              { value: 'Logistics', label: 'Logistics' }
            ]}
          />
          
          <SapInput
            label="Address"
            value={profileData.address}
            onChange={(val) => handleProfileChange('address', val)}
          />
          
          <SapInput
            label="City"
            value={profileData.city}
            onChange={(val) => handleProfileChange('city', val)}
          />
          
          <SapSelect
            label="Country"
            value={profileData.country}
            onChange={(val) => handleProfileChange('country', val)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'USA', label: 'United States' },
              { value: 'UK', label: 'United Kingdom' },
              { value: 'DE', label: 'Germany' },
              { value: 'FR', label: 'France' },
              { value: 'IN', label: 'India' },
              { value: 'CN', label: 'China' },
              { value: 'JP', label: 'Japan' }
            ]}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginTop: '24px', 
        paddingTop: '16px', 
        borderTop: '1px solid var(--sap-border)',
        display: 'flex',
        gap: '12px'
      }}>
        <SapButton onClick={handleSaveProfile} type="primary" icon="💾">
          Save Changes
        </SapButton>
        <SapButton onClick={handleResetProfile} icon="↩️">
          Reset Changes
        </SapButton>
        <SapButton onClick={() => setShowPasswordModal(true)} icon="🔑">
          Change Password
        </SapButton>
      </div>
    </div>
  );

  // Settings Tab
  const settingsTab = (
    <div className="sap-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Display Settings */}
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎨</span> Display Settings
          </h4>
          
          <SapSelect
            label="Theme"
            value={settings.theme}
            onChange={(val) => handleSettingChange('theme', val)}
            options={[
              { value: 'light', label: '☀️ Light' },
              { value: 'dark', label: '🌙 Dark' }
            ]}
          />
          
          <SapSelect
            label="Font Size"
            value={settings.fontSize}
            onChange={(val) => handleSettingChange('fontSize', val)}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' }
            ]}
          />
          
          <SapSelect
            label="Language"
            value={settings.language}
            onChange={(val) => handleSettingChange('language', val)}
            options={[
              { value: 'EN', label: 'English' },
              { value: 'DE', label: 'Deutsch' },
              { value: 'FR', label: 'Français' },
              { value: 'ES', label: 'Español' }
            ]}
          />
          
          <SapSelect
            label="Rows Per Page"
            value={settings.rowsPerPage.toString()}
            onChange={(val) => handleSettingChange('rowsPerPage', parseInt(val))}
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
              { value: '100', label: '100' }
            ]}
          />
        </div>

        {/* Format Settings */}
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span> Format Settings
          </h4>
          
          <SapSelect
            label="Date Format"
            value={settings.dateFormat}
            onChange={(val) => handleSettingChange('dateFormat', val)}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
            ]}
          />
          
          <SapSelect
            label="Time Format"
            value={settings.timeFormat}
            onChange={(val) => handleSettingChange('timeFormat', val)}
            options={[
              { value: '12h', label: '12 Hour (AM/PM)' },
              { value: '24h', label: '24 Hour' }
            ]}
          />
          
          <SapSelect
            label="Decimal Notation"
            value={settings.decimalNotation}
            onChange={(val) => handleSettingChange('decimalNotation', val)}
            options={[
              { value: '1,234,567.89', label: '1,234,567.89' },
              { value: '1.234.567,89', label: '1.234.567,89' }
            ]}
          />
        </div>
      </div>

      {/* Behavior Settings */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚙️</span> Behavior Settings
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '12px' 
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px',
            background: 'var(--sap-content-bg)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.confirmOnExit}
              onChange={(e) => handleSettingChange('confirmOnExit', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--sap-brand)' }}
            />
            <span>Confirm before exiting transactions</span>
          </label>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px',
            background: 'var(--sap-content-bg)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.showTooltips}
              onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--sap-brand)' }}
            />
            <span>Show tooltips</span>
          </label>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px',
            background: 'var(--sap-content-bg)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.showNotifications}
              onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--sap-brand)' }}
            />
            <span>Show notifications</span>
          </label>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px',
            background: 'var(--sap-content-bg)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--sap-brand)' }}
            />
            <span>Enable sounds</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <div style={{ 
        marginTop: '24px', 
        paddingTop: '16px', 
        borderTop: '1px solid var(--sap-border)',
        display: 'flex',
        gap: '12px'
      }}>
        <SapButton 
          onClick={() => {
            if (window.confirm('Reset all settings to default?')) {
              resetSettings();
              updateStatus('Settings reset to default', 'success');
            }
          }} 
          icon="🔄"
        >
          Reset to Defaults
        </SapButton>
      </div>
    </div>
  );

  // Account Info Tab
  const accountTab = (
    <div>
      <div className="sap-message-strip info" style={{ marginBottom: '20px' }}>
        <span className="sap-message-strip-icon">ℹ️</span>
        <span>This information is read-only. Contact your administrator for changes.</span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Account Details */}
        <div style={{
          padding: '20px',
          background: 'var(--sap-content-bg)',
          borderRadius: '8px',
          border: '1px solid var(--sap-border)'
        }}>
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Account Details
          </h4>
          <table style={{ width: '100%', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>User ID:</td>
                <td style={{ padding: '8px 0', fontWeight: '600' }}>{user?.userId}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>Username:</td>
                <td style={{ padding: '8px 0', fontWeight: '600' }}>{user?.username}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>Role:</td>
                <td style={{ padding: '8px 0' }}>
                  <span className={`sap-badge ${user?.isAdmin ? 'error' : 'info'}`}>
                    {user?.role}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>Client:</td>
                <td style={{ padding: '8px 0', fontWeight: '600' }}>{user?.client}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Session Info */}
        <div style={{
          padding: '20px',
          background: 'var(--sap-content-bg)',
          borderRadius: '8px',
          border: '1px solid var(--sap-border)'
        }}>
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔐</span> Session Information
          </h4>
          <table style={{ width: '100%', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>Login Time:</td>
                <td style={{ padding: '8px 0', fontWeight: '600' }}>
                  {user?.loginTime ? new Date(user.loginTime).toLocaleString() : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>Session Duration:</td>
                <td style={{ padding: '8px 0', fontWeight: '600' }}>
                  {user?.loginTime ? calculateDuration(user.loginTime) : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--sap-text-secondary)' }}>Status:</td>
                <td style={{ padding: '8px 0' }}>
                  <span className="sap-badge success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Permissions */}
        <div style={{
          padding: '20px',
          background: 'var(--sap-content-bg)',
          borderRadius: '8px',
          border: '1px solid var(--sap-border)'
        }}>
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔓</span> Permissions
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="sap-badge success">Materials (MM)</span>
            <span className="sap-badge success">Sales (SD)</span>
            <span className="sap-badge success">Data Browser</span>
            {user?.isAdmin && (
              <>
                <span className="sap-badge error">User Admin</span>
                <span className="sap-badge error">System Config</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: 'Profile', icon: '👤', content: profileTab },
    { label: 'Settings', icon: '⚙️', content: settingsTab },
    { label: 'Account', icon: '🔐', content: accountTab }
  ];

  return (
    <div>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">👤</span>
            User Profile - SU01
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>
              {user?.fullName}
            </span>
            <span className={`sap-badge ${user?.isAdmin ? 'error' : 'info'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <div className="sap-panel-content">
          <SapTabs tabs={tabs} />
        </div>
      </div>

      {/* Change Password Modal */}
      <SapModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordError('');
        }}
        title="🔑 Change Password"
        width="400px"
        footer={
          <>
            <SapButton onClick={() => {
              setShowPasswordModal(false);
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordError('');
            }}>
              Cancel
            </SapButton>
            <SapButton onClick={handleChangePassword} type="primary">
              Change Password
            </SapButton>
          </>
        }
      >
        <div className="sap-form">
          {passwordError && (
            <div className="sap-message-strip error" style={{ marginBottom: '16px' }}>
              <span className="sap-message-strip-icon">❌</span>
              <span>{passwordError}</span>
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
              Current Password *
            </label>
            <input
              type="password"
              className="sap-input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
              New Password *
            </label>
            <input
              type="password"
              className="sap-input"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
              Confirm New Password *
            </label>
            <input
              type="password"
              className="sap-input"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div className="sap-message-strip info">
            <span className="sap-message-strip-icon">ℹ️</span>
            <span>Password must be at least 6 characters long.</span>
          </div>
        </div>
      </SapModal>
    </div>
  );
};

export default UserProfileScreen;