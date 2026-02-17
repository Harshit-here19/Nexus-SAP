// src/components/Layout/MainLayout.jsx
import React, { useState } from 'react';
import MenuBar from './MenuBar';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import TreeMenu from '../Navigation/TreeMenu';
import TransactionInput from '../Navigation/TransactionInput';
import ExitConfirmModal from '../Common/ExitConfirmModal';
import ImportExportModal from '../Common/ImportExportModal';
import UserProfileDropdown from '../Auth/UserProfileDropdown';
import { useConfirm } from '../../context/ConfirmContext';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { createBackup } from '../../utils/fileSystem';

const MainLayout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showImportExport, setShowImportExport] = useState(false);

  const confirm = useConfirm();
  
  const { 
    currentTransaction, 
    isTransactionActive,
    statusMessage, 
    statusType,
    showExitConfirm,
    confirmExit,
    cancelExit,
    updateStatus
  } = useTransaction();

  const { user } = useAuth();

  const handleOpenImportExport = (action) => {
    if (action === 'createBackup') {
      const result = createBackup();
      updateStatus(result.message, result.success ? 'success' : 'error');
    } else if (action === 'restoreBackup') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const { restoreBackup } = await import('../../utils/fileSystem');
            const result = await restoreBackup(file);
            updateStatus(result.message, 'success');
            const confirmed = await confirm('Backup restored! Refresh the page to see changes?');
            if (confirmed) {
              window.location.reload();
            }
          } catch (error) {
            updateStatus(error.message, 'error');
          }
        }
      };
      input.click();
    } else {
      setShowImportExport(true);
    }
  };

  return (
    <div className="sap-window">
      {/* Title Bar */}
      <div className="sap-title-bar">
        <div className="title">
          <div className="title-icon">📦</div>
          <span>SAP Easy Access</span>
          {currentTransaction && currentTransaction !== 'HOME' && (
            <span style={{ 
              marginLeft: '16px', 
              fontWeight: 'normal',
              opacity: 0.9,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              • {currentTransaction}
              {isTransactionActive && (
                <span style={{
                  background: 'var(--sap-critical)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  🔒 ACTIVE
                </span>
              )}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <UserProfileDropdown />
          <div className="window-controls">
            <button title="Minimize">─</button>
            <button title="Maximize">□</button>
            <button title="Close" className="close">✕</button>
          </div>
        </div>
      </div>

      {/* Session Tabs */}
      {/* <SessionTabs /> */}

      {/* Menu Bar */}
      <MenuBar 
        onNewSession={() => console.log('New session')}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        onOpenImportExport={handleOpenImportExport}
      />

      {/* Toolbar with Transaction Input */}
      <Toolbar>
        <TransactionInput />
      </Toolbar>

      {/* Main Content */}
      <div className="sap-main-container">
        {sidebarVisible && <div className="sap-sidebar-overlay" onClick={() => setSidebarVisible(false)} />}
        {sidebarVisible && (
          <div className={`sap-sidebar ${sidebarVisible ? 'open' : 'collapsed'}`} >
            <TreeMenu />
          </div>
        )}
        <div className="sap-content">
          {children}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar 
        message={statusMessage} 
        type={statusType}
        user={user}
      />
      

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onStatusMessage={updateStatus}
      />
    </div>
  );
};

export default MainLayout;