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
  onStartExport,
  isExporting
}) => {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-center gap-6 text-slate-900 select-none shrink-0 z-30 shadow-xs">
      {/* Suno Bookmarklet Trigger (Larger, Centered) */}
      <button
        onClick={onOpenBookmarkletModal}
        className="px-6 py-2.5 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-700 text-sm sm:text-base font-extrabold hover:bg-purple-100 hover:border-purple-300 transition shadow-xs cursor-pointer"
      >
        Suno連携
      </button>

      {/* Primary MP4 Export Button (Larger, Centered) */}
      <button
        onClick={onStartExport}
        disabled={isExporting}
        className="btn-blue px-8 py-2.5 rounded-xl text-sm sm:text-base font-black shadow-md shadow-blue-500/20 cursor-pointer"
      >
        {isExporting ? '書き出し中...' : 'MP4出力'}
      </button>
    </header>
  );
};
