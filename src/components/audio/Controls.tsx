import { useAudioPlayerContext } from '@/context/AudioPlayerContext';
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaVolumeUp,
  FaVolumeMute,
} from 'react-icons/fa';

export function Controls() {
  const {
    state,
    audioFile,
    togglePlay,
    skip,
    toggleMute,
    setVolume
  } = useAudioPlayerContext();

  const { isPlaying, volume, isMuted } = state;

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Skip backward */}
      <button
        onClick={() => skip(-5)}
        disabled={!audioFile}
        className="p-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Skip back 5s"
      >
        <FaBackward className="w-5 h-5" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        disabled={!audioFile}
        className="p-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <FaPause className="w-6 h-6 text-white" />
        ) : (
          <FaPlay className="w-6 h-6 text-white ml-0.5" />
        )}
      </button>

      {/* Skip forward */}
      <button
        onClick={() => skip(5)}
        disabled={!audioFile}
        className="p-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Skip forward 5s"
      >
        <FaForward className="w-5 h-5" />
      </button>

      {/* Volume */}
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={toggleMute}
          disabled={!audioFile}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <FaVolumeMute className="w-4 h-4" />
          ) : (
            <FaVolumeUp className="w-4 h-4" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          disabled={!audioFile}
          className="w-20 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
