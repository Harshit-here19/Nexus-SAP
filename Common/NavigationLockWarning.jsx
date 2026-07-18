// src/components/Common/NavigationLockWarning.jsx
import { useState, useEffect } from 'react';

const NavigationLockWarning = ({ show, message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #e9730c 0%, #c45c00 100%)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideDown 0.3s ease'
    }}>
      <span style={{ fontSize: '20px' }}>🔒</span>
      <span>{message || 'Please go back (F3) before entering another transaction'}</span>
    </div>
  );
};

export default NavigationLockWarning;