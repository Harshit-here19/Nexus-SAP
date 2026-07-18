// src/context/SessionContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([
    {
      id: 'session_1',
      name: 'Session 1',
      transaction: 'HOME',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('session_1');

  // Get active session
  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  // Create new session
  const createSession = useCallback(() => {
    const newSessionNumber = sessions.length + 1;
    const newSession = {
      id: `session_${Date.now()}`,
      name: `Session ${newSessionNumber}`,
      transaction: 'HOME',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    
    return newSession;
  }, [sessions.length]);

  // Close session
  const closeSession = useCallback((sessionId) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      
      // If no sessions left, create a new one
      if (filtered.length === 0) {
        return [{
          id: 'session_1',
          name: 'Session 1',
          transaction: 'HOME',
          isActive: true,
          createdAt: new Date().toISOString()
        }];
      }
      
      return filtered;
    });
    
    // If closing active session, switch to first available
    if (sessionId === activeSessionId) {
      setSessions(prev => {
        const remaining = prev.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        }
        return prev;
      });
    }
  }, [activeSessionId]);

  // Switch to session
  const switchSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  // Update session transaction
  const updateSessionTransaction = useCallback((sessionId, transaction) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, transaction, updatedAt: new Date().toISOString() }
        : s
    ));
  }, []);

  // Rename session
  const renameSession = useCallback((sessionId, newName) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, name: newName }
        : s
    ));
  }, []);

  const value = {
    sessions,
    activeSessionId,
    getActiveSession,
    createSession,
    closeSession,
    switchSession,
    updateSessionTransaction,
    renameSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;