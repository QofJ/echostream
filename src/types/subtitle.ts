export interface SubtitleEntry {
  index: number;
  startTime: number;  // seconds
  endTime: number;    // seconds
  text: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;  // 0.5 - 2.0
  loopStart: number | null;
  loopEnd: number | null;
  volume: number;
  isMuted: boolean;
}

export interface AudioFile {
  name: string;
  url: string;
  file?: File;
}

export interface SubtitleFile {
  name: string;
  entries: SubtitleEntry[];
}

export interface ShadowingMode {
  enabled: boolean;
  delay: number;  // delay in seconds before audio plays
}

export type ParserResult =
  | { success: true; entries: SubtitleEntry[] }
  | { success: false; error: string };

export interface DedupeOptions {
  enabled: boolean;
  mode: 'rolling' | 'duplicate' | 'both';
}
