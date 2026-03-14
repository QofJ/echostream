# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EchoStream is a PWA for English podcast shadowing practice. It loads audio files and subtitle files (SRT/VTT), displays synchronized subtitles, and supports A-B loop playback for language learning.

## Workflow

Always create a new branch before making changes:
```bash
git checkout -b <type>/<description>   # e.g., fix/speaker-marker-parsing
```

After changes: commit → push → create PR → merge → deploy.

## Commands

```bash
npm run dev      # Start development server (port 5173)
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint
npm run deploy   # Build and deploy to GitHub Pages
```

## Architecture

### Provider Hierarchy (main.tsx)
```
PersistenceProvider → AudioPlayerProvider → SubtitleProvider → App
```

### Core Hooks
- `useAudioPlayer` - Audio element control, playback state, A-B looping, playback rate
- `useSubtitleSync` - Subtitle state, current entry tracking based on audio time
- `usePersistence` - IndexedDB save/restore for audio and subtitle files

### Subtitle Parsing Pipeline (src/lib/subtitle-parser/)
1. `parseSrt` or `parseVtt` - Parse raw format into `SubtitleEntry[]`
2. `filterSubtitleEntries` - Remove empty entries
3. `dedupeRollingSubtitles` - Remove rolling/duplicate entries common in auto-generated captions
4. Result stored in SubtitleContext

The pipeline is orchestrated in `index.ts:parseSubtitle()`.

### Speaker Change Detection
Subtitles may contain `>>` markers indicating speaker changes. Both parsers detect these on any line and set `speakerChange: true` on the entry while removing the markers from text.

### Persistence (src/lib/storage/)
Uses IndexedDB to persist audio and subtitle files. On restore, subtitle files are re-parsed to apply any parser updates.

### Path Alias
`@/` maps to `src/` (configured in vite.config.ts).
