'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConnectivityContextType {
  isOffline: boolean;
  simulateOffline: boolean;
  setSimulateOffline: (value: boolean) => void;
  checkConnection: () => Promise<boolean>;
}

const ConnectivityContext = createContext<ConnectivityContextType | null>(null);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [simulateOffline, setSimulateOffline] = useState(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (simulateOffline) {
      return false;
    }
    return navigator.onLine;
  }, [simulateOffline]);

  const isOffline = simulateOffline || (typeof navigator !== 'undefined' && !navigator.onLine);

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
