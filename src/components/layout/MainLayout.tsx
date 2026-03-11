import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">
            <span className="text-indigo-400">Echo</span>Stream
          </h1>
          <p className="text-xs text-slate-500">Shadowing Practice</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          <p>Works offline • Import your own audio & subtitles</p>
        </div>
      </footer>
    </div>
  );
}
