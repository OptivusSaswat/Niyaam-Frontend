"use client";

import { FileManager } from '@/components/file-manager';
import { ThemeProvider } from 'next-themes';

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-emerald-50/80 dark:bg-[#020805] transition-colors duration-500 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/30 dark:bg-emerald-600/15 rounded-full blur-[120px] transition-colors duration-500" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-400/30 dark:bg-teal-600/15 rounded-full blur-[120px] transition-colors duration-500" />
          <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-green-400/20 dark:bg-green-500/10 rounded-full blur-[100px] transition-colors duration-500" />
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
        </div>

        {/* Header Section */}
        <div className="w-full max-w-[80vw] mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Active
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 mb-3 drop-shadow-sm">
            File Manager
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 text-lg max-w-2xl font-medium">
            Manage your files and folders with ease. Click folders to navigate, hover over items for actions.
          </p>
        </div>

        {/* Main App Container - Max 80% width as requested */}
        <div className="w-full max-w-[80vw] relative z-10">
          <FileManager />
        </div>

      </div>
    </ThemeProvider>
  );
}
