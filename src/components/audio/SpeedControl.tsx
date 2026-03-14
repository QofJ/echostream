import { useAudioPlayerContext } from '@/context/AudioPlayerContext';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function SpeedControl() {
  const { state, setPlaybackRate, audioFile } = useAudioPlayerContext();
  const { playbackRate } = state;

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIndex]);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Speed:</span>
      <button
        onClick={cycleSpeed}
        disabled={!audioFile}
        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors min-w-[4rem]"
        title="Click to change speed"
      >
        {playbackRate}x
      </button>
      <div className="flex gap-1 hidden sm:flex">
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            onClick={() => setPlaybackRate(speed)}
            disabled={!audioFile}
            className={`
              px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${playbackRate === speed
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
            `}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
