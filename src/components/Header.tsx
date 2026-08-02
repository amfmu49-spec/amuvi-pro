import React from 'react';

interface HeaderProps {
  onOpenBookmarkletModal: () => void;
  onLoadSample: () => void;
  onStartExport: () => void;
  isExporting: boolean;
  songTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBookmarkletModal,
  onLoadSample,
  onStartExport,
  isExporting,
  songTitle
}) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/80 px-4 sm:px-6 flex items-center justify-between text-slate-900 select-none shrink-0 z-30 shadow-sm">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-white text-base shrink-0">
          A
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AMUVI
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-600 text-white tracking-widest uppercase shadow-xs">
              PRO
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 border border-slate-200 shadow-2xs">
              ver 2.0.0
            </span>
          </div>
        </div>

        {songTitle && (
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 text-xs text-slate-500">
            <span className="truncate max-w-[180px] font-semibold">{songTitle}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Suno Bookmarklet Trigger */}
        <button
          onClick={onOpenBookmarkletModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-700 text-xs sm:text-sm font-bold hover:bg-purple-100 hover:border-purple-300 transition shadow-xs"
        >
          <span className="text-base">✨</span>
          <span>Suno連携</span>
        </button>

        {/* Load Sample Data */}
        <button
          onClick={onLoadSample}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100/60 border border-slate-200/60 text-slate-500 text-xs font-semibold hover:text-slate-800 hover:bg-slate-200/80 transition"
        >
          サンプル
        </button>

        {/* Large Primary MP4 Export Button */}
        <button
          onClick={onStartExport}
          disabled={isExporting}
          className="btn-blue flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-blue-500/20"
        >
          {isExporting ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              <span>書き出し中...</span>
            </>
          ) : (
            <>
              <span className="text-base">🎬</span>
              <span>MP4出力</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
