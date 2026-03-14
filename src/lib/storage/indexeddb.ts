import type { StoredAudio, StoredSubtitle, RestoreResult, SubtitleEntry } from './types';

export type { StoredAudio, StoredSubtitle, PersistenceState, RestoreResult } from './types';

const DB_NAME = 'echostream-db';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio';
const SUBTITLE_STORE = 'subtitles';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SUBTITLE_STORE)) {
        db.createObjectStore(SUBTITLE_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveAudio(file: File): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);

    const data: { id: string } & StoredAudio = {
      id: 'current',
      blob: file,
      name: file.name,
      type: file.type,
      storedAt: Date.now(),
    };

    const request = store.put(data);

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => {
      if (request.error?.name === 'QuotaExceededError') {
        reject(new Error('Storage quota exceeded. Please clear some cached data.'));
      } else {
        reject(new Error('Failed to save audio file'));
      }
    };
  });
}

export async function saveSubtitle(file: File, entries: SubtitleEntry[]): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUBTITLE_STORE], 'readwrite');
    const store = transaction.objectStore(SUBTITLE_STORE);

    const data: { id: string } & StoredSubtitle = {
      id: 'current',
      blob: file,
      name: file.name,
      entries,
      storedAt: Date.now(),
    };

    const request = store.put(data);

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => {
      if (request.error?.name === 'QuotaExceededError') {
        reject(new Error('Storage quota exceeded. Please clear some cached data.'));
      } else {
        reject(new Error('Failed to save subtitle file'));
      }
    };
  });
}

export async function loadStoredData(): Promise<RestoreResult> {
  const db = await openDB();

  return new Promise((resolve) => {
    const audioTransaction = db.transaction([AUDIO_STORE], 'readonly');
    const audioStore = audioTransaction.objectStore(AUDIO_STORE);
    const audioRequest = audioStore.get('current');

    const subtitleTransaction = db.transaction([SUBTITLE_STORE], 'readonly');
    const subtitleStore = subtitleTransaction.objectStore(SUBTITLE_STORE);
    const subtitleRequest = subtitleStore.get('current');

    let audio: StoredAudio | null = null;
    let subtitle: StoredSubtitle | null = null;
    let completed = 0;

    const checkComplete = () => {
      completed++;
      if (completed === 2) {
        resolve({ audio, subtitle });
      }
    };

    audioRequest.onsuccess = () => {
      audio = audioRequest.result || null;
      checkComplete();
    };

    audioRequest.onerror = () => {
      checkComplete();
    };

    subtitleRequest.onsuccess = () => {
      subtitle = subtitleRequest.result || null;
      checkComplete();
    };

    subtitleRequest.onerror = () => {
      checkComplete();
    };
  });
}

export async function clearAudio(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.delete('current');

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(new Error('Failed to clear audio'));
  });
}

export async function clearSubtitle(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUBTITLE_STORE], 'readwrite');
    const store = transaction.objectStore(SUBTITLE_STORE);
    const request = store.delete('current');

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(new Error('Failed to clear subtitle'));
  });
}

export async function clearAllData(): Promise<void> {
  await Promise.all([clearAudio(), clearSubtitle()]);
}

export async function hasStoredData(): Promise<boolean> {
  const result = await loadStoredData();
  return result.audio !== null || result.subtitle !== null;
}

export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}
