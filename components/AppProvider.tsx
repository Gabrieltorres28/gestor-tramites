import { ReactNode } from 'react';

export function AppProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAppData() {
  throw new Error('AppProvider legacy removido. Migrar al acceso server-side.');
}
