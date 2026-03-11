import { useSubtitleContext } from '@/context/SubtitleContext';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';

export function SubtitleDisplay() {
  const { getCurrentSubtitle, getNextSubtitle, shadowingMode, setShadowingMode } = useSubtitleContext();
  const { audioFile } = useAudioPlayerContext();

  const currentSubtitle = getCurrentSubtitle();
  const nextSubtitle = getNextSubtitle();

  if (!audioFile) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Load an audio file to start</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Shadowing mode toggle */}
      <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">Shadowing Mode</span>
          <button
            onClick={() => setShadowingMode(!shadowingMode.enabled, shadowingMode.delay)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${shadowingMode.enabled ? 'bg-indigo-500' : 'bg-slate-600'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${shadowingMode.enabled ? 'left-7' : 'left-1'}
              `}
            />
          </button>
        </div>
        {shadowingMode.enabled && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Delay:</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={shadowingMode.delay}
              onChange={(e) => setShadowingMode(true, parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-slate-300 w-8">{shadowingMode.delay}s</span>
          </div>
        )}
      </div>

      {/* Current subtitle */}
      <div className="bg-slate-800 rounded-xl p-6 text-center min-h-[120px] flex flex-col justify-center">
        {currentSubtitle ? (
          <p className="text-xl md:text-2xl text-white leading-relaxed">
            {currentSubtitle.text}
          </p>
        ) : (
          <p className="text-slate-500 italic">
            {nextSubtitle ? 'Get ready...' : 'Waiting for subtitle...'}
          </p>
        )}
      </div>

      {/* Next subtitle preview */}
      {nextSubtitle && (
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Next:</p>
          <p className="text-sm text-slate-400">{nextSubtitle.text}</p>
        </div>
      )}
    </div>
  );
}
