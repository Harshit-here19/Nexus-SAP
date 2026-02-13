// src/components/Common/SapModal.jsx
import React from 'react';

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
    <div className="sap-modal-overlay" onClick={onClose}>
      <div 
        className="sap-modal" 
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sap-modal-header">
          <span>{title}</span>
          <button className="sap-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="sap-modal-body">
          {children}
        </div>
        {footer && (
          <div className="sap-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SapModal;