import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioPlayerState, AudioFile } from '@/types/subtitle';

export interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  state: AudioPlayerState;
  audioFile: AudioFile | null;
  loadAudio: (file: File) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setLoopPoints: (start: number | null, end: number | null) => void;
  clearLoopPoints: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  skip: (seconds: number) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    loopStart: null,
    loopEnd: null,
    volume: 1,
    isMuted: false,
  });

  // Create audio element if not exists
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;

      // Check for loop
      if (state.loopEnd !== null && currentTime >= state.loopEnd && state.loopStart !== null) {
        audio.currentTime = state.loopStart;
        return;
      }

      setState(prev => ({ ...prev, currentTime }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      // If loop is set, restart from loop start
      if (state.loopStart !== null) {
        audio.currentTime = state.loopStart;
        audio.play();
      } else {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [state.loopStart, state.loopEnd]);

  const loadAudio = useCallback((file: File) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Revoke previous URL
    if (audioFile?.url) {
      URL.revokeObjectURL(audioFile.url);
    }

    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.load();

    setAudioFile({
      name: file.name,
      url,
      file,
    });

    setState(prev => ({
      ...prev,
      currentTime: 0,
      isPlaying: false,
      loopStart: null,
      loopEnd: null,
    }));
  }, [audioFile]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [state.isPlaying]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedRate = Math.max(0.5, Math.min(2, rate));
    audio.playbackRate = clampedRate;
    setState(prev => ({ ...prev, playbackRate: clampedRate }));
  }, []);

  const setLoopPoints = useCallback((start: number | null, end: number | null) => {
    setState(prev => ({
      ...prev,
      loopStart: start,
      loopEnd: end,
    }));
  }, []);

  const clearLoopPoints = useCallback(() => {
    setState(prev => ({
      ...prev,
      loopStart: null,
      loopEnd: null,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    audio.volume = clampedVolume;
    setState(prev => ({
      ...prev,
      volume: clampedVolume,
      isMuted: clampedVolume === 0,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0));
  }, []);

  return {
    audioRef,
    state,
    audioFile,
    loadAudio,
    togglePlay,
    seek,
    setPlaybackRate,
    setLoopPoints,
    clearLoopPoints,
    setVolume,
    toggleMute,
    skip,
  };
}
