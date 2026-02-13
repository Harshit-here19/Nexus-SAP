// src/components/Screens/HomeScreen.jsx
import React from 'react';

const HomeScreen = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>📦 SAP Easy Access - Welcome</span>
        </div>
        <div className="sap-panel-content">
          <h2 style={{ marginBottom: '20px', color: '#354a5f' }}>
            Welcome to SAP GUI Clone
          </h2>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            This is a React-based clone of the SAP GUI interface. 
            Use the transaction code field in the toolbar or navigate 
            using the tree menu on the left.
          </p>
          
          <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>
            Available Transactions:
          </h3>
          <ul style={{ paddingLeft: '24px', lineHeight: '1.8' }}>
            <li><strong>MM01</strong> - Create Material Master</li>
            <li><strong>MM02</strong> - Change Material Master</li>
            <li><strong>MM03</strong> - Display Material Master</li>
            <li><strong>VA01</strong> - Create Sales Order</li>
            <li><strong>SE16</strong> - Data Browser</li>
          </ul>

          <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>
            Quick Tips:
          </h3>
          <ul style={{ paddingLeft: '24px', lineHeight: '1.8' }}>
            <li>Enter transaction codes in the command field (e.g., /nMM01)</li>
            <li>Use the tree menu to navigate modules</li>
            <li>Data is stored locally in your browser</li>
            <li>Export/Import data using the Extras menu</li>
            <li>Press F3 to go back from any transaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;