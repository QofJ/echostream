import type { SubtitleEntry, DedupeOptions } from '@/types/subtitle';

const DEFAULT_OPTIONS: DedupeOptions = {
  enabled: true,
  mode: 'both'
};

/**
 * Detect word-level overlap between previous subtitle tail and current subtitle head
 */
function findWordOverlap(previous: string, current: string): {
  overlapRatio: number;
  overlapEnd: number;
} {
  const prevWords = previous.split(/\s+/);
  const currWords = current.split(/\s+/);

  // Find maximum overlap where previous ending matches current beginning
  let maxOverlap = 0;
  for (let len = 1; len <= Math.min(prevWords.length, currWords.length); len++) {
    const prevTail = prevWords.slice(-len).join(' ');
    const currHead = currWords.slice(0, len).join(' ');
    if (prevTail.toLowerCase() === currHead.toLowerCase()) {
      maxOverlap = len;
    }
  }

  if (maxOverlap === 0) {
    return { overlapRatio: 0, overlapEnd: 0 };
  }

  const overlapText = currWords.slice(0, maxOverlap).join(' ');
  return {
    overlapRatio: maxOverlap / currWords.length,
    overlapEnd: current.toLowerCase().indexOf(overlapText.toLowerCase()) + overlapText.length
  };
}

/**
 * Process a single entry to detect and remove rolling/duplicate content
 */
function processEntry(
  current: SubtitleEntry,
  previous: SubtitleEntry,
  mode: string
): SubtitleEntry | null {
  const currentText = current.text.trim();
  const previousText = previous.text.trim();

  // Exact duplicate - skip
  if (mode === 'duplicate' || mode === 'both') {
    if (currentText === previousText) {
      return null;
    }
  }

  // Rolling mode processing
  if (mode === 'rolling' || mode === 'both') {
    // Current subtitle contains previous subtitle content followed by new content
    if (currentText.startsWith(previousText + ' ') || currentText.startsWith(previousText + '\n')) {
      const newText = currentText.slice(previousText.length).trim();
      if (newText) {
        return { ...current, text: newText };
      }
      return null;
    }

    // Multi-line rolling: current first line equals previous subtitle
    const lines = currentText.split('\n');
    if (lines.length > 1 && lines[0].trim() === previousText) {
      const newText = lines.slice(1).join('\n').trim();
      if (newText) {
        return { ...current, text: newText };
      }
      return null;
    }

    // Partial overlap detection (word-level)
    const overlap = findWordOverlap(previousText, currentText);
    if (overlap.overlapRatio > 0.5) {
      const newText = currentText.slice(overlap.overlapEnd).trim();
      if (newText && newText.length >= 3) {
        return { ...current, text: newText };
      }
    }
  }

  return current;
}

/**
 * Detect and remove rolling subtitle duplicates
 *
 * Rolling subtitles (like YouTube auto-generated captions) repeat content
 * from previous entries with new content appended. This function extracts
 * only the new content from each entry.
 */
export function dedupeRollingSubtitles(
  entries: SubtitleEntry[],
  options: Partial<DedupeOptions> = {}
): SubtitleEntry[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!opts.enabled || entries.length === 0) {
    return entries;
  }

  const result: SubtitleEntry[] = [];
  let previousEntry: SubtitleEntry | null = null;

  for (const entry of entries) {
    if (!previousEntry) {
      result.push(entry);
      previousEntry = entry;
      continue;
    }

    const processed = processEntry(entry, previousEntry, opts.mode);
    if (processed) {
      result.push(processed);
    }
    // Always update previousEntry to the original entry for accurate rolling comparison
    // This ensures we compare against the actual previous content, not the processed result
    previousEntry = entry;
  }

  // Renumber entries
  return result.map((entry, idx) => ({ ...entry, index: idx + 1 }));
}
