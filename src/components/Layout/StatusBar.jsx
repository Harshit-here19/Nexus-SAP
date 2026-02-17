// src/components/Layout/StatusBar.jsx
import { useState, useEffect } from 'react';
import styles from './StatusBar.module.css';

const StatusBar = ({ message = 'Ready', type = 'info', user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // console.log(type, message);
  

  return (
    <div className={styles.sapStatusBar}>
      <div className={styles.sapStatusLeft}>
        <div className={`${styles.sapStatusMessage} ${styles[type]}`}>
          {message}
        </div>
      </div>
      <div className={styles.sapStatusRight}>
        <span>System: DEV (100)</span>
        <span>Client: {user?.client || '001'}</span>
        <span>User: {user?.username || 'GUEST'}</span>
        <span>{formatDate(currentTime)}</span>
        <span>{formatTime(currentTime)}</span>
      </div>
    </div>
  );
};

export default StatusBar;