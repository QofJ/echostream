import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AudioPlayerProvider } from '@/context/AudioPlayerContext';
import { SubtitleProvider } from '@/context/SubtitleContext';
import { PersistenceProvider } from '@/context/PersistenceContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistenceProvider>
      <AudioPlayerProvider>
        <SubtitleProvider>
          <App />
        </SubtitleProvider>
      </AudioPlayerProvider>
    </PersistenceProvider>
  </StrictMode>,
);
