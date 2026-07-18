// src/components/Common/QuickExport.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createBackup } from '../../utils/fileSystem';
import { useTransaction } from '../../context/TransactionContext';

const QuickExport = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { updateStatus, isTransactionActive } = useTransaction();

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

  const handleQuickBackup = () => {
    if (isTransactionActive) {
      updateStatus('Please exit current transaction first', 'warning');
      return;
    }
    
    const result = createBackup();
    updateStatus(result.message, result.success ? 'success' : 'error');
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="sap-toolbar-button"
        title="Quick Export"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: 'auto',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        💾 ▼
      </button>
      
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          border: '1px solid var(--sap-border)',
          borderRadius: '4px',
          boxShadow: 'var(--sap-shadow-medium)',
          zIndex: 1000,
          minWidth: '180px',
          marginTop: '4px'
        }}>
          <div
            onClick={handleQuickBackup}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--sap-highlight)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>💾</span>
            <span>Quick Backup</span>
          </div>
          <div style={{ borderTop: '1px solid var(--sap-border)' }} />
          <div
            onClick={() => {
              updateStatus('Open Extras → Export Data for more options', 'info');
              setShowDropdown(false);
            }}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: 'var(--sap-text-secondary)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--sap-highlight)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📁</span>
            <span>More Options...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickExport;