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
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-4 gap-5 overflow-y-auto custom-scrollbar">
      {/* Header Branding */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
            Inspector & Effects
          </h3>
        </div>
      </div>

      {/* Preset Themes Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎨 1-Click Pro Themes</span>
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
                className={`flex flex-col p-2.5 rounded-xl text-left border transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/10 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xs font-bold">{theme.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{theme.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Clip Detail & Char Breakout Section */}
      {selectedClip ? (
        <div className="flex flex-col gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300">選択中クリップ</span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold">ID: {selectedClip.id.slice(0,6)}</span>
          </div>

          {/* Text Input & Split Action */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">歌詞テキスト</label>
            <input
              type="text"
              value={selectedClip.text}
              onChange={(e) => onUpdateClip({ ...selectedClip, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-100 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Big Split Button */}
          <button
            onClick={() => onToggleSplit(selectedClip.id)}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              selectedClip.isSplit
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 border border-purple-400 ring-2 ring-purple-400/40'
                : 'bg-gradient-to-r from-slate-800 to-purple-950 text-purple-300 border border-purple-500/40 hover:border-purple-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🧩</span>
            <span>{selectedClip.isSplit ? '一文字バラけ解除' : '✨ 一文字ずつ分解（文字バラけ）'}</span>
          </button>

          {/* Character Breakout Options if Split */}
          {selectedClip.isSplit && (
            <div className="flex flex-col gap-3 p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  <span>✨ 文字分解レイヤー</span>
                  <span className="text-[10px] bg-purple-500/30 border border-purple-400/40 px-1.5 py-0.2 rounded text-purple-200">
                    {selectedClip.text.length}文字
                  </span>
                </span>
              </div>

              {/* Character Preview Grid */}
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selectedClip.text).map((ch, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-100 shadow-sm"
                  >
                    {ch}
                  </div>
                ))}
              </div>

              {/* Motion Presets for Characters */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-purple-300 font-semibold">文字演出モーション</label>
                <select
                  value={selectedClip.motionType || 'stagger-pop'}
                  onChange={(e) => onUpdateClip({ ...selectedClip, motionType: e.target.value as MotionType })}
                  className="w-full bg-slate-950 border border-purple-700/60 rounded-lg px-2.5 py-1.5 text-xs text-purple-100 focus:outline-none"
                >
                  <option value="stagger-pop">Stagger Pop (順番に弾ける)</option>
                  <option value="kinetic-bounce">Kinetic Bounce (ダイナミックバウンス)</option>
                  <option value="glitch-flicker">Glitch Flicker (サイバー明滅)</option>
                  <option value="rotate-in">3D Rotate In (3D回転着地)</option>
                  <option value="wave-float">Wave Float (浮遊ウェーブ)</option>
                  <option value="typewriter">Typewriter (タイプライター)</option>
                  <option value="cinematic-fade">Cinematic Fade (シネマティック表示)</option>
                </select>
              </div>

              {/* Stagger Delay slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-purple-300">
                  <span>文字出現ディレイ:</span>
                  <span className="font-mono">{selectedClip.staggerDelay || 0.08}s</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.3"
                  step="0.01"
                  value={selectedClip.staggerDelay || 0.08}
                  onChange={(e) => onUpdateClip({ ...selectedClip, staggerDelay: parseFloat(e.target.value) })}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>
          )}

          {/* Typography Control */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-400">フォントスタイル</label>
            <select
              value={selectedClip.fontFamily || settings.fontFamily}
              onChange={(e) => onUpdateClip({ ...selectedClip, fontFamily: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500 italic">
          タイムライン上のテロップブロックをクリックすると、文字ごとのアニメーション編集や「文字バラけ」が設定できます。
        </div>
      )}

      {/* High-Quality Render Controls */}
      <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          ⚙️ Pro Export Settings
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">解像度</label>
            <select
              value={settings.resolution}
              onChange={(e) => onUpdateSettings({ resolution: e.target.value as any })}
              className="bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
            >
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
              <option value="720p">720p (HD)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">フレームレート</label>
            <select
              value={settings.fps}
              onChange={(e) => onUpdateSettings({ fps: parseInt(e.target.value) as any })}
              className="bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
            >
              <option value="60">60 fps (超滑らか)</option>
              <option value="30">30 fps (標準)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
