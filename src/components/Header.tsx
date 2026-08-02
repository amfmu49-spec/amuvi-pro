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
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between text-slate-900 select-none shrink-0 z-30 shadow-xs">
      {/* Song Title Display (If loaded) */}
      <div className="flex items-center gap-2">
        {songTitle ? (
          <span className="text-xs sm:text-sm font-extrabold text-slate-700 truncate max-w-[200px] sm:max-w-[300px]">
            {songTitle}
          </span>
        ) : (
          <span className="text-xs font-bold text-slate-400">AMUVI PRO</span>
        )}
      </div>

      {/* Action Buttons (Text only, no emojis) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Suno Bookmarklet Trigger */}
        <button
          onClick={onOpenBookmarkletModal}
          className="flex items-center justify-center px-4 py-2 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-700 text-xs sm:text-sm font-bold hover:bg-purple-100 hover:border-purple-300 transition shadow-xs"
        >
          Suno連携
        </button>

        {/* Load Sample Data */}
        <button
          onClick={onLoadSample}
          className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-600 text-xs font-bold hover:text-slate-900 hover:bg-slate-200/80 transition"
        >
          サンプル
        </button>

        {/* Primary MP4 Export Button (Text only, no emojis) */}
        <button
          onClick={onStartExport}
          disabled={isExporting}
          className="btn-blue flex items-center justify-center px-5 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-500/20"
        >
          {isExporting ? '書き出し中...' : 'MP4出力'}
        </button>
      </div>
    </header>
  );
};
