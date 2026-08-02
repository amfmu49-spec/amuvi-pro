import React, { useState } from 'react';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Mini inline version of bookmarklet for quick copy
  const bookmarkletCode = `javascript:(function(){let script=document.createElement('script');script.src='https://amfmu49-spec.github.io/amuvi-pro/amuvi_pro_bookmarklet.js?v=' + Date.now();document.body.appendChild(script);})();`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-lg font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            ✨
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-100">AMUVI PRO 専用 Sunoブックマークレット</h3>
            <p className="text-xs text-slate-400">Sunoの楽曲ページから歌詞と音声をワンタップで引き渡します</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="font-bold text-amber-300">使い方手順:</div>
          <ol className="list-decimal list-inside space-scroll space-y-1.5 text-slate-300">
            <li>下の「ブックマークレットコードをコピー」を押す</li>
            <li>ブラウザのブックマークを作成し、URL欄に貼り付け</li>
            <li>Suno (<span className="font-mono text-amber-400">suno.com/song/...</span>) の楽曲ページでブックマークをクリック！</li>
          </ol>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">ブックマークレットJavaScriptコード:</label>
          <textarea
            readOnly
            value={bookmarkletCode}
            className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-purple-300 resize-none focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 btn-gold py-3 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2"
          >
            {copied ? '✅ コピー完了！' : '📋 ブックマークレットコードをコピー'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
