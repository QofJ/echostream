import type { ParserResult, DedupeOptions } from '@/types/subtitle';
import { parseSrt } from './srt-parser';
import { parseVtt } from './vtt-parser';
import { dedupeRollingSubtitles } from './dedupe-rolling';
import { filterSubtitleEntries } from './filter-entries';

export { parseSrt } from './srt-parser';
export { parseVtt } from './vtt-parser';
export { dedupeRollingSubtitles } from './dedupe-rolling';
export { filterSubtitleEntries } from './filter-entries';

/**
 * Detect and parse subtitle file based on content
 */
export function parseSubtitle(
  content: string,
  filename?: string,
  dedupeOptions?: Partial<DedupeOptions>
): ParserResult {
  const trimmedContent = content.trim();

  let result: ParserResult;

  // Check if it's VTT format
  if (trimmedContent.startsWith('WEBVTT')) {
    result = parseVtt(content);
  } else if (filename) {
    // Check file extension if provided
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'vtt') {
      result = parseVtt(content);
    } else {
      // Default to SRT parser
      result = parseSrt(content);
    }
  } else {
    // Default to SRT parser
    result = parseSrt(content);
  }

  // Apply deduplication and filtering by default for successful parses
  if (result.success) {
    const filterOpts = dedupeOptions?.filter;

    // Step 1: Pre-filter - remove empty text entries before deduplication
    let entries = filterSubtitleEntries(result.entries, {
      skipEmpty: filterOpts?.skipEmpty ?? true,
      minDuration: 0  // Don't filter by duration yet, do it after dedupe
    });

    // Step 2: Deduplication
    entries = dedupeRollingSubtitles(entries, dedupeOptions);

    // Step 3: Post-filter - remove short duration entries (flickering)
    entries = filterSubtitleEntries(entries, {
      skipEmpty: false,  // Already filtered
      minDuration: filterOpts?.minDuration ?? 100
    });

    result = {
      ...result,
      entries
    };
  }

  return result;
}

/**
 * Read and parse a subtitle file
 */
export async function readSubtitleFile(
  file: File,
  dedupeOptions?: Partial<DedupeOptions>
): Promise<ParserResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      resolve(parseSubtitle(content, file.name, dedupeOptions));
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file'
      });
    };

    reader.readAsText(file);
  });
}
