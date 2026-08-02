import React from 'react';
import type { LyricClip, AppSettings, MotionType } from '../types';
import { FONTS } from '../types';

interface CharInspectorProps {
  selectedClip: LyricClip | null;
  onUpdateClip: (updatedClip: LyricClip) => void;
  onToggleSplit: (clipId: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const CharInspector: React.FC<CharInspectorProps> = ({
  selectedClip,
  onUpdateClip,
  onToggleSplit,
  settings,
  onUpdateSettings
}) => {
  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-l border-slate-200/80 text-slate-900 p-4 sm:p-5 gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" />
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-mono">
            演出 & 文字編集
          </h3>
        </div>
      </div>

      {/* Selected Clip Detail & Char Breakout Section */}
      {selectedClip ? (
        <div className="flex flex-col gap-4 bg-white/90 border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-blue-600">編集中のテロップ</span>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedClip.start_s.toFixed(1)}s ~ {selectedClip.end_s.toFixed(1)}s
            </span>
          </div>

          {/* Text Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">歌詞テキスト</label>
            <input
              type="text"
              value={selectedClip.text}
              onChange={(e) => onUpdateClip({ ...selectedClip, text: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Big Split Button */}
          <button
            onClick={() => onToggleSplit(selectedClip.id)}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              selectedClip.isSplit
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 border border-purple-400 ring-2 ring-purple-300'
                : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'
            }`}
          >
            <span className="text-base">🧩</span>
            <span>{selectedClip.isSplit ? '文字バラけ解除' : '✨ 一文字ずつ分解（文字バラけ）'}</span>
          </button>

          {/* Character Breakout Options if Split */}
          {selectedClip.isSplit && (
            <div className="flex flex-col gap-3.5 p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <span>✨ 分解済みレイヤー</span>
                  <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-extrabold shadow-xs">
                    {selectedClip.text.length}文字
                  </span>
                </span>
              </div>

              {/* Character Preview Grid */}
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedClip.text).map((ch, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-xl bg-white border border-purple-300 flex items-center justify-center font-black text-base text-purple-900 shadow-xs"
                  >
                    {ch}
                  </div>
                ))}
              </div>

              {/* Motion Presets for Characters */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-purple-900 font-bold">文字演出アニメーション</label>
                <select
                  value={selectedClip.motionType || 'stagger-pop'}
                  onChange={(e) => onUpdateClip({ ...selectedClip, motionType: e.target.value as MotionType })}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="stagger-pop">Stagger Pop (順番にポップイン)</option>
                  <option value="kinetic-bounce">Kinetic Bounce (跳躍バウンス)</option>
                  <option value="glitch-flicker">Glitch Flicker (サイバー明滅)</option>
                  <option value="rotate-in">3D Rotate In (3D回転着地)</option>
                  <option value="wave-float">Wave Float (波状浮遊)</option>
                  <option value="typewriter">Typewriter (タイプライター)</option>
                  <option value="cinematic-fade">Cinematic Fade (フェード表示)</option>
                </select>
              </div>

              {/* Stagger Delay slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-purple-900 font-semibold">
                  <span>文字表示インターバル:</span>
                  <span className="font-mono font-bold text-purple-600">{selectedClip.staggerDelay || 0.08}秒</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.3"
                  step="0.01"
                  value={selectedClip.staggerDelay || 0.08}
                  onChange={(e) => onUpdateClip({ ...selectedClip, staggerDelay: parseFloat(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-100 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Typography Control */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs text-slate-500 font-semibold">フォント</label>
            <select
              value={selectedClip.fontFamily || settings.fontFamily}
              onChange={(e) => onUpdateClip({ ...selectedClip, fontFamily: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
            >
              {FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-white/50 border border-slate-200/80 rounded-2xl text-center text-xs text-slate-500 italic">
          タイムライン上のテロップブロックをクリックすると、文字ごとのアニメーション編集や「文字バラけ」を設定できます。
        </div>
      )}

      {/* Export Config */}
      <div className="flex flex-col gap-3 bg-white/80 border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
          ⚙️ 画質設定
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">解像度</label>
            <select
              value={settings.resolution}
              onChange={(e) => onUpdateSettings({ resolution: e.target.value as any })}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-bold"
            >
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
              <option value="720p">720p (HD)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">フレームレート</label>
            <select
              value={settings.fps}
              onChange={(e) => onUpdateSettings({ fps: parseInt(e.target.value) as any })}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-bold"
            >
              <option value="60">60 fps (滑らか)</option>
              <option value="30">30 fps (標準)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
