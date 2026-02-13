// src/components/Layout/Toolbar.jsx
import React from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useFavorites } from '../../context/FavoritesContext';
import QuickExport from '../Common/QuickExport';

const Toolbar = ({ children }) => {
  const { 
    currentTransaction, 
    isTransactionActive, 
    goBack, 
    exitTransaction, 
    cancelOperation,
    navigateToTransaction 
  } = useTransaction();

  const { isFavorite, toggleFavorite } = useFavorites();
  
  const currentIsFavorite = currentTransaction !== 'HOME' && isFavorite(currentTransaction);

  const handleToggleFavorite = () => {
    if (currentTransaction === 'HOME') return;
    
    const result = toggleFavorite({
      tcode: currentTransaction,
      label: currentTransaction
    });
    
    console.log('Toggle favorite result:', result);
  };

  const toolbarButtons = [
    { icon: '✓', title: 'Enter (Enter)', action: 'enter', always: true },
    { icon: '💾', title: 'Save (Ctrl+S)', action: 'save', always: true },
    { separator: true },
    { icon: '⬅️', title: 'Back (F3)', action: 'back', highlight: isTransactionActive },
    { icon: '🚪', title: 'Exit (Shift+F3)', action: 'exit', highlight: isTransactionActive },
    { icon: '❌', title: 'Cancel (F12)', action: 'cancel' },
    { separator: true },
    { icon: '🖨️', title: 'Print (Ctrl+P)', action: 'print' },
    { icon: '🔍', title: 'Find (Ctrl+F)', action: 'find' },
    { separator: true },
    { icon: '⏮️', title: 'First Page', action: 'firstPage' },
    { icon: '◀️', title: 'Previous Page', action: 'prevPage' },
    { icon: '▶️', title: 'Next Page', action: 'nextPage' },
    { icon: '⏭️', title: 'Last Page', action: 'lastPage' },
    { separator: true },
    { icon: '🆕', title: 'Create (F5)', action: 'create' },
    { icon: '✏️', title: 'Change (F6)', action: 'change' },
    { icon: '👁️', title: 'Display (F7)', action: 'display' },
    { icon: '🗑️', title: 'Delete', action: 'delete' },
    { separator: true },
    { 
      icon: currentIsFavorite ? '⭐' : '☆', 
      title: currentIsFavorite ? 'Remove from Favorites' : 'Add to Favorites', 
      action: 'toggleFavorite',
      disabled: currentTransaction === 'HOME',
      highlight: currentIsFavorite
    },
    { component: 'quickExport' },
    { separator: true },
    { icon: '🏠', title: 'Home', action: 'home', disabled: isTransactionActive },
  ];

  const handleButtonClick = (action) => {
    switch (action) {
      case 'back':
        goBack();
        break;
      case 'exit':
        exitTransaction();
        break;
      case 'cancel':
        cancelOperation();
        break;
      case 'home':
        if (!isTransactionActive) {
          navigateToTransaction('HOME');
        }
        break;
      case 'toggleFavorite':
        handleToggleFavorite();
        break;
      default:
        console.log('Toolbar action:', action);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F3' && !e.shiftKey) {
        e.preventDefault();
        goBack();
      } else if (e.shiftKey && e.key === 'F3') {
        e.preventDefault();
        exitTransaction();
      } else if (e.key === 'F12') {
        e.preventDefault();
        cancelOperation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, exitTransaction, cancelOperation]);

  return (
    <>
      <div className="sap-toolbar">
        {children}
        <div className="sap-toolbar-separator" />
        
        {toolbarButtons.map((btn, index) => {
          if (btn.separator) {
            return <div key={index} className="sap-toolbar-separator" />;
          }
          
          if (btn.component === 'quickExport') {
            return <QuickExport key={index} />;
          }
          
          return (
            <button
              key={index}
              className={`sap-toolbar-button ${btn.highlight ? 'highlighted' : ''} ${btn.disabled ? 'disabled' : ''}`}
              title={btn.title}
              onClick={() => handleButtonClick(btn.action)}
              disabled={btn.disabled}
            >
              <span className="button-icon">{btn.icon}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .sap-toolbar {
          display: flex;
          align-items: center;
          height: 28px;
          background: linear-gradient(to bottom, 
            #F0F4F7 0%, 
            #D9E4EC 45%, 
            #C7D9E8 50%, 
            #B5CEDF 100%);
          border-top: 1px solid #FFFFFF;
          border-bottom: 1px solid #7B9BC3;
          padding: 0 2px;
          font-family: 'Segoe UI', 'Microsoft Sans Serif', Tahoma, sans-serif;
          font-size: 11px;
        }

        .sap-toolbar-separator {
          width: 1px;
          height: 22px;
          margin: 0 3px;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            #8FA7C0 20%, 
            #8FA7C0 80%, 
            transparent 100%);
          box-shadow: 1px 0 0 rgba(255, 255, 255, 0.8);
        }

        .sap-toolbar-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          margin: 0 1px;
          padding: 0 4px;
          background: linear-gradient(to bottom, 
            #FFFFFF 0%, 
            #F4F7FA 40%, 
            #E8EFF5 60%, 
            #D6E3ED 100%);
          border: 1px solid;
          border-color: #C5D7E8 #8FA7C0 #8FA7C0 #C5D7E8;
          border-radius: 2px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.1s ease;
          position: relative;
        }

        .sap-toolbar-button:hover:not(:disabled) {
          background: linear-gradient(to bottom, 
            #FFFFFF 0%, 
            #E8F4FF 40%, 
            #C9E3FB 60%, 
            #A8CEED 100%);
          border-color: #5B9BD5 #4A84C1 #4A84C1 #5B9BD5;
          box-shadow: 0 0 3px rgba(91, 155, 213, 0.3);
        }

        .sap-toolbar-button:active:not(:disabled) {
          background: linear-gradient(to bottom, 
            #B5CEDF 0%, 
            #C7D9E8 40%, 
            #D9E4EC 60%, 
            #F0F4F7 100%);
          border-color: #4A84C1 #C5D7E8 #C5D7E8 #4A84C1;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
          padding-top: 1px;
        }

        .sap-toolbar-button:focus {
          outline: 2px solid #4A84C1;
          outline-offset: -2px;
        }

        .sap-toolbar-button.disabled {
          opacity: 0.4;
          cursor: default;
          background: linear-gradient(to bottom, 
            #F8F9FA 0%, 
            #E8EBF0 50%, 
            #D8DCE3 100%);
          border-color: #C0C8D0 #A0A8B0 #A0A8B0 #C0C8D0;
        }

        .sap-toolbar-button.highlighted {
          background: linear-gradient(to bottom, 
            #FFF4E6 0%, 
            #FFE0B2 40%, 
            #FFCC80 60%, 
            #FFB74D 100%);
          border-color: #FFA726 #F57C00 #F57C00 #FFA726;
          box-shadow: 0 0 4px rgba(255, 152, 0, 0.4);
        }

        .sap-toolbar-button.highlighted:hover:not(:disabled) {
          background: linear-gradient(to bottom, 
            #FFF8E1 0%, 
            #FFE0B2 40%, 
            #FFD54F 60%, 
            #FFC107 100%);
          border-color: #FFB300 #FF8F00 #FF8F00 #FFB300;
          box-shadow: 0 0 5px rgba(255, 152, 0, 0.6);
        }

        .button-icon {
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        /* SAP Blue theme tooltip style */
        .sap-toolbar-button[title]:hover::after {
          content: attr(title);
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          background: linear-gradient(to bottom, #F8F9FA 0%, #E8EBF0 100%);
          border: 1px solid #8FA7C0;
          border-radius: 2px;
          font-size: 11px;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          color: #1E3A5F;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        /* Specific button colors for Blue theme */
        .sap-toolbar-button[title*="Enter"] .button-icon,
        .sap-toolbar-button[title*="Save"] .button-icon {
          color: #0F7938;
          filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.8));
        }

        .sap-toolbar-button[title*="Back"] .button-icon,
        .sap-toolbar-button[title*="Exit"] .button-icon {
          color: #1565C0;
        }

        .sap-toolbar-button[title*="Cancel"] .button-icon,
        .sap-toolbar-button[title*="Delete"] .button-icon {
          color: #C62828;
        }

        .sap-toolbar-button[title*="Create"] .button-icon {
          color: #2E7D32;
        }

        .sap-toolbar-button[title*="Change"] .button-icon {
          color: #E65100;
        }

        .sap-toolbar-button[title*="Display"] .button-icon {
          color: #0277BD;
        }

        .sap-toolbar-button[title*="Print"] .button-icon,
        .sap-toolbar-button[title*="Find"] .button-icon {
          color: #424242;
        }

        .sap-toolbar-button[title*="Page"] .button-icon {
          color: #1976D2;
        }

        .sap-toolbar-button[title*="Favorite"] .button-icon {
          color: #FFA000;
          filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.5));
        }

        .sap-toolbar-button[title="Home"] .button-icon {
          color: #1565C0;
          font-size: 15px;
        }

        /* Animation for highlighted buttons */
        @keyframes sap-glow {
          0%, 100% { 
            box-shadow: 0 0 4px rgba(255, 152, 0, 0.4);
          }
          50% { 
            box-shadow: 0 0 8px rgba(255, 152, 0, 0.6);
          }
        }

        .sap-toolbar-button.highlighted {
          animation: sap-glow 1.5s ease-in-out infinite;
        }

        /* Group styling for navigation buttons */
        .sap-toolbar-button[title*="Page"] {
          min-width: 22px;
          padding: 0 2px;
        }

        /* Active transaction indicator */
        .sap-toolbar-button.highlighted:not([title*="Favorite"]) {
          background: linear-gradient(to bottom, 
            #E3F2FD 0%, 
            #BBDEFB 40%, 
            #90CAF9 60%, 
            #64B5F6 100%);
          border-color: #42A5F5 #1E88E5 #1E88E5 #42A5F5;
        }

        /* Pressed effect */
        .sap-toolbar-button:active:not(:disabled) .button-icon {
          transform: translateY(1px);
        }

        /* Home button special styling */
        .sap-toolbar-button[title="Home"]:not(:disabled):hover {
          background: linear-gradient(to bottom, 
            #E8F5E9 0%, 
            #C8E6C9 40%, 
            #A5D6A7 60%, 
            #81C784 100%);
          border-color: #66BB6A #43A047 #43A047 #66BB6A;
        }
      `}</style>
    </>
  );
};

export default Toolbar;