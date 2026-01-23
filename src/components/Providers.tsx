'use client';

import { ReactNode } from 'react';
import { ConnectivityProvider } from '@/contexts/ConnectivityContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ConnectivityProvider>{children}</ConnectivityProvider>;
}
