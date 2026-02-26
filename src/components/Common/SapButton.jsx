// src/components/Common/SapButton.jsx
import React from 'react';
import styles from './SapButton.module.css';

const SapButton = ({
  children,
  onClick,
  type = 'default', // 'default', 'primary', 'success', 'danger', 'search', 'close', 'login', 'signup'
  disabled = false,
  icon,
  loading = false,
  onKeyPress
}) => {
  const classNames = [
    styles.sapButton,
    type !== 'default' ? styles[type] : '',
    disabled || loading ? styles.disabled : '',
  ].join(' ');

  // Internal handler for key events
  const handleKeyDown = (e) => {
    if (disabled || loading) return;

    // Check if the user passed a specific function to onKeyPress
    if (onKeyPress) {
      onKeyPress(e);
    } 
    // Otherwise, if they press Enter/Space, trigger the standard onClick
    else if (e.key === 'Enter' || e.key === ' ') {
      if (onClick) onClick(e);
    }
  };

  return (
    <button className={classNames} onClick={onClick} disabled={disabled || loading}>
      {loading ? (
        <>
          <span className={styles.sapSpinner}></span>
          Loading...
        </>
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default SapButton;
