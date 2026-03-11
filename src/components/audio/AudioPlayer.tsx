import { useEffect } from 'react';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';
import { useSubtitleContext } from '@/context/SubtitleContext';
import { ProgressBar } from './ProgressBar';
import { Controls } from './Controls';
import { SpeedControl } from './SpeedControl';

export function AudioPlayer() {
  const { state } = useAudioPlayerContext();
  const { updateCurrentTime } = useSubtitleContext();

  // Sync subtitles with audio time
  useEffect(() => {
    updateCurrentTime(state.currentTime);
  }, [state.currentTime, updateCurrentTime]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 space-y-6">
      <ProgressBar />
      <Controls />
      <SpeedControl />
    </div>
  );
}
