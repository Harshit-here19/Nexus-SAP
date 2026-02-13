// src/context/TransactionContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within TransactionProvider');
  }
  return context;
};

// Transaction descriptions for history
const transactionDescriptions = {
  'HOME': 'SAP Easy Access',
  'MM01': 'Create Material',
  'MM02': 'Change Material',
  'MM03': 'Display Material',
  'VA01': 'Create Sales Order',
  'VA02': 'Change Sales Order',
  'VA03': 'Display Sales Order',
  'SE16': 'Data Browser',
  'FB01': 'Post Document',
  'FB03': 'Display Document',
  'SM37': 'Job Overview',
  'SU01': 'User Maintenance',
  'ZADMIN': 'User Administration'
};

export const TransactionProvider = ({ children }) => {
  const [currentTransaction, setCurrentTransaction] = useState('HOME');
  const [isTransactionActive, setIsTransactionActive] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState(['HOME']);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [statusType, setStatusType] = useState('info');
  
  // Callback for adding to favorites history (set by App)
  const [onTransactionExecute, setOnTransactionExecute] = useState(null);

  // Navigate to transaction
  const navigateToTransaction = useCallback((tcode) => {
    const cleanTcode = tcode.replace(/^\/n/i, '').toUpperCase();
    
    // If already in a transaction (not HOME), show warning
    if (isTransactionActive && currentTransaction !== 'HOME' && cleanTcode !== currentTransaction) {
      if (hasUnsavedChanges) {
        setPendingTransaction(cleanTcode);
        setShowExitConfirm(true);
        return false;
      } else {
        setStatusMessage(`Please go back (F3) before entering another transaction`);
        setStatusType('warning');
        setTimeout(() => {
          setStatusMessage('Ready');
          setStatusType('info');
        }, 4000);
        return false;
      }
    }

    // Navigate to new transaction
    setCurrentTransaction(cleanTcode);
    setIsTransactionActive(cleanTcode !== 'HOME');
    setHasUnsavedChanges(false);
    setTransactionHistory(prev => [...prev, cleanTcode]);
    setStatusMessage(`Transaction ${cleanTcode} started`);
    setStatusType('success');
    
    // Call the history callback if set
    if (onTransactionExecute && cleanTcode !== 'HOME') {
      onTransactionExecute(cleanTcode, transactionDescriptions[cleanTcode] || '');
    }
    
    setTimeout(() => {
      setStatusMessage('Ready');
      setStatusType('info');
    }, 3000);
    
    return true;
  }, [currentTransaction, isTransactionActive, hasUnsavedChanges, onTransactionExecute]);

  // Go back to previous screen or HOME
  const goBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingTransaction('BACK');
      setShowExitConfirm(true);
      return;
    }

    setCurrentTransaction('HOME');
    setIsTransactionActive(false);
    setHasUnsavedChanges(false);
    setStatusMessage('Back to main menu');
    setStatusType('info');
    
    setTimeout(() => {
      setStatusMessage('Ready');
      setStatusType('info');
    }, 2000);
  }, [hasUnsavedChanges]);

  // Exit transaction
  const exitTransaction = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingTransaction('EXIT');
      setShowExitConfirm(true);
      return;
    }

    setCurrentTransaction('HOME');
    setIsTransactionActive(false);
    setHasUnsavedChanges(false);
    setStatusMessage('Transaction ended');
    setStatusType('info');
    
    setTimeout(() => {
      setStatusMessage('Ready');
      setStatusType('info');
    }, 2000);
  }, [hasUnsavedChanges]);

  // Cancel current operation
  const cancelOperation = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingTransaction('CANCEL');
      setShowExitConfirm(true);
      return;
    }
    
    setStatusMessage('Operation cancelled');
    setStatusType('info');
  }, [hasUnsavedChanges]);

  // Confirm exit
  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    setHasUnsavedChanges(false);

    if (pendingTransaction === 'BACK' || pendingTransaction === 'EXIT' || pendingTransaction === 'CANCEL') {
      setCurrentTransaction('HOME');
      setIsTransactionActive(false);
      setStatusMessage('Changes discarded, back to main menu');
    } else if (pendingTransaction) {
      setCurrentTransaction(pendingTransaction);
      setIsTransactionActive(pendingTransaction !== 'HOME');
      setTransactionHistory(prev => [...prev, pendingTransaction]);
      setStatusMessage(`Transaction ${pendingTransaction} started`);
      
      if (onTransactionExecute && pendingTransaction !== 'HOME') {
        onTransactionExecute(pendingTransaction, transactionDescriptions[pendingTransaction] || '');
      }
    }
    
    setPendingTransaction(null);
    setStatusType('info');
    
    setTimeout(() => {
      setStatusMessage('Ready');
      setStatusType('info');
    }, 3000);
  }, [pendingTransaction, onTransactionExecute]);

  // Cancel exit
  const cancelExit = useCallback(() => {
    setShowExitConfirm(false);
    setPendingTransaction(null);
    setStatusMessage('Operation cancelled');
    setStatusType('info');
  }, []);

  // Mark data as changed
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Mark data as saved
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Update status message
  const updateStatus = useCallback((message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    
    if (type !== 'error') {
      setTimeout(() => {
        setStatusMessage('Ready');
        setStatusType('info');
      }, 5000);
    }
  }, []);

  // Register callback for transaction history
  const registerTransactionCallback = useCallback((callback) => {
    setOnTransactionExecute(() => callback);
  }, []);

  const value = {
    currentTransaction,
    isTransactionActive,
    hasUnsavedChanges,
    transactionHistory,
    showExitConfirm,
    statusMessage,
    statusType,
    navigateToTransaction,
    goBack,
    exitTransaction,
    cancelOperation,
    confirmExit,
    cancelExit,
    markAsChanged,
    markAsSaved,
    updateStatus,
    registerTransactionCallback
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;