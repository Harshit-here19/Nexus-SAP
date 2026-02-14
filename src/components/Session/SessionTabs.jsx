// src/components/Session/SessionTabs.jsx
import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useTransaction } from '../../context/TransactionContext';
import { useConfirm } from '../../context/ConfirmContext';

const SessionTabs = () => {
  const { 
    sessions, 
    activeSessionId, 
    createSession, 
    closeSession, 
    switchSession 
  } = useSession();
  
  const { isTransactionActive, currentTransaction } = useTransaction();
  const [showContextMenu, setShowContextMenu] = useState(null);

  const confirm = useConfirm();

  const handleCreateSession =  () => {
    if (sessions.length >= 6) {
      confirm('Maximum 6 sessions allowed','warning');
      return;
    }
    createSession();
  };

  const handleCloseSession = (e, sessionId) => {
    e.stopPropagation();
    
    if (sessions.length === 1) {
      confirm('Cannot close the last session','warning');
      return;
    }
    
    if (isTransactionActive && sessionId === activeSessionId) {
      confirm('Please exit current transaction before closing session','warning');
      return;
    }
    
    closeSession(sessionId);
  };

  const handleSwitchSession = (sessionId) => {
    if (isTransactionActive && sessionId !== activeSessionId) {
      confirm('Please exit current transaction before switching sessions','warning');
      return;
    }
    switchSession(sessionId);
  };

  const handleContextMenu = (e, sessionId) => {
    e.preventDefault();
    setShowContextMenu(sessionId);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--sap-shell-bg)',
      padding: '4px 8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Session Tabs */}
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => handleSwitchSession(session.id)}
          onContextMenu={(e) => handleContextMenu(e, session.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: session.id === activeSessionId 
              ? 'var(--sap-content-bg)' 
              : 'rgba(255,255,255,0.1)',
            color: session.id === activeSessionId 
              ? 'var(--sap-text-primary)' 
              : 'rgba(255,255,255,0.8)',
            borderRadius: '6px 6px 0 0',
            cursor: isTransactionActive && session.id !== activeSessionId 
              ? 'not-allowed' 
              : 'pointer',
            marginRight: '2px',
            fontSize: '12px',
            fontWeight: session.id === activeSessionId ? '600' : '400',
            transition: 'all 0.2s',
            position: 'relative',
            opacity: isTransactionActive && session.id !== activeSessionId ? 0.5 : 1
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%',
              background: session.id === activeSessionId ? 'var(--sap-positive)' : 'transparent',
              border: session.id === activeSessionId ? 'none' : '1px solid rgba(255,255,255,0.5)'
            }} />
            {session.name}
            {session.id === activeSessionId && currentTransaction !== 'HOME' && (
              <span style={{
                fontSize: '10px',
                opacity: 0.7
              }}>
                [{currentTransaction}]
              </span>
            )}
          </span>
          
          {/* Close button */}
          {sessions.length > 1 && (
            <button
              onClick={(e) => handleCloseSession(e, session.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '14px',
                lineHeight: 1,
                opacity: 0.7
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.background = 'rgba(187,0,0,0.8)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'inherit';
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* New Session Button */}
      <button
        onClick={handleCreateSession}
        disabled={sessions.length >= 6 || isTransactionActive}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '4px',
          color: 'rgba(255,255,255,0.8)',
          cursor: sessions.length >= 6 || isTransactionActive ? 'not-allowed' : 'pointer',
          marginLeft: '4px',
          fontSize: '16px',
          opacity: sessions.length >= 6 || isTransactionActive ? 0.3 : 1
        }}
        title={sessions.length >= 6 ? 'Maximum sessions reached' : 'Create new session'}
        onMouseOver={(e) => {
          if (sessions.length < 6 && !isTransactionActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        +
      </button>

      {/* Session count indicator */}
      <div style={{
        marginLeft: 'auto',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>{sessions.length}/6 Sessions</span>
      </div>
    </div>
  );
};

export default SessionTabs;