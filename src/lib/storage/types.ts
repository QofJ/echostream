import type { SubtitleEntry } from '@/types/subtitle';

export type { SubtitleEntry } from '@/types/subtitle';

export interface StoredAudio {
  blob: Blob;
  name: string;
  type: string;
  storedAt: number;
}

export interface StoredSubtitle {
  blob: Blob;
  name: string;
  entries: SubtitleEntry[];
  storedAt: number;
}

export interface PersistenceState {
  isRestoring: boolean;
  error: string | null;
  hasStoredData: boolean;
}

export interface RestoreResult {
  audio: StoredAudio | null;
  subtitle: StoredSubtitle | null;
}
