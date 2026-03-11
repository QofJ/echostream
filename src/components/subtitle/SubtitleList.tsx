import { useSubtitleContext } from '@/context/SubtitleContext';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';
import type { SubtitleEntry } from '@/types/subtitle';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface SubtitleItemProps {
  entry: SubtitleEntry;
  isActive: boolean;
  onClick: () => void;
}

function SubtitleItem({ entry, isActive, onClick }: SubtitleItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition-colors
        ${isActive
          ? 'bg-indigo-500/20 border border-indigo-500/50'
          : 'hover:bg-slate-800'}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-xs text-slate-500 shrink-0 mt-0.5">
          {formatTime(entry.startTime)}
        </span>
        <p className={`text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
          {entry.text}
        </p>
      </div>
    </button>
  );
}

export function SubtitleList() {
  const { subtitleFile, currentIndex, updateCurrentTime } = useSubtitleContext();
  const { seek, audioFile } = useAudioPlayerContext();

  const handleSubtitleClick = (entry: SubtitleEntry) => {
    seek(entry.startTime);
    // Update subtitle immediately for better UX
    updateCurrentTime(entry.startTime);
  };

  if (!audioFile) {
    return null;
  }

  if (!subtitleFile) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No subtitle loaded</p>
        <p className="text-sm mt-1">Import an SRT or VTT file</p>
      </div>
    );
  }

  // Find the range of subtitles to display around current position
  const visibleRange = 5;
  const startIndex = Math.max(0, currentIndex - visibleRange);
  const endIndex = Math.min(subtitleFile.entries.length, currentIndex + visibleRange + 1);

  const visibleEntries = subtitleFile.entries.slice(startIndex, endIndex);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Subtitles</h3>
        <span className="text-xs text-slate-500">
          {subtitleFile.entries.length} entries
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
        {startIndex > 0 && (
          <div className="text-center text-xs text-slate-500 py-2">
            ↑ {startIndex} more above
          </div>
        )}

        {visibleEntries.map((entry: SubtitleEntry, idx: number) => (
          <SubtitleItem
            key={entry.index}
            entry={entry}
            isActive={startIndex + idx === currentIndex}
            onClick={() => handleSubtitleClick(entry)}
          />
        ))}

        {endIndex < subtitleFile.entries.length && (
          <div className="text-center text-xs text-slate-500 py-2">
            ↓ {subtitleFile.entries.length - endIndex} more below
          </div>
        )}
      </div>
    </div>
  );
}
