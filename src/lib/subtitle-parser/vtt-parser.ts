import type { SubtitleEntry, ParserResult } from '@/types/subtitle';

/**
 * Parse time string in VTT format (00:00:00.000 or 00:00.000) to seconds
 */
function parseVttTime(timeStr: string): number {
  const parts = timeStr.trim().split('.');
  const timePart = parts[0];
  const ms = parts[1] ? parseInt(parts[1].padEnd(3, '0'), 10) : 0;

  const segments = timePart.split(':').map(Number);
  let hours = 0, minutes = 0, seconds = 0;

  if (segments.length === 3) {
    [hours, minutes, seconds] = segments;
  } else if (segments.length === 2) {
    [minutes, seconds] = segments;
  } else {
    seconds = segments[0] || 0;
  }

  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

/**
 * Parse VTT subtitle content
 */
export function parseVtt(content: string): ParserResult {
  try {
    const entries: SubtitleEntry[] = [];
    // Normalize line endings
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split into blocks
    const blocks = normalized.split(/\n\n+/);

    let entryIndex = 0;

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 2) continue;

      // Skip WEBVTT header and any metadata
      let timeLineIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timeLineIndex = i;
          break;
        }
      }

      const timeLine = lines[timeLineIndex].trim();
      const timeMatch = timeLine.match(
        /(\d{1,2}:?\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{1,2}:?\d{2}:\d{2}\.\d{3})/
      );
      if (!timeMatch) continue;

      const startTime = parseVttTime(timeMatch[1]);
      const endTime = parseVttTime(timeMatch[2]);

      // Rest of the lines are the subtitle text
      const rawText = lines.slice(timeLineIndex + 1)
        .join('\n')
        .replace(/<[^>]+>/g, '') // Remove VTT tags
        .trim();

      // Detect speaker change marker (>>)
      const speakerChange = rawText.startsWith('>>');
      const text = speakerChange ? rawText.replace(/^>>\s*/, '') : rawText;

      if (text) {
        entryIndex++;
        entries.push({ index: entryIndex, startTime, endTime, text, speakerChange });
      }
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
      error: error instanceof Error ? error.message : 'Failed to parse VTT file'
    };
  }
}
