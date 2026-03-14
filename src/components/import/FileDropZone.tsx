import { useCallback, useState, useRef } from 'react';
import { FaCloudUploadAlt, FaMusic, FaClosedCaptioning, FaTrash } from 'react-icons/fa';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';
import { useSubtitleContext } from '@/context/SubtitleContext';
import { usePersistence } from '@/hooks/usePersistence';
import { readSubtitleFile } from '@/lib/subtitle-parser';

export function FileDropZone() {
  const { loadAudio, audioFile } = useAudioPlayerContext();
  const { loadSubtitles, subtitleFile } = useSubtitleContext();
  const { saveAudio, saveSubtitle, clearAllData, hasStoredData, error: persistenceError } = usePersistence();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      const ext = file.name.toLowerCase().split('.').pop();

      if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext || '')) {
        loadAudio(file);
        saveAudio(file).catch(console.error);
      } else if (['srt', 'vtt'].includes(ext || '')) {
        const result = await readSubtitleFile(file);
        if (result.success) {
          loadSubtitles(result.entries, file.name);
          saveSubtitle(file).catch(console.error);
        } else {
          setError(result.error);
        }
      }
    }
  }, [loadAudio, loadSubtitles, saveAudio, saveSubtitle]);

  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadAudio(file);
      saveAudio(file).catch(console.error);
    }
  }, [loadAudio, saveAudio]);

  const handleSubtitleSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const result = await readSubtitleFile(file);
      if (result.success) {
        loadSubtitles(result.entries, file.name);
        saveSubtitle(file).catch(console.error);
      } else {
        setError(result.error);
      }
    }
  }, [loadSubtitles, saveSubtitle]);

  const handleClearCache = useCallback(async () => {
    try {
      await clearAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    }
  }, [clearAllData]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-600 hover:border-slate-500'}
        `}
      >
        <FaCloudUploadAlt className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-300 mb-2">Drag & drop audio or subtitle files here</p>
        <p className="text-slate-500 text-sm">Supports MP3, WAV, OGG, M4A, FLAC, AAC, SRT, VTT</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => audioInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <FaMusic className="text-indigo-400" />
          <span>{audioFile ? 'Change Audio' : 'Select Audio'}</span>
        </button>
        <button
          onClick={() => subtitleInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <FaClosedCaptioning className="text-cyan-400" />
          <span>{subtitleFile ? 'Change Subtitle' : 'Select Subtitle'}</span>
        </button>
      </div>

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
        onChange={handleAudioSelect}
        className="hidden"
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt"
        onChange={handleSubtitleSelect}
        className="hidden"
      />

      {(audioFile || subtitleFile) && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          {audioFile && (
            <div className="flex items-center gap-2 text-sm">
              <FaMusic className="text-indigo-400" />
              <span className="text-slate-300 truncate">{audioFile.name}</span>
            </div>
          )}
          {subtitleFile && (
            <div className="flex items-center gap-2 text-sm">
              <FaClosedCaptioning className="text-cyan-400" />
              <span className="text-slate-300 truncate">{subtitleFile.name}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {persistenceError && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-300 text-sm">
          {persistenceError}
        </div>
      )}

      {hasStoredData && (
        <button
          onClick={handleClearCache}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FaTrash />
          <span>Clear Cached Files</span>
        </button>
      )}
    </div>
  );
}
