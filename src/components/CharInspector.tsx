import React from 'react';
import type { LyricClip, AppSettings, MotionType } from '../types';
import { FONTS, PRESET_THEMES } from '../types';

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
    <div className="flex flex-col h-full bg-[#080c16]/95 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-4 sm:p-5 gap-5 overflow-y-auto custom-scrollbar">
      {/* Header Branding */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
          <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider font-mono">
            演出 & 文字編集
          </h3>
        </div>
      </div>

      {/* Preset Themes Selector */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎨 1-Click Pro テーマ</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PRESET_THEMES).map(theme => {
            const isCurrent = settings.currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onUpdateSettings({
                    currentTheme: theme.id,
                    fontFamily: theme.fontFamily,
                    textColor: theme.textColor,
                    glowColor: theme.glowColor,
                    visualizerType: theme.visualizerType,
                    motionType: theme.defaultMotion
                  });
                }}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/15 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <span className="text-xs font-extrabold">{theme.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-1">{theme.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Clip Detail & Char Breakout Section */}
      {selectedClip ? (
        <div className="flex flex-col gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-amber-300">編集中のテロップ</span>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedClip.start_s.toFixed(1)}s ~ {selectedClip.end_s.toFixed(1)}s
            </span>
          </div>

          {/* Text Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">歌詞テキスト</label>
            <input
              type="text"
              value={selectedClip.text}
              onChange={(e) => onUpdateClip({ ...selectedClip, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 font-bold focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Big Split Button */}
          <button
            onClick={() => onToggleSplit(selectedClip.id)}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              selectedClip.isSplit
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 border border-purple-400 ring-2 ring-purple-400/40'
                : 'bg-gradient-to-r from-slate-800 to-purple-950 text-purple-200 border border-purple-500/40 hover:border-purple-400 hover:text-white'
            }`}
          >
            <span className="text-base">🧩</span>
            <span>{selectedClip.isSplit ? '文字バラけ解除' : '✨ 一文字ずつ分解（文字バラけ）'}</span>
          </button>

          {/* Character Breakout Options if Split */}
          {selectedClip.isSplit && (
            <div className="flex flex-col gap-3.5 p-3.5 bg-purple-950/40 border border-purple-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <span>✨ 分解済みレイヤー</span>
                  <span className="text-[10px] bg-purple-500/40 border border-purple-400/50 px-2 py-0.5 rounded-full text-purple-100 font-extrabold">
                    {selectedClip.text.length}文字
                  </span>
                </span>
              </div>

              {/* Character Preview Grid */}
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedClip.text).map((ch, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-400/50 flex items-center justify-center font-black text-base text-purple-100 shadow-md"
                  >
                    {ch}
                  </div>
                ))}
              </div>

              {/* Motion Presets for Characters */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-purple-200 font-bold">文字演出アニメーション</label>
                <select
                  value={selectedClip.motionType || 'stagger-pop'}
                  onChange={(e) => onUpdateClip({ ...selectedClip, motionType: e.target.value as MotionType })}
                  className="w-full bg-slate-950 border border-purple-600/60 rounded-xl px-3 py-2 text-xs font-bold text-purple-100 focus:outline-none"
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
                <div className="flex justify-between text-xs text-purple-200 font-semibold">
                  <span>文字表示インターバル:</span>
                  <span className="font-mono font-bold text-amber-300">{selectedClip.staggerDelay || 0.08}秒</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.3"
                  step="0.01"
                  value={selectedClip.staggerDelay || 0.08}
                  onChange={(e) => onUpdateClip({ ...selectedClip, staggerDelay: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Typography Control */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-400 font-semibold">フォント</label>
            <select
              value={selectedClip.fontFamily || settings.fontFamily}
              onChange={(e) => onUpdateClip({ ...selectedClip, fontFamily: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500 italic">
          タイムライン上のテロップブロックをクリックすると、文字ごとのアニメーション編集や「文字バラけ」を設定できます。
        </div>
      )}

      {/* Export Config */}
      <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          ⚙️ 画質設定
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">解像度</label>
            <select
              value={settings.resolution}
              onChange={(e) => onUpdateSettings({ resolution: e.target.value as any })}
              className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-bold"
            >
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
              <option value="720p">720p (HD)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">フレームレート</label>
            <select
              value={settings.fps}
              onChange={(e) => onUpdateSettings({ fps: parseInt(e.target.value) as any })}
              className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-bold"
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
