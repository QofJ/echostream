import type { SubtitleEntry, FilterOptions } from '@/types/subtitle';

const DEFAULT_FILTER_OPTIONS: Required<FilterOptions> = {
  minDuration: 100,
  skipEmpty: true
};

/**
 * Check if a subtitle entry has empty text
 */
function isEmptyText(text: string): boolean {
  return text.trim().length === 0;
}

/**
 * Calculate display duration in milliseconds
 */
function getDurationMs(entry: SubtitleEntry): number {
  return (entry.endTime - entry.startTime) * 1000;
}

/**
 * Filter subtitle entries based on criteria
 *
 * @param entries - Array of subtitle entries to filter
 * @param options - Filter options
 * @returns Filtered array of subtitle entries with renumbered indices
 */
export function filterSubtitleEntries(
  entries: SubtitleEntry[],
  options: FilterOptions = {}
): SubtitleEntry[] {
  const opts = { ...DEFAULT_FILTER_OPTIONS, ...options };

  const filtered = entries.filter((entry) => {
    // Skip empty text entries
    if (opts.skipEmpty && isEmptyText(entry.text)) {
      console.log(`[Filter] Skipping empty text entry at index ${entry.index}`);
      return false;
    }

    // Skip short duration entries (flickering)
    const duration = getDurationMs(entry);
    if (duration < opts.minDuration) {
      console.log(
        `[Filter] Skipping short duration entry at index ${entry.index} (${duration}ms < ${opts.minDuration}ms)`
      );
      return false;
    }

    return true;
  });

  // Renumber entries
  return filtered.map((entry, idx) => ({ ...entry, index: idx + 1 }));
}
