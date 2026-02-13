// src/components/Common/SapButton.jsx
import React from 'react';

const SapButton = ({
  children,
  onClick,
  type = 'default', // 'default', 'primary', 'success', 'danger'
  disabled = false,
  icon,
  loading = false
}) => {
  return (
    <button
      className={`sap-button ${type}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="sap-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default SapButton;