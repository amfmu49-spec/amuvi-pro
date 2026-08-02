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
  onUpdateClipTime?: (clipId: string, newStart: number, newEnd: number) => void;
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
  const [zoom, setZoom] = useState<number>(30); // pixels per second
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const effectiveDuration = Math.max(duration || 60, 30);
  const timelineWidth = Math.max(1000, effectiveDuration * zoom);

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const targetTime = Math.max(0, Math.min(effectiveDuration, clickX / zoom));
    onSeek(targetTime);
    setIsScrubbing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isScrubbing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const targetTime = Math.max(0, Math.min(effectiveDuration, clickX / zoom));
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
  }, [isScrubbing, zoom, effectiveDuration]);

  // Format time display MM:SS.ms
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Time markers (every 5 seconds or scaled)
  const markerStep = zoom < 20 ? 10 : zoom < 40 ? 5 : 2;
  const timeMarkers = [];
  for (let t = 0; t <= effectiveDuration; t += markerStep) {
    timeMarkers.push(t);
  }

  const playheadPosition = currentTime * zoom;

  return (
    <div className="flex flex-col h-full bg-[#0b0f19]/90 backdrop-blur-xl border-t border-slate-800 text-slate-200 select-none">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>
          <div className="font-mono text-amber-400 font-semibold tracking-wider">
            {formatTime(currentTime)} <span className="text-slate-500">/ {formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Selected Clip Status */}
        <div className="flex items-center gap-2">
          {selectedClipId ? (
            (() => {
              const clip = lyrics.find(c => c.id === selectedClipId);
              if (!clip) return null;
              return (
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg">
                  <span className="text-slate-400">選択中:</span>
                  <span className="font-bold text-amber-300 max-w-[150px] truncate">{clip.text}</span>
                  <button
                    onClick={() => onToggleSplit(clip.id)}
                    className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                      clip.isSplit 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400' 
                        : 'bg-slate-700 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {clip.isSplit ? '✨ 一文字バラけ中' : '🧩 一文字ずつ分解'}
                  </button>
                </div>
              );
            })()
          ) : (
            <span className="text-slate-500 italic">テロップブロックをクリックして選択</span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 text-slate-400">
          <span>ズーム:</span>
          <button
            onClick={() => setZoom(prev => Math.max(10, prev - 5))}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold flex items-center justify-center text-slate-200"
          >
            -
          </button>
          <span className="font-mono text-xs w-8 text-center">{zoom}px</span>
          <button
            onClick={() => setZoom(prev => Math.min(100, prev + 5))}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold flex items-center justify-center text-slate-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Main Track Workspace */}
      <div 
        ref={containerRef}
        onMouseDown={handleTimelineMouseDown}
        className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar cursor-pointer bg-[#070a12]"
      >
        <div style={{ width: `${timelineWidth}px` }} className="h-full relative min-h-[140px]">
          {/* Time Ruler */}
          <div className="h-6 bg-slate-950/80 border-b border-slate-800/80 relative text-[10px] font-mono text-slate-500">
            {timeMarkers.map(t => (
              <div 
                key={t}
                style={{ left: `${t * zoom}px` }}
                className="absolute top-0 bottom-0 border-l border-slate-800 pl-1 pt-0.5"
              >
                {formatTime(t)}
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {timeMarkers.map(t => (
              <div 
                key={`grid-${t}`}
                style={{ left: `${t * zoom}px` }}
                className="absolute top-6 bottom-0 border-l border-slate-900/60"
              />
            ))}
          </div>

          {/* Playhead Indicator Line */}
          <div 
            style={{ left: `${playheadPosition}px` }}
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none shadow-[0_0_10px_#f59e0b]"
          >
            <div className="w-3 h-3 bg-amber-400 rotate-45 -ml-1.2 -mt-1 shadow-md shadow-amber-500/50" />
          </div>

          {/* Track 1: Audio Waveform Background Representation */}
          <div className="absolute top-8 left-0 right-0 h-10 border-b border-slate-800/50 opacity-20 pointer-events-none bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-amber-900/20 flex items-center px-2">
            <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider font-bold">Audio Track</span>
          </div>

          {/* Track 2: Lyrics & Character Split Clips */}
          <div className="absolute top-20 left-0 right-0 bottom-2 px-1">
            {lyrics.map(clip => {
              const left = clip.start_s * zoom;
              const clipWidth = Math.max(30, (clip.end_s - clip.start_s) * zoom);
              const isSelected = clip.id === selectedClipId;
              const isSplit = clip.isSplit;

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
                    left: `${left}px`,
                    width: `${clipWidth}px`,
                  }}
                  className={`absolute h-12 rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50 z-20'
                      : isSplit
                      ? 'border-purple-500/80 shadow-md shadow-purple-900/40 z-10'
                      : 'border-slate-700/80 hover:border-slate-500 z-0'
                  } ${
                    isSplit
                      ? 'bg-gradient-to-r from-purple-950/80 via-purple-900/70 to-pink-950/80 text-purple-200'
                      : 'bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 overflow-hidden">
                    <span className="text-xs font-bold truncate font-sans tracking-wide">
                      {clip.text}
                    </span>
                    {isSplit && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-white font-extrabold shadow-sm shrink-0">
                        文字バラけ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>{clip.start_s.toFixed(2)}s</span>
                    <span>{clip.end_s.toFixed(2)}s</span>
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
