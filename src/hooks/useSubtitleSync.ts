import { useState, useCallback } from 'react';
import type { SubtitleEntry, SubtitleFile, ShadowingMode } from '@/types/subtitle';

export interface UseSubtitleSyncReturn {
  subtitleFile: SubtitleFile | null;
  currentIndex: number;
  shadowingMode: ShadowingMode;
  loadSubtitles: (entries: SubtitleEntry[], filename: string) => void;
  clearSubtitles: () => void;
  updateCurrentTime: (time: number) => void;
  setShadowingMode: (enabled: boolean, delay?: number) => void;
  getCurrentSubtitle: () => SubtitleEntry | null;
  getNextSubtitle: () => SubtitleEntry | null;
  getPreviousSubtitle: () => SubtitleEntry | null;
}

export function useSubtitleSync(): UseSubtitleSyncReturn {
  const [subtitleFile, setSubtitleFile] = useState<SubtitleFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shadowingMode, setShadowingModeState] = useState<ShadowingMode>({
    enabled: false,
    delay: 2,
  });

  // Binary search to find current subtitle index
  const findSubtitleIndex = useCallback((time: number, entries: SubtitleEntry[]): number => {
    if (entries.length === 0) return -1;

    let left = 0;
    let right = entries.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const entry = entries[mid];

      if (time >= entry.startTime && time < entry.endTime) {
        return mid;
      }

      if (time < entry.startTime) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return -1;
  }, []);

  const loadSubtitles = useCallback((entries: SubtitleEntry[], filename: string) => {
    setSubtitleFile({
      name: filename,
      entries,
    });
    setCurrentIndex(-1);
  }, []);

  const clearSubtitles = useCallback(() => {
    setSubtitleFile(null);
    setCurrentIndex(-1);
  }, []);

  const updateCurrentTime = useCallback((time: number) => {
    if (!subtitleFile) return;

    // Apply shadowing delay if enabled
    const effectiveTime = shadowingMode.enabled
      ? time - shadowingMode.delay
      : time;

    const newIndex = findSubtitleIndex(effectiveTime, subtitleFile.entries);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [subtitleFile, shadowingMode, currentIndex, findSubtitleIndex]);

  const setShadowingMode = useCallback((enabled: boolean, delay: number = 2) => {
    setShadowingModeState({
      enabled,
      delay: Math.max(0, Math.min(10, delay)),
    });
  }, []);

  const getCurrentSubtitle = useCallback((): SubtitleEntry | null => {
    if (!subtitleFile || currentIndex < 0) return null;
    return subtitleFile.entries[currentIndex] || null;
  }, [subtitleFile, currentIndex]);

  const getNextSubtitle = useCallback((): SubtitleEntry | null => {
    if (!subtitleFile || currentIndex < 0) return null;
    return subtitleFile.entries[currentIndex + 1] || null;
  }, [subtitleFile, currentIndex]);

  const getPreviousSubtitle = useCallback((): SubtitleEntry | null => {
    if (!subtitleFile || currentIndex <= 0) return null;
    return subtitleFile.entries[currentIndex - 1] || null;
  }, [subtitleFile, currentIndex]);

  return {
    subtitleFile,
    currentIndex,
    shadowingMode,
    loadSubtitles,
    clearSubtitles,
    updateCurrentTime,
    setShadowingMode,
    getCurrentSubtitle,
    getNextSubtitle,
    getPreviousSubtitle,
  };
}
