// src/components/Screens/HomeScreen.jsx
import React from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import SapButton from '../Common/SapButton';

const HomeScreen = () => {
  const { navigateToTransaction } = useTransaction();
  const { user, checkIsAdmin } = useAuth();

  return (
    <div style={{ padding: '12px' }}>
      {/* Quick Access to Dashboard */}
      <div 
        onClick={() => navigateToTransaction('ZDASH')}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '12px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💰</span> Expense Dashboard
          </h2>
          <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '12px' }}>
            Track your expenses, view analytics, and manage your spending
          </p>
        </div>
        <div style={{ fontSize: '24px' }}>→</div>
      </div>

      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>📦 SAP Easy Access - Expense Tracker</span>
        </div>
        <div className="sap-panel-content">
          <h2 style={{ marginBottom: '16px', color: 'var(--sap-brand)', fontSize: '16px' }}>
            Welcome, {user?.firstName}! 👋
          </h2>
          <p style={{ marginBottom: '12px', lineHeight: '1.5', fontSize: '12px' }}>
            This is a comprehensive expense tracking application built with React. 
            Track your daily expenses, categorize spending, and view detailed analytics.
          </p>
          
          <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '13px' }}>
            📋 Available Transactions:
          </h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6', fontSize: '12px' }}>
            <li><strong>ZDASH</strong> - Expense Dashboard & Analytics</li>
            <li><strong>VA01</strong> - Add New Expense</li>
            <li><strong>VA02</strong> - Edit Existing Expense</li>
            <li><strong>VA03</strong> - View All Expenses</li>
            <li><strong>MM01-03</strong> - Material Management</li>
            <li><strong>SE16</strong> - Data Browser</li>
            <li><strong>SU01</strong> - User Profile & Settings</li>
            {checkIsAdmin() && <li><strong>ZADMIN</strong> - User Administration</li>}
          </ul>

          <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '13px' }}>
            💡 Quick Tips:
          </h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6', fontSize: '12px' }}>
            <li>Use <strong>VA01</strong> to quickly add new expenses</li>
            <li>View spending trends in the <strong>Dashboard</strong></li>
            <li>Categorize expenses for better tracking</li>
            <li>Export your data using the <strong>Extras</strong> menu</li>
            <li>Press <strong>F3</strong> to go back from any screen</li>
          </ul>

          {/* Quick Action Buttons */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <SapButton onClick={() => navigateToTransaction('ZDASH')} type="primary" icon="📊">
              Dashboard
            </SapButton>
            <SapButton onClick={() => navigateToTransaction('VA01')} icon="➕">
              Add Expense
            </SapButton>
            <SapButton onClick={() => navigateToTransaction('VA03')} icon="👁️">
              View Expenses
            </SapButton>
            <SapButton onClick={() => navigateToTransaction('SE16')} icon="🔍">
              Data Browser
            </SapButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;