import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileDropZone } from '@/components/import/FileDropZone';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { SubtitleDisplay } from '@/components/subtitle/SubtitleDisplay';
import { SubtitleList } from '@/components/subtitle/SubtitleList';
import { ABLoopController } from '@/components/looping/ABLoopController';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';
import { useSubtitleContext } from '@/context/SubtitleContext';
import { usePersistence } from '@/hooks/usePersistence';
import { readSubtitleFile } from '@/lib/subtitle-parser';

function AppContent() {
  const { audioFile, loadAudio } = useAudioPlayerContext();
  const { loadSubtitles } = useSubtitleContext();
  const { restoreData, isRestoring } = usePersistence();

  // Restore data from IndexedDB on mount
  useEffect(() => {
    restoreData().then(async (result) => {
      if (result.audio) {
        const file = new File([result.audio.blob], result.audio.name, {
          type: result.audio.type,
        });
        loadAudio(file);
      }
      if (result.subtitle) {
        // Re-parse the subtitle file to apply latest parser logic
        const file = new File([result.subtitle.blob], result.subtitle.name);
        const parsed = await readSubtitleFile(file);
        if (parsed.success) {
          loadSubtitles(parsed.entries, result.subtitle.name);
        }
      }
    });
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-slate-400">Restoring files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropZone />

      {audioFile && (
        <>
          <AudioPlayer />
          <SubtitleDisplay />
          <ABLoopController />
          <SubtitleList />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <MainLayout>
      <AppContent />
    </MainLayout>
  );
}

export default App;
