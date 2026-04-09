import { FileManager } from '@/components/file-manager';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] noise-bg flex flex-col items-center justify-center p-6 md:p-12">
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Section */}
      <div className="w-full max-w-[80vw] mb-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          File Manager
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          Manage your files and folders with ease. Double-click folders to navigate, hover over items for actions.
        </p>
      </div>

      {/* Main App Container - Max 80% width as requested */}
      <div className="w-full max-w-[80vw] relative z-10">
        <FileManager />
      </div>

    </div>
  );
}