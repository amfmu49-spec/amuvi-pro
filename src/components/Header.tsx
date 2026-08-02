import React from 'react';

interface HeaderProps {
  onOpenBookmarkletModal: () => void;
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: () => void;
  onStartExport: () => void;
  isExporting: boolean;
  songTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBookmarkletModal,
  onAudioUpload,
  onLoadSample,
  onStartExport,
  isExporting,
  songTitle
}) => {
  return (
    <header className="h-14 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between text-slate-100 select-none shrink-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950 text-xs sm:text-sm shrink-0">
          A
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              AMUVI
            </span>
            <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-amber-500 text-slate-950 tracking-widest">
              PRO
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] text-slate-500 -mt-1 font-mono">HIGH-QUALITY LYRIC VIDEO</span>
        </div>

        {songTitle && (
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs">
            <span className="text-slate-500">楽曲:</span>
            <span className="font-bold text-slate-300 max-w-[160px] truncate">{songTitle}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Suno Bookmarklet Trigger */}
        <button
          onClick={onOpenBookmarkletModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-bold hover:border-purple-400 transition"
        >
          <span>✨</span>
          <span className="hidden sm:inline">Suno連携</span>
        </button>

        {/* Audio Upload */}
        <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-800 transition">
          <span>🎵</span>
          <span className="hidden sm:inline">音楽</span>
          <input type="file" accept="audio/*" onChange={onAudioUpload} className="hidden" />
        </label>

        {/* Load Sample Data (hidden on very small screens) */}
        <button
          onClick={onLoadSample}
          className="hidden md:inline-block px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold hover:text-slate-200 transition"
        >
          サンプル
        </button>

        {/* MP4 Export Button */}
        <button
          onClick={onStartExport}
          disabled={isExporting}
          className="btn-gold flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black shadow-lg"
        >
          {isExporting ? (
            <>
              <span className="animate-spin text-sm">⏳</span>
              <span className="hidden sm:inline">出力中...</span>
            </>
          ) : (
            <>
              <span className="text-sm">🎬</span>
              <span>MP4出力</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
