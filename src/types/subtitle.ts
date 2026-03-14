export interface SubtitleEntry {
  index: number;
  startTime: number;  // seconds
  endTime: number;    // seconds
  text: string;
  speakerChange?: boolean;  // true if text starts with ">>" marker
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

export interface FilterOptions {
  /** Minimum display duration in milliseconds (default: 100) */
  minDuration?: number;
  /** Skip entries with empty text (default: true) */
  skipEmpty?: boolean;
}

export interface DedupeOptions {
  enabled: boolean;
  mode: 'rolling' | 'duplicate' | 'both';
  filter?: FilterOptions;
}
