import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AudioPlayerProvider } from '@/context/AudioPlayerContext';
import { SubtitleProvider } from '@/context/SubtitleContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioPlayerProvider>
      <SubtitleProvider>
        <App />
      </SubtitleProvider>
    </AudioPlayerProvider>
  </StrictMode>,
);
