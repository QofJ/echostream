import type { SubtitleEntry, ParserResult } from '@/types/subtitle';

/**
 * Parse time string in SRT format (00:00:00,000) to seconds
 */
function parseSrtTime(timeStr: string): number {
  const [time, ms] = timeStr.trim().split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + parseInt(ms, 10) / 1000;
}

/**
 * Parse SRT subtitle content
 */
export function parseSrt(content: string): ParserResult {
  try {
    const entries: SubtitleEntry[] = [];
    // Normalize line endings and split by double newlines
    const blocks = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
      .split(/\n\n+/);

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 2) continue;

      // First line is the index
      const indexLine = lines[0].trim();
      const index = parseInt(indexLine, 10);
      if (isNaN(index)) continue;

      // Second line is the time range
      const timeLine = lines[1].trim();
      const timeMatch = timeLine.match(
        /(\d{1,2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2},\d{3})/
      );
      if (!timeMatch) continue;

      const startTime = parseSrtTime(timeMatch[1]);
      const endTime = parseSrtTime(timeMatch[2]);

      // Rest of the lines are the subtitle text
      const rawText = lines.slice(2).join('\n').trim();

      // Detect speaker change marker (>>) on any line
      const textLines = rawText.split('\n');
      const speakerChange = textLines.some(line => line.trim().startsWith('>>'));
      // Remove >> from the beginning of any line
      const text = textLines
        .map(line => line.replace(/^>>\s*/, ''))
        .join('\n')
        .trim();

      entries.push({ index, startTime, endTime, text, speakerChange });
    }

    if (entries.length === 0) {
      return { success: false, error: 'No valid subtitle entries found' };
    }

    // Sort by start time
    entries.sort((a, b) => a.startTime - b.startTime);

    return { success: true, entries };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse SRT file'
    };
  }
}
