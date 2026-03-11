import type { ParserResult } from '@/types/subtitle';
import { parseSrt } from './srt-parser';
import { parseVtt } from './vtt-parser';

export { parseSrt } from './srt-parser';
export { parseVtt } from './vtt-parser';

/**
 * Detect and parse subtitle file based on content
 */
export function parseSubtitle(content: string, filename?: string): ParserResult {
  const trimmedContent = content.trim();

  // Check if it's VTT format
  if (trimmedContent.startsWith('WEBVTT')) {
    return parseVtt(content);
  }

  // Check file extension if provided
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'vtt') {
      return parseVtt(content);
    }
  }

  // Default to SRT parser
  return parseSrt(content);
}

/**
 * Read and parse a subtitle file
 */
export async function readSubtitleFile(file: File): Promise<ParserResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      resolve(parseSubtitle(content, file.name));
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
