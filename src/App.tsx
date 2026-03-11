import { MainLayout } from '@/components/layout/MainLayout';
import { FileDropZone } from '@/components/import/FileDropZone';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { SubtitleDisplay } from '@/components/subtitle/SubtitleDisplay';
import { SubtitleList } from '@/components/subtitle/SubtitleList';
import { ABLoopController } from '@/components/looping/ABLoopController';
import { useAudioPlayerContext } from '@/context/AudioPlayerContext';

function AppContent() {
  const { audioFile } = useAudioPlayerContext();

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
