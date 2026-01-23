'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

interface ConnectivityContextType {
  isOffline: boolean;
  simulateOffline: boolean;
  backendOffline: boolean;
  setSimulateOffline: (value: boolean) => void;
  reportApiFailure: () => void;
  reportApiSuccess: () => void;
}

const ConnectivityContext = createContext<ConnectivityContextType | null>(null);

const POLL_INTERVAL = 5000; // 5 seconds

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [browserOffline, setBrowserOffline] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check backend health
  const checkBackendHealth = useCallback(async () => {
    if (simulateOffline) {
      setBackendOffline(true);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('/api/users', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendOffline(false);
      } else {
        setBackendOffline(true);
      }
    } catch {
      setBackendOffline(true);
    }
  }, [simulateOffline]);

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

  // Poll backend health every 5 seconds
  useEffect(() => {
    // Initial check
    checkBackendHealth();

    // Set up polling
    pollIntervalRef.current = setInterval(checkBackendHealth, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [checkBackendHealth]);

  // Called when an API request fails
  const reportApiFailure = useCallback(() => {
    setBackendOffline(true);
  }, []);

  // Called when an API request succeeds
  const reportApiSuccess = useCallback(() => {
    setBackendOffline(false);
  }, []);

  const isOffline = simulateOffline || browserOffline || backendOffline;

  return (
    <ConnectivityContext.Provider
      value={{
        isOffline,
        simulateOffline,
        backendOffline,
        setSimulateOffline,
        reportApiFailure,
        reportApiSuccess,
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
