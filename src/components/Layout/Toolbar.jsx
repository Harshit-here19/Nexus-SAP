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
          height: 26px;
          background: linear-gradient(to bottom, #ECE9D8 0%, #D4CFC0 100%);
          border-top: 1px solid #FFFFFF;
          border-bottom: 1px solid #716F64;
          padding: 0 2px;
          font-family: 'Microsoft Sans Serif', 'Segoe UI', Tahoma, sans-serif;
          font-size: 11px;
        }

        .sap-toolbar-separator {
          width: 1px;
          height: 20px;
          margin: 0 2px;
          background: linear-gradient(to right, 
            transparent 0%, 
            #716F64 20%, 
            #716F64 40%, 
            #FFFFFF 60%, 
            #FFFFFF 80%, 
            transparent 100%);
        }

        .sap-toolbar-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 23px;
          height: 22px;
          margin: 0 1px;
          padding: 0 3px;
          background: linear-gradient(to bottom, #FFFFFF 0%, #ECE9D8 50%, #D4CFC0 100%);
          border: 1px solid;
          border-color: #FFFFFF #716F64 #716F64 #FFFFFF;
          cursor: pointer;
          font-size: 12px;
          transition: none;
          position: relative;
        }

        .sap-toolbar-button:hover:not(:disabled) {
          background: linear-gradient(to bottom, #FFF8DC 0%, #F0E68C 50%, #DAA520 100%);
          border-color: #F0E68C #8B7355 #8B7355 #F0E68C;
        }

        .sap-toolbar-button:active:not(:disabled) {
          background: linear-gradient(to bottom, #D4CFC0 0%, #ECE9D8 50%, #FFFFFF 100%);
          border-color: #716F64 #FFFFFF #FFFFFF #716F64;
          padding-top: 1px;
          padding-left: 4px;
        }

        .sap-toolbar-button:focus {
          outline: 1px dotted #000000;
          outline-offset: -3px;
        }

        .sap-toolbar-button.disabled {
          opacity: 0.5;
          cursor: default;
          background: linear-gradient(to bottom, #F5F5F5 0%, #E8E8E8 50%, #D0D0D0 100%);
          border-color: #E8E8E8 #A0A0A0 #A0A0A0 #E8E8E8;
        }

        .sap-toolbar-button.highlighted {
          background: linear-gradient(to bottom, #FFE4B5 0%, #FFD700 50%, #FFA500 100%);
          border-color: #FFD700 #B8860B #B8860B #FFD700;
        }

        .sap-toolbar-button.highlighted:hover:not(:disabled) {
          background: linear-gradient(to bottom, #FFF8DC 0%, #FFE4B5 50%, #FFD700 100%);
          border-color: #FFE4B5 #B8860B #B8860B #FFE4B5;
        }

        .button-icon {
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          filter: drop-shadow(1px 1px 0px rgba(255, 255, 255, 0.8));
        }

        /* Classic Windows tooltip style */
        .sap-toolbar-button:hover::after {
          content: attr(title);
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 4px;
          padding: 2px 4px;
          background: #FFFFE1;
          border: 1px solid #000000;
          font-size: 11px;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
        }

        .sap-toolbar-button:hover::before {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 3px 4px 3px;
          border-color: transparent transparent #000000 transparent;
          z-index: 1001;
        }

        /* Specific button styles */
        .sap-toolbar-button[title*="Enter"] .button-icon,
        .sap-toolbar-button[title*="Save"] .button-icon {
          color: #006400;
          font-weight: bold;
        }

        .sap-toolbar-button[title*="Back"] .button-icon,
        .sap-toolbar-button[title*="Exit"] .button-icon {
          color: #4169E1;
        }

        .sap-toolbar-button[title*="Cancel"] .button-icon,
        .sap-toolbar-button[title*="Delete"] .button-icon {
          color: #DC143C;
        }

        .sap-toolbar-button[title*="Create"] .button-icon {
          color: #228B22;
        }

        .sap-toolbar-button[title*="Change"] .button-icon {
          color: #FF8C00;
        }

        .sap-toolbar-button[title*="Display"] .button-icon {
          color: #4682B4;
        }

        .sap-toolbar-button[title*="Favorite"] .button-icon {
          color: #FFD700;
          text-shadow: 0 0 2px #FFA500;
        }

        /* Animation for highlighted buttons */
        @keyframes sap-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
          }
          50% { 
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0);
          }
        }

        .sap-toolbar-button.highlighted {
          animation: sap-pulse 2s infinite;
        }

        /* Classic SAP pressed effect */
        .sap-toolbar-button:active:not(:disabled) .button-icon {
          transform: translate(1px, 1px);
        }

        /* Group hover effect for navigation buttons */
        .sap-toolbar-button[title*="Page"]:hover:not(:disabled) {
          background: linear-gradient(to bottom, #E6F3FF 0%, #B3D9FF 50%, #80BFFF 100%);
        }

        /* Print and Find buttons special style */
        .sap-toolbar-button[title*="Print"]:hover:not(:disabled),
        .sap-toolbar-button[title*="Find"]:hover:not(:disabled) {
          background: linear-gradient(to bottom, #F0F0F0 0%, #E0E0E0 50%, #D0D0D0 100%);
          border-color: #E0E0E0 #808080 #808080 #E0E0E0;
        }

        /* Home button special style */
        .sap-toolbar-button[title="Home"] {
          min-width: 28px;
          font-weight: bold;
        }

        .sap-toolbar-button[title="Home"]:not(:disabled):hover {
          background: linear-gradient(to bottom, #E8F5E9 0%, #A5D6A7 50%, #66BB6A 100%);
          border-color: #A5D6A7 #2E7D32 #2E7D32 #A5D6A7;
        }
      `}</style>
    </>
  );
};

export default Toolbar;