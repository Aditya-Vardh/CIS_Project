import React, { createContext, useContext, useState, useCallback } from 'react';

const ThreatContext = createContext();

export const ThreatProvider = ({ children }) => {
  const [activeThreat, setActiveThreat] = useState(null);
  const [threatHistory, setThreatHistory] = useState([]);

  const triggerThreatAlert = useCallback((threatData) => {
    // Only trigger if not already showing the same threat ID (to avoid duplicates from rapid polling/bursts)
    setActiveThreat(threatData);
    setThreatHistory(prev => [threatData, ...prev].slice(0, 50));
    
    // Auto-dismiss after 6 seconds (enough time to read)
    setTimeout(() => {
      setActiveThreat(null);
    }, 6000);
  }, []);

  const dismissThreat = useCallback(() => {
    setActiveThreat(null);
  }, []);

  return (
    <ThreatContext.Provider value={{ activeThreat, threatHistory, triggerThreatAlert, dismissThreat }}>
      {children}
    </ThreatContext.Provider>
  );
};

export const useThreat = () => {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error('useThreat must be used within a ThreatProvider');
  }
  return context;
};
