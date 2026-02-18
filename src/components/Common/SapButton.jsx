// src/components/Common/SapButton.jsx
import React from 'react';
import styles from './SapButton.module.css';

const SapButton = ({
  children,
  onClick,
  type = 'default', // 'default', 'primary', 'success', 'danger', 'search', 'close'
  disabled = false,
  icon,
  loading = false,
}) => {
  const classNames = [
    styles.sapButton,
    type !== 'default' ? styles[type] : '',
    disabled || loading ? styles.disabled : '',
  ].join(' ');

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
