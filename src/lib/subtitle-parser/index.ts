import type { ParserResult, DedupeOptions } from '@/types/subtitle';
import { parseSrt } from './srt-parser';
import { parseVtt } from './vtt-parser';
import { dedupeRollingSubtitles } from './dedupe-rolling';

export { parseSrt } from './srt-parser';
export { parseVtt } from './vtt-parser';
export { dedupeRollingSubtitles } from './dedupe-rolling';

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

  // Apply deduplication by default for successful parses
  if (result.success) {
    result = {
      ...result,
      entries: dedupeRollingSubtitles(result.entries, dedupeOptions)
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
