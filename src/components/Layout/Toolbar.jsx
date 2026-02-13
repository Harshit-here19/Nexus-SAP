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
            className={`sap-toolbar-button ${btn.highlight ? 'highlighted' : ''}`}
            title={btn.title}
            onClick={() => handleButtonClick(btn.action)}
            disabled={btn.disabled}
            style={{
              ...(btn.highlight ? {
                background: btn.action === 'toggleFavorite' 
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)'
                  : 'var(--sap-brand-lighter)',
                borderColor: btn.action === 'toggleFavorite' ? '#e6ac00' : 'var(--sap-brand)',
              } : {}),
              ...(btn.action === 'toggleFavorite' && currentIsFavorite ? {
                color: '#8b6914'
              } : {})
            }}
          >
            {btn.icon}
          </button>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .sap-toolbar-button.highlighted:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default Toolbar;