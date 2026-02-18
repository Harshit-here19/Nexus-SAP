// src/components/Screens/HomeScreen.jsx
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import QuickTips from '../Layout/QuickTips';

const HomeScreen = () => {
  const { navigateToTransaction } = useTransaction();
  const { user, checkIsAdmin } = useAuth();

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ padding: '12px' }}>

      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>📦 SAP Easy Access - Expense Tracker</span>
        </div>
        <div className="sap-panel-content">
          <h2 style={{ marginBottom: '16px', color: 'var(--sap-brand)', fontSize: '16px' }}>
            Welcome, {user?.firstName}! 👋
          </h2>
          <div>
            <p style={{ marginBottom: '12px', fontSize: '12px', lineHeight: '1.6' }}>
              This is a comprehensive personal management application built with React,
              designed to help you track both your finances and entertainment consumption.
            </p>

            <div style={{ fontSize: '12px', lineHeight: '1.6', marginBottom: '8px' }}>
              <strong style={{ color: 'var(--sap-brand)' }}>💰 Expense Tracking:</strong>
              <br />
              Record daily expenses, categorize spending by type, track payment methods and vendors,
              add receipt numbers, manage recurring expenses, and view detailed spending analytics.
            </div>

            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--sap-brand)' }}>🎬 Entertainment Wishlist:</strong>
              <br />
              Manage your watch/play/read list across multiple categories including movies (MO),
              series (SE), anime (AN), webtoons/manhwa (WE), games (GA), and content (HE/PO).
              Track progress with episode/chapter counters, rate items 1-10 stars, organize by genres and tags,
              set priorities, and monitor viewing habits with start/end dates.
            </div>
          </div>

          <div style={{
            fontFamily: `'Arial', 'Verdana', sans-serif`,
            backgroundColor: '#e6f0fa', // light SAP blue background
            border: '1px solid #7baedc', // medium blue border
            borderRadius: '4px',
            padding: '15px',
            width: '100%',
            maxWidth: '280px',
            color: '#003366', // classic SAP dark blue text
            margin: isMobile ? '20px auto' : '20px',
          }}>
            <h3 style={{
              marginTop: '5px',
              marginBottom: '12px',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#ffffff',
              backgroundColor: '#0a5ea8', // SAP header blue
              padding: '4px 8px',
              borderRadius: '3px'
            }}>
              📋 Available Transactions:
            </h3>
            <ul style={{
              paddingLeft: '18px',
              lineHeight: '1.6',
              fontSize: '12px',
              backgroundColor: '#f0f4fa',
              borderRadius: '3px',
              padding: '8px'
            }}>
              <li><strong>VA01-03</strong> - Expense Management</li>
              <li><strong>MM01-03</strong> - Material Management</li>
              <li><strong>WS01-03</strong> - Wishlist Management</li>
              <li><strong>NT01-03</strong> - Notes Management</li>
              <li><strong>SE16</strong> - Data Browser</li>
              <li><strong>SU01</strong> - User Profile & Settings</li>
              <li><strong>ZDASH</strong> - Expense Dashboard & Analytics</li>
              {checkIsAdmin() && <li><strong>ZADMIN</strong> - User Administration</li>}
            </ul>
          </div>


          {!isMobile && <QuickTips />}

        </div>
      </div>

      {/* Quick Access to Dashboard */}
      <div
        onClick={() => navigateToTransaction('ZDASH')}
        style={{
          background: 'var(--sap-panel-bg)',
          border: '1px solid var(--sap-border)',
          borderLeft: '3px solid var(--sap-brand)',
          borderRadius: '3px',
          padding: '12px 14px',
          marginBottom: '12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.2s, border-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--sap-highlight)';
          e.currentTarget.style.borderLeftColor = 'var(--sap-brand-dark)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--sap-panel-bg)';
          e.currentTarget.style.borderLeftColor = 'var(--sap-brand)';
        }}
      >
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--sap-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '2px'
          }}>
            <span>📊</span> Expense Dashboard
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--sap-text-secondary)'
          }}>
            View analytics and track your spending
          </div>
        </div>
        <div style={{
          fontSize: '16px',
          color: 'var(--sap-brand)'
        }}>
          →
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;