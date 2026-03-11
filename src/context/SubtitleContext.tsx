import { createContext, useContext, type ReactNode } from 'react';
import { useSubtitleSync, type UseSubtitleSyncReturn } from '@/hooks/useSubtitleSync';

const SubtitleContext = createContext<UseSubtitleSyncReturn | null>(null);

export function SubtitleProvider({ children }: { children: ReactNode }) {
  const subtitleSync = useSubtitleSync();

  return (
    <SubtitleContext.Provider value={subtitleSync}>
      {children}
    </SubtitleContext.Provider>
  );
}

export function useSubtitleContext(): UseSubtitleSyncReturn {
  const context = useContext(SubtitleContext);
  if (!context) {
    throw new Error('useSubtitleContext must be used within SubtitleProvider');
  }
  return context;
}
