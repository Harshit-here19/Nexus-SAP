// src/components/Common/SapModal.jsx
import React from 'react';
import styles from './SapModal.module.css';

const SapModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width = '500px' 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles['sap-modal-overlay']} onClick={onClose}>
      <div 
        className={styles['sap-modal']} 
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['sap-modal-header']}>
          <span className={styles['sap-modal-title']}>{title}</span>
          <button className={styles['sap-modal-close']} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles['sap-modal-body']}>
          {children}
        </div>
        {footer && (
          <div className={styles['sap-modal-footer']}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SapModal;