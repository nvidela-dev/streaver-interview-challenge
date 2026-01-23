'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface ConnectivityContextType {
  isOffline: boolean;
  simulateOffline: boolean;
  setSimulateOffline: (value: boolean) => void;
  checkConnection: () => Promise<boolean>;
}

const ConnectivityContext = createContext<ConnectivityContextType | null>(null);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [browserOffline, setBrowserOffline] = useState(false);

  // Only check navigator.onLine on the client side after mount
  useEffect(() => {
    setBrowserOffline(!navigator.onLine);

    const handleOnline = () => setBrowserOffline(false);
    const handleOffline = () => setBrowserOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (simulateOffline) {
      return false;
    }
    return navigator.onLine;
  }, [simulateOffline]);

  const isOffline = simulateOffline || browserOffline;

  return (
    <ConnectivityContext.Provider
      value={{
        isOffline,
        simulateOffline,
        setSimulateOffline,
        checkConnection,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
}
