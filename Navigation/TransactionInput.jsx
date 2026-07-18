// src/components/Navigation/TransactionInput.jsx
import React, { useState, useEffect } from 'react';
import { useTransaction } from '../../context/TransactionContext';

const TransactionInput = () => {
  const [tcode, setTcode] = useState('');
  const { navigateToTransaction, isTransactionActive, currentTransaction } = useTransaction();

  const inputRef = React.useRef(null);

  useEffect(() => {
    // console.log('Focus Input');
    
    const focusOnInput = () => {
      // const inputElement = document.querySelector('.sap-tcode-input');
      //   if (inputElement) {
      //      inputElement.focus();
      // }
      inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isTypingField =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable;

      // 🚫 Do nothing if user is already typing
      if (isTypingField) return;

      if (e.key === '.') {
        e.preventDefault();
        focusOnInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isTransactionActive]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && tcode.trim()) {
      const success = navigateToTransaction(tcode.trim().toUpperCase());
      if (success) {
        setTcode('');
      }
    }
  };

  const handleExecute = () => {
    if (tcode.trim()) {
      const success = navigateToTransaction(tcode.trim().toUpperCase());
      if (success) {
        setTcode('');
      }
    }
  };

  return (
    <div className="sap-tcode-container" style={{
      position: 'relative'
    }}>
      <input
        type="text"
        ref={inputRef}
        className="sap-tcode-input"
        placeholder={isTransactionActive ? `[${currentTransaction}] Press F3 to exit` : "/nXXXX"}
        value={tcode}
        onChange={(e) => setTcode(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: isTransactionActive ? '200px' : '140px',
          background: isTransactionActive ? 'var(--sap-highlight)' : 'white'
        }}
      />
      <button
        className="sap-toolbar-button"
        onClick={handleExecute}
        title="Execute Transaction"
        style={{
          width: '28px',
          height: '28px',
          marginLeft: '-1px'
        }}
      >
        ✓
      </button>

      {/* Transaction Lock Indicator */}
      {isTransactionActive && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: 'var(--sap-critical)',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          🔒
        </div>
      )}
    </div>
  );
};

export default TransactionInput;