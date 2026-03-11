import { createContext, useContext, type ReactNode } from 'react';
import { useAudioPlayer, type UseAudioPlayerReturn } from '@/hooks/useAudioPlayer';

const AudioPlayerContext = createContext<UseAudioPlayerReturn | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayerContext(): UseAudioPlayerReturn {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within AudioPlayerProvider');
  }
  return context;
}
