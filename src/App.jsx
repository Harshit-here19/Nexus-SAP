// src/App.js
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider, useTransaction } from './context/TransactionContext';
import { SessionProvider } from './context/SessionContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './components/Layout/MainLayout';
import LoginScreen from './components/Auth/LoginScreen';
import HomeScreen from './components/Screens/HomeScreen';
import MaterialMasterScreen from './components/Screens/MaterialMasterScreen';
import ExpenseTrackerScreen from './components/Screens/ExpenseTrackerScreen';
import SalesOrderScreen from './components/Screens/SalesOrderScreen';
import DataBrowserScreen from './components/Screens/DataBrowserScreen';
import AdminUserScreen from './components/Screens/AdminUserScreen';
import UserProfileScreen from './components/Screens/UserProfileScreen';
import { initializeData } from './utils/storage';
import './styles/sap-theme.css';
import DashboardScreen from './components/Screens/DashboardScreen';
import EntertainmentWishlistScreen from './components/Screens/EntertainmentWishlistScreen';


// Wrapper component to connect transaction tracking with favorites
const TransactionTracker = ({ children }) => {
  const { registerTransactionCallback } = useTransaction();
  const { addTransactionToHistory } = useFavorites();

  useEffect(() => {
    registerTransactionCallback((tcode, description) => {
      addTransactionToHistory(tcode, description);
    });
  }, [registerTransactionCallback, addTransactionToHistory]);

  return children;
};

const AppContent = () => {
  const { currentTransaction } = useTransaction();
  const { isAuthenticated, isLoading, user, checkIsAdmin } = useAuth();

  useEffect(() => {
    initializeData();
  }, []);

  // Show loading while checking session
  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="sap-spinner" style={{ margin: '0 auto 16px' }}></div>
          <div>Loading SAP GUI...</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentTransaction) {
      case 'HOME':
        return <HomeScreen />;

      case 'MM01':
        return <MaterialMasterScreen mode="create" />;

      case 'MM02':
        return <MaterialMasterScreen mode="change" />;

      case 'MM03':
        return <MaterialMasterScreen mode="display" />;

      case 'VA01':
        return <ExpenseTrackerScreen mode="create" />;

      case 'VA02':
        return <ExpenseTrackerScreen mode="change" />;

      case 'VA03':
        return <ExpenseTrackerScreen mode="display" />;

      case 'SE16':
        return <DataBrowserScreen />;

      case 'ZADMIN':
        return <AdminUserScreen />;

      case 'SU01':
        return <UserProfileScreen />;

      case 'WS01':
        return <EntertainmentWishlistScreen mode='create'/>;

      case 'WS02':
        return <EntertainmentWishlistScreen mode='change'/>;

      case 'WS03':
        return <EntertainmentWishlistScreen mode='display'/>;

      case 'FB03':
        return (
          <div className="sap-panel">
            <div className="sap-panel-header">
              <span>💰 Financial Document - {currentTransaction}</span>
            </div>
            <div className="sap-panel-content">
              <div className="sap-message-strip info">
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>Financial Document screen will be implemented in future modules</span>
              </div>
            </div>
          </div>
        );

      case 'SM37':
        return (
          <div className="sap-panel">
            <div className="sap-panel-header">
              <span>📋 Job Overview - SM37</span>
            </div>
            <div className="sap-panel-content">
              <div className="sap-message-strip info">
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>Job Overview screen will be implemented in future modules</span>
              </div>
            </div>
          </div>
        );

      case 'ZDASH':
        return <DashboardScreen />;

      default:
        return (
          <div className="sap-panel">
            <div className="sap-panel-header">
              <span>⚠️ Transaction Not Found</span>
            </div>
            <div className="sap-panel-content">
              <div className="sap-message-strip warning">
                <span className="sap-message-strip-icon">⚠️</span>
                <span>
                  Transaction <strong>{currentTransaction}</strong> is not available in this system.
                </span>
              </div>
              <p style={{ marginTop: '16px' }}>
                Please try one of the following transactions:
              </p>
              <ul style={{ marginTop: '12px', paddingLeft: '24px', lineHeight: '1.8' }}>
                <li><strong>MM01</strong> - Create Material</li>
                <li><strong>MM02</strong> - Change Material</li>
                <li><strong>MM03</strong> - Display Material</li>
                <li><strong>VA01</strong> - Create Sales Order</li>
                <li><strong>VA02</strong> - Change Sales Order</li>
                <li><strong>VA03</strong> - Display Sales Order</li>
                <li><strong>SE16</strong> - Data Browser</li>
                <li><strong>SU01</strong> - User Profile</li>
                {checkIsAdmin() && (
                  <li><strong>ZADMIN</strong> - User Administration (Admin only)</li>
                )}
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <SettingsProvider>
      <FavoritesProvider>
        <SessionProvider>
          <TransactionTracker>
            <MainLayout>
              {renderScreen()}
            </MainLayout>
          </TransactionTracker>
        </SessionProvider>
      </FavoritesProvider>
    </SettingsProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppContent />
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;