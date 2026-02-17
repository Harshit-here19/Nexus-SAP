// src/components/Layout/MenuBar.jsx
import React, { useState } from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useConfirm } from '../../context/ConfirmContext';

const menuItems = [
  {
    label: 'Menu',
    items: [
      { label: 'Create Session', shortcut: 'Ctrl+N', action: 'newSession' },
      { label: 'End Session', shortcut: 'Ctrl+W', action: 'endSession' },
      { separator: true },
      { label: 'User Profile', action: 'userProfile' },
      { separator: true },
      { label: 'Log Off', action: 'logOff' }
    ]
  },
  {
    label: 'Edit',
    items: [
      { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
      { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
      { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
      { separator: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: 'selectAll' }
    ]
  },
  {
    label: 'Favorites',
    items: [
      { label: 'Add to Favorites', action: 'addFavorite' },
      { label: 'Manage Favorites', action: 'manageFavorites' },
      { separator: true },
      { label: 'Download Favorites', action: 'downloadFavorites' },
      { label: 'Upload Favorites', action: 'uploadFavorites' }
    ]
  },
  {
    label: 'Extras',
    items: [
      { label: '📤 Export Data...', action: 'exportData', highlight: true },
      { label: '📥 Import Data...', action: 'importData', highlight: true },
      { separator: true },
      { label: '💾 Create Backup', action: 'createBackup' },
      { label: '📂 Restore Backup...', action: 'restoreBackup' },
      { separator: true },
      { label: '⚙️ Settings', action: 'settings' }
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Status', action: 'status' },
      { label: 'User Profile', action: 'userProfile' },
      { separator: true },
      { label: 'Own Jobs', action: 'ownJobs' },
      { label: 'Short Message', action: 'shortMessage' }
    ]
  },
  {
    label: 'Help',
    items: [
      { label: 'Application Help', shortcut: 'F1', action: 'appHelp' },
      { label: 'SAP Library', action: 'sapLibrary' },
      { separator: true },
      { label: 'About', action: 'about' }
    ]
  },{label : 'View', items: [
  { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: 'toggleSidebar' }
]}
];

const MenuBar = ({ onNewSession, onToggleSidebar, onOpenImportExport }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const { isTransactionActive, updateStatus } = useTransaction();

  const confirm = useConfirm();

  const handleMenuClick = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  const handleItemClick = (action) => {
    setActiveMenu(null);
    
    switch (action) {
      case 'newSession':
        onNewSession && onNewSession();
        break;
      case 'toggleSidebar':
        onToggleSidebar && onToggleSidebar();
        break;
      case 'exportData':
      case 'importData':
      case 'createBackup':
      case 'restoreBackup':
        if (isTransactionActive) {
          updateStatus('Please exit current transaction before importing/exporting', 'warning');
        } else {
          onOpenImportExport && onOpenImportExport(action);
        }
        break;
      case 'about':
        confirm('SAP GUI Clone v1.0\n\nBuilt with React.js\nNo backend required - uses localStorage');
        break;
      default:
        console.log('Menu action:', action);
        updateStatus(`Action "${action}" not implemented yet`, 'info');
    }
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <div className="sap-menu-bar" onMouseLeave={handleMouseLeave} style={{zIndex: 1000}}>
      {menuItems.map((menu, index) => (
        <div 
          key={index}
          className="sap-menu-item"
          onClick={() => handleMenuClick(index)}
          onMouseEnter={() => activeMenu !== null && setActiveMenu(index)}
        >
          {menu.label}
          {activeMenu === index && (
            <div className="sap-menu-dropdown">
              {menu.items.map((item, itemIndex) => (
                item.separator ? (
                  <div key={itemIndex} className="sap-menu-separator" />
                ) : (
                  <div 
                    key={itemIndex}
                    className="sap-menu-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item.action);
                    }}
                    style={{
                      background: item.highlight ? 'var(--sap-highlight)' : undefined
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="shortcut">{item.shortcut}</span>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;