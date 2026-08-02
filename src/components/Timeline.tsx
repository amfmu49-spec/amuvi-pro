import React, { useRef, useState, useEffect } from 'react';
import type { LyricClip } from '../types';

interface TimelineProps {
  lyrics: LyricClip[];
  currentTime: number; // in seconds
  duration: number; // in seconds
  onSeek: (timeInSeconds: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onToggleSplit: (clipId: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  lyrics,
  currentTime,
  duration,
  onSeek,
  selectedClipId,
  onSelectClip,
  onToggleSplit,
  isPlaying,
  onTogglePlay
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomY, setZoomY] = useState<number>(45); // pixels per second vertically
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const effectiveDuration = Math.max(duration || 60, 30);
  const timelineHeight = Math.max(800, effectiveDuration * zoomY);

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top + containerRef.current.scrollTop - 24; // minus ruler top offset
    const targetTime = Math.max(0, Math.min(effectiveDuration, clickY / zoomY));
    onSeek(targetTime);
    setIsScrubbing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isScrubbing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top + containerRef.current.scrollTop - 24;
    const targetTime = Math.max(0, Math.min(effectiveDuration, clickY / zoomY));
    onSeek(targetTime);
  };

  const handleMouseUp = () => {
    if (isScrubbing) setIsScrubbing(false);
  };

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isScrubbing, zoomY, effectiveDuration]);

  // Auto-scroll vertical timeline to keep playhead centered
  useEffect(() => {
    if (containerRef.current && !isScrubbing) {
      const viewportHeight = containerRef.current.clientHeight;
      const targetScrollTop = (currentTime * zoomY) - (viewportHeight / 2);
      if (targetScrollTop > 0) {
        containerRef.current.scrollTop = targetScrollTop;
      } else {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [currentTime, zoomY, isScrubbing]);

  // Format time display MM:SS.ms
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Vertical Time Markers (every 2s or 5s)
  const markerStep = zoomY < 30 ? 5 : 2;
  const timeMarkers = [];
  for (let t = 0; t <= effectiveDuration; t += markerStep) {
    timeMarkers.push(t);
  }

  const playheadPositionY = currentTime * zoomY;

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-l border-slate-200/80 text-slate-800 select-none overflow-hidden">
      {/* Top Header / Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200/80 text-xs shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25 transition transform active:scale-95 shrink-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">⏱️ 縦タイムライン</span>
            <div className="font-mono text-slate-900 font-extrabold text-sm tracking-wider">
              {formatTime(currentTime)} <span className="text-slate-400 font-normal text-xs">/ {formatTime(effectiveDuration)}</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="text-[11px] font-semibold">縮尺:</span>
          <button
            onClick={() => setZoomY(prev => Math.max(20, prev - 5))}
            className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold flex items-center justify-center text-slate-700 shadow-xs"
          >
            -
          </button>
          <span className="font-mono text-xs w-8 text-center font-bold text-slate-800">{zoomY}</span>
          <button
            onClick={() => setZoomY(prev => Math.min(100, prev + 5))}
            className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold flex items-center justify-center text-slate-700 shadow-xs"
          >
            +
          </button>
        </div>
      </div>

      {/* Main Vertical Track Area (White background with Red seekbar) */}
      <div 
        ref={containerRef}
        onMouseDown={handleTimelineMouseDown}
        className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar bg-slate-50 cursor-pointer"
      >
        <div style={{ height: `${timelineHeight + 100}px` }} className="w-full relative min-w-[280px]">
          {/* Vertical Time Ruler (Left Axis) */}
          <div className="absolute top-0 bottom-0 left-0 w-16 bg-slate-100/90 border-r border-slate-200 text-[10px] font-mono text-slate-500 z-10">
            {timeMarkers.map(t => (
              <div 
                key={t}
                style={{ top: `${t * zoomY + 24}px` }}
                className="absolute left-0 right-0 border-t border-slate-200/90 px-2 pt-0.5"
              >
                {formatTime(t)}
              </div>
            ))}
          </div>

          {/* Vertical Grid Lines */}
          <div className="absolute inset-0 left-16 pointer-events-none">
            {timeMarkers.map(t => (
              <div 
                key={`vgrid-${t}`}
                style={{ top: `${t * zoomY + 24}px` }}
                className="absolute left-0 right-0 border-t border-slate-200/60"
              />
            ))}
          </div>

          {/* Horizontal Playhead Line (Vivid RED Seekbar Line) */}
          <div 
            style={{ top: `${playheadPositionY + 24}px` }}
            className="absolute left-0 right-0 h-0.5 bg-red-600 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          >
            <div className="w-3.5 h-3.5 bg-red-600 rotate-45 -mt-1.5 ml-[52px] shadow-md shadow-red-500/50 border border-red-700" />
          </div>

          {/* Lyric Clips (Arranged Vertically on the Track) */}
          <div className="absolute top-6 left-18 right-3 bottom-0">
            {lyrics.map(clip => {
              const top = clip.start_s * zoomY;
              const clipHeight = Math.max(48, (clip.end_s - clip.start_s) * zoomY);
              const isSelected = clip.id === selectedClipId;
              const isSplit = clip.isSplit;

              // If split, render thin parallel vertical bars side-by-side (細い棒の横並び)
              if (isSplit) {
                const chars = clip.text.split('');
                const charTimings = clip.charTimings || chars.map((ch, idx) => ({
                  char: ch,
                  start_s: clip.start_s + (clip.staircaseTiming ? idx * 0.15 : 0),
                  end_s: clip.end_s
                }));

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onToggleSplit(clip.id);
                    }}
                    style={{
                      top: `${top}px`,
                      height: `${clipHeight}px`,
                    }}
                    className={`absolute left-0 right-0 rounded-2xl p-2 cursor-pointer transition-all border shadow-xs ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500 z-20'
                        : 'border-purple-300 bg-purple-50/40 hover:border-purple-400 z-10'
                    }`}
                  >
                    {/* Header indicator */}
                    <div className="flex items-center justify-between text-[10px] text-purple-700 font-bold mb-1 px-1">
                      <span className="truncate">{clip.text} （文字バラけ）</span>
                      <span className="font-mono text-[9px] text-purple-500">
                        {clip.staircaseTiming ? '階段状' : '同時'}
                      </span>
                    </div>

                    {/* Thin Parallel Character Bar Columns (細い棒の横並び) */}
                    <div className="flex-1 flex flex-row items-stretch gap-1 w-full relative">
                      {charTimings.map((ct, i) => {
                        const barTop = (ct.start_s - clip.start_s) * zoomY;
                        const barHeight = Math.max(28, (ct.end_s - ct.start_s) * zoomY);

                        return (
                          <div
                            key={`${clip.id}-bar-${i}`}
                            style={{
                              marginTop: `${barTop}px`,
                              height: `${barHeight}px`,
                            }}
                            className="flex-1 rounded-lg bg-gradient-to-b from-purple-200 via-indigo-100 to-purple-200 border border-purple-400/80 flex flex-col items-center justify-start py-1 shadow-xs hover:border-purple-600 transition"
                          >
                            <span className="text-xs font-black text-purple-900 leading-none">
                              {ct.char}
                            </span>
                            <span className="text-[8px] font-mono text-purple-600 mt-1 scale-90">
                              {ct.start_s.toFixed(1)}s
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Standard full line clip block
              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onToggleSplit(clip.id);
                  }}
                  style={{
                    top: `${top}px`,
                    height: `${clipHeight}px`,
                  }}
                  className={`absolute left-0 right-0 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all border shadow-xs ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-500 z-20 font-bold'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-slate-50/50 z-0'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-sm font-bold truncate tracking-wide">
                      {clip.text}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>{clip.start_s.toFixed(2)}s ~ {clip.end_s.toFixed(2)}s</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSplit(clip.id);
                      }}
                      className="text-[10px] text-purple-600 font-bold hover:underline"
                    >
                      一文字分解
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
