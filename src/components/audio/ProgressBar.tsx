import { useCallback } from 'react';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar() {
  const { state, seek, audioFile } = useAudioPlayerContext();
  const { currentTime, duration, loopStart, loopEnd } = state;

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  }, [duration, seek]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const loopStartPercent = loopStart !== null && duration > 0 ? (loopStart / duration) * 100 : null;
  const loopEndPercent = loopEnd !== null && duration > 0 ? (loopEnd / duration) * 100 : null;

  if (!audioFile) {
    return (
      <div className="w-full h-2 bg-slate-700 rounded-full" />
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleProgressClick}
        className="relative w-full h-2 bg-slate-700 rounded-full cursor-pointer group"
      >
        {/* Loop region highlight */}
        {loopStartPercent !== null && loopEndPercent !== null && (
          <div
            className="absolute h-full bg-indigo-500/30 rounded-full"
            style={{
              left: `${loopStartPercent}%`,
              width: `${loopEndPercent - loopStartPercent}%`,
            }}
          />
        )}

        {/* Loop start marker */}
        {loopStartPercent !== null && (
          <div
            className="absolute w-1 h-full bg-indigo-400 rounded-full -translate-x-1/2"
            style={{ left: `${loopStartPercent}%` }}
          />
        )}

        {/* Loop end marker */}
        {loopEndPercent !== null && (
          <div
            className="absolute w-1 h-full bg-indigo-400 rounded-full -translate-x-1/2"
            style={{ left: `${loopEndPercent}%` }}
          />
        )}

        {/* Progress bar */}
        <div
          className="absolute h-full bg-indigo-500 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute w-4 h-4 bg-indigo-400 rounded-full -translate-y-1 top-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-slate-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
