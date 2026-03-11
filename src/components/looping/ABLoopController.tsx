import { useAudioPlayerContext } from '@/context/AudioPlayerContext';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ABLoopController() {
  const { state, setLoopPoints, clearLoopPoints, audioFile } = useAudioPlayerContext();
  const { currentTime, loopStart, loopEnd } = state;

  const handleSetLoopStart = () => {
    setLoopPoints(currentTime, loopEnd);
  };

  const handleSetLoopEnd = () => {
    if (loopStart !== null && currentTime <= loopStart) {
      // Can't set end before start
      return;
    }
    setLoopPoints(loopStart, currentTime);
  };

  const handleClearLoop = () => {
    clearLoopPoints();
  };

  const isLoopActive = loopStart !== null && loopEnd !== null;

  if (!audioFile) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">A-B Loop</h3>
        {isLoopActive && (
          <button
            onClick={handleClearLoop}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Loop
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSetLoopStart}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${loopStart !== null
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
          `}
        >
          <div className="text-center">
            <div>Set A</div>
            {loopStart !== null && (
              <div className="text-xs opacity-75">{formatTime(loopStart)}</div>
            )}
          </div>
        </button>

        <button
          onClick={handleSetLoopEnd}
          disabled={loopStart === null || currentTime <= (loopStart ?? 0)}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${loopEnd !== null
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
          `}
        >
          <div className="text-center">
            <div>Set B</div>
            {loopEnd !== null && (
              <div className="text-xs opacity-75">{formatTime(loopEnd)}</div>
            )}
          </div>
        </button>
      </div>

      {isLoopActive && (
        <div className="text-center text-xs text-slate-400">
          Loop: {formatTime(loopStart)} → {formatTime(loopEnd)}
          <span className="ml-2 text-indigo-400">
            ({formatTime(loopEnd - loopStart)})
          </span>
        </div>
      )}

      {!isLoopActive && loopStart !== null && (
        <div className="text-center text-xs text-slate-500">
          A set at {formatTime(loopStart)}. Now seek to where you want B.
        </div>
      )}
    </div>
  );
}
