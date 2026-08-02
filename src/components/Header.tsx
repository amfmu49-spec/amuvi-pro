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
    <header className="h-16 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between text-slate-100 select-none shrink-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950 text-base shrink-0">
          A
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              AMUVI
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 tracking-widest uppercase">
              PRO
            </span>
          </div>
        </div>

        {songTitle && (
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs text-slate-400">
            <span className="truncate max-w-[180px] font-semibold">{songTitle}</span>
          </div>
        )}
      </div>

      {/* Action Buttons - Larger & Streamlined */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Suno Bookmarklet Trigger */}
        <button
          onClick={onOpenBookmarkletModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-bold hover:border-purple-400 hover:bg-purple-900/60 transition shadow-sm"
        >
          <span className="text-base">✨</span>
          <span>Suno連携</span>
        </button>

        {/* Audio Upload */}
        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition shadow-sm">
          <span className="text-base">🎵</span>
          <span>音楽選択</span>
          <input type="file" accept="audio/*" onChange={onAudioUpload} className="hidden" />
        </label>

        {/* Load Sample Data */}
        <button
          onClick={onLoadSample}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-semibold hover:text-slate-200 hover:bg-slate-800/80 transition"
        >
          サンプル
        </button>

        {/* Large Primary MP4 Export Button */}
        <button
          onClick={onStartExport}
          disabled={isExporting}
          className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xl"
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
