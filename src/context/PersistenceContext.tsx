import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { SubtitleEntry } from '@/types/subtitle';
import type { PersistenceState, RestoreResult } from '@/lib/storage/types';
import {
  saveAudio as storageSaveAudio,
  saveSubtitle as storageSaveSubtitle,
  loadStoredData,
  clearAllData as storageClearAllData,
  isIndexedDBAvailable,
} from '@/lib/storage/indexeddb';

interface PersistenceContextValue extends PersistenceState {
  saveAudio: (file: File) => Promise<void>;
  saveSubtitle: (file: File, entries: SubtitleEntry[]) => Promise<void>;
  restoreData: () => Promise<RestoreResult>;
  clearAllData: () => Promise<void>;
  clearError: () => void;
}

const PersistenceContext = createContext<PersistenceContextValue | null>(null);

export function PersistenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistenceState>({
    isRestoring: false,
    error: null,
    hasStoredData: false,
  });

  const isAvailable = isIndexedDBAvailable();

  // Check for stored data on mount
  useEffect(() => {
    if (!isAvailable) return;

    loadStoredData()
      .then((result) => {
        setState((prev) => ({
          ...prev,
          hasStoredData: result.audio !== null || result.subtitle !== null,
        }));
      })
      .catch(() => {
        // Silently fail on mount check
      });
  }, [isAvailable]);

  const saveAudio = useCallback(
    async (file: File) => {
      if (!isAvailable) return;

      try {
        await storageSaveAudio(file);
        setState((prev) => ({ ...prev, hasStoredData: true, error: null }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to save audio',
        }));
        throw err;
      }
    },
    [isAvailable]
  );

  const saveSubtitle = useCallback(
    async (file: File, entries: SubtitleEntry[]) => {
      if (!isAvailable) return;

      try {
        await storageSaveSubtitle(file, entries);
        setState((prev) => ({ ...prev, hasStoredData: true, error: null }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to save subtitle',
        }));
        throw err;
      }
    },
    [isAvailable]
  );

  const restoreData = useCallback(async (): Promise<RestoreResult> => {
    if (!isAvailable) {
      return { audio: null, subtitle: null };
    }

    setState((prev) => ({ ...prev, isRestoring: true, error: null }));

    try {
      const result = await loadStoredData();
      setState((prev) => ({
        ...prev,
        isRestoring: false,
        hasStoredData: result.audio !== null || result.subtitle !== null,
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore data';
      setState((prev) => ({
        ...prev,
        isRestoring: false,
        error: errorMessage,
      }));
      return { audio: null, subtitle: null };
    }
  }, [isAvailable]);

  const clearAllData = useCallback(async () => {
    if (!isAvailable) return;

    try {
      await storageClearAllData();
      setState((prev) => ({ ...prev, hasStoredData: false, error: null }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to clear data',
      }));
      throw err;
    }
  }, [isAvailable]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <PersistenceContext.Provider
      value={{
        ...state,
        saveAudio,
        saveSubtitle,
        restoreData,
        clearAllData,
        clearError,
      }}
    >
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistence(): PersistenceContextValue {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error('usePersistence must be used within PersistenceProvider');
  }
  return context;
}
