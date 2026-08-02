import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasRenderer } from './components/CanvasRenderer';
import type { CanvasRendererRef } from './components/CanvasRenderer';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { CharInspector } from './components/CharInspector';
import { BookmarkletModal } from './components/BookmarkletModal';
import { parseLrc } from './lib/lrcParser';
import type { LyricClip, AppSettings, CustomConfigMap } from './types';
import { VideoExporter } from './lib/VideoExporter';

const SAMPLE_LRC = `[00:01.00]愛してる
[00:04.50]AMUVI PRO リリックモーション
[00:08.50]文字バラけと高品質アニメーション
[00:13.00]誰でも簡単に最高クオリティ
[00:18.00]Sunoの音楽をもっと自由に表現しよう`;

export function App() {
  const [lyrics, setLyrics] = useState<LyricClip[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState<string>('サンプル楽曲');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); // seconds
  const [duration, setDuration] = useState<number>(30); // seconds
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isBookmarkletOpen, setIsBookmarkletOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'timeline' | 'inspector' | 'preview'>('timeline');

  const [settings, setSettings] = useState<AppSettings>({
    motionType: 'stagger-pop',
    fontFamily: "'Dela Gothic One', sans-serif",
    fontSize: 52,
    autoSize: true,
    textColor: '#ffffff',
    glowColor: '#f59e0b',
    glowIntensity: 1.5,
    autoColor: false,
    beatSyncIntensity: 1.2,
    aspectRatio: '9:16', // Default to 9:16 Vertical for mobile-first experience!
    resolution: '1080p',
    fps: 60,
    songTitle: 'AMUVI PRO Demo',
    artistName: 'AMUVI',
    overlayStyle: 'none',
    visualizerType: 'waveform',
    visualizerColor: '#f59e0b',
    visualizerSensitivity: 1.2,
    effectType: 'none',
    kanjiEmphasis: true,
    currentTheme: 'kinetic-stagger'
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<CanvasRendererRef>(null);
  const reqRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Helper to convert parsed LyricLine to LyricClip
  const convertToLyricClips = (rawLrcText: string): LyricClip[] => {
    const lines = parseLrc(rawLrcText);
    return lines.map((line, idx) => {
      const start_s = line.time / 1000;
      const nextLine = lines[idx + 1];
      const end_s = line.endTime 
        ? line.endTime / 1000 
        : nextLine 
        ? nextLine.time / 1000 
        : start_s + 3.5;

      return {
        id: line.id || `clip-${idx}-${start_s}`,
        text: line.text,
        start_s,
        end_s,
        isSplit: idx === 0, // Split the first line ("愛してる") by default for demonstration!
        staggerDelay: 0.08,
        motionType: 'stagger-pop'
      };
    });
  };

  // Load Initial Demo Lyrics
  useEffect(() => {
    const initialClips = convertToLyricClips(SAMPLE_LRC);
    setLyrics(initialClips);
    if (initialClips.length > 0) {
      setSelectedClipId(initialClips[0].id);
      setDuration(Math.max(30, initialClips[initialClips.length - 1].end_s + 5));
    }
  }, []);

  // Parse URL hash/search for Suno bookmarklet import data
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const lrcData = searchParams.get('lrc') || hashParams.get('lrc');
    const audioUrlParam = searchParams.get('audio_url') || hashParams.get('audio_url');

    if (lrcData) {
      try {
        const decoded = decodeURIComponent(lrcData);
        const importedClips = convertToLyricClips(decoded);
        setLyrics(importedClips);
        setSongTitle('Suno Import');
        if (importedClips.length > 0) {
          setSelectedClipId(importedClips[0].id);
          setDuration(Math.max(30, importedClips[importedClips.length - 1].end_s + 5));
        }
      } catch (e) {
        console.error('Failed to parse imported LRC', e);
      }
    }

    if (audioUrlParam) {
      try {
        const decodedAudio = decodeURIComponent(audioUrlParam);
        setAudioUrl(decodedAudio);
      } catch (e) {
        console.error('Failed to parse imported audio URL', e);
      }
    }
  }, []);

  // Setup Web Audio Analyser for audio reactive visualizer
  const setupAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    } catch (e) {
      console.warn('AudioContext setup skipped or blocked:', e);
    }
  };

  const getAudioEnergy = useCallback(() => {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    return avg / 255;
  }, []);

  // Animation Loop
  const updateLoop = useCallback(() => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      setCurrentTime(curr);
      if (canvasRef.current && (canvasRef.current as any).renderFrame) {
        (canvasRef.current as any).renderFrame(curr * 1000);
      }
    }
    if (isPlaying) {
      reqRef.current = requestAnimationFrame(updateLoop);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      reqRef.current = requestAnimationFrame(updateLoop);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, updateLoop]);

  // Audio Play / Pause
  const handleTogglePlay = () => {
    if (!audioRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }
    setupAudioContext();
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.warn('Audio play prevented', e);
        setIsPlaying(true);
      });
    }
  };

  // Seek
  const handleSeek = (timeInSec: number) => {
    setCurrentTime(timeInSec);
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSec;
    }
    if (canvasRef.current && (canvasRef.current as any).renderFrame) {
      (canvasRef.current as any).renderFrame(timeInSec * 1000);
    }
  };

  // Toggle Character Split ("文字バラけ")
  const handleToggleSplit = (clipId: string) => {
    setLyrics(prev => prev.map(c => {
      if (c.id === clipId) {
        return { ...c, isSplit: !c.isSplit };
      }
      return c;
    }));
  };

  // Update specific clip
  const handleUpdateClip = (updatedClip: LyricClip) => {
    setLyrics(prev => prev.map(c => c.id === updatedClip.id ? updatedClip : c));
  };

  // Handle Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Load Sample Data
  const handleLoadSample = () => {
    const clips = convertToLyricClips(SAMPLE_LRC);
    setLyrics(clips);
    setSongTitle('AMUVI PRO Demo');
    if (clips.length > 0) setSelectedClipId(clips[0].id);
  };

  // Start Video Export
  const handleStartExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      let audioBuffer = new ArrayBuffer(0);
      if (audioUrl) {
        try {
          const resp = await fetch(audioUrl);
          audioBuffer = await resp.arrayBuffer();
        } catch (err) {
          console.warn('Could not fetch audio buffer for export:', err);
        }
      }

      const exportDuration = Math.max(10, duration);
      const renderFrame = (timeMs: number) => {
        if (canvasRef.current && (canvasRef.current as any).renderFrame) {
          (canvasRef.current as any).renderFrame(timeMs);
        }
      };

      const exporter = new VideoExporter(
        canvasRef.current,
        renderFrame,
        audioBuffer,
        exportDuration
      );

      const blob = await exporter.export(() => {});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amuvi-pro-lyric-video-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
      alert('動画書き出し中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  // Transform LyricClip to format required by CanvasRenderer
  const rendererLyrics = lyrics.map(c => ({
    id: c.id,
    time: c.start_s * 1000,
    endTime: c.end_s * 1000,
    text: c.text
  }));

  // Build customConfigs for character level overrides if clip is split
  const customConfigs: CustomConfigMap = {};
  lyrics.forEach(clip => {
    if (clip.isSplit) {
      customConfigs[clip.id] = {
        motionType: clip.motionType || 'stagger-pop',
        fontFamily: clip.fontFamily || settings.fontFamily,
        textColor: clip.textColor || settings.textColor,
      };
    }
  });

  const selectedClip = lyrics.find(c => c.id === selectedClipId) || null;

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#070a12] text-slate-100 overflow-hidden font-sans">
      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Bar */}
      <Header
        onOpenBookmarkletModal={() => setIsBookmarkletOpen(true)}
        onAudioUpload={handleAudioUpload}
        onLoadSample={handleLoadSample}
        onStartExport={handleStartExport}
        isExporting={isExporting}
        songTitle={songTitle}
      />

      {/* Main Workspace Area (Responsive for Desktop & Mobile Vertical Viewport) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Canvas Preview Area */}
        <div className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-[#050711] relative transition-all ${
          mobileTab === 'preview' ? 'flex' : 'h-[45vh] lg:h-full'
        }`}>
          {/* Canvas Frame Container */}
          <div 
            className={`relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-black flex items-center justify-center transition-all ${
              settings.aspectRatio === '9:16' 
                ? 'h-[92%] max-h-[480px] lg:max-h-[85vh] aspect-[9/16]' 
                : 'w-[95%] lg:w-[85%] aspect-[16/9] max-h-[70vh]'
            }`}
          >
            <CanvasRenderer
              ref={canvasRef}
              lyrics={rendererLyrics}
              currentTime={currentTime * 1000}
              settings={settings}
              customConfigs={customConfigs}
              getAudioEnergy={getAudioEnergy}
              bgMediaUrl={null}
              bgMediaType="image"
            />
          </div>

          {/* Aspect Ratio & Quick Settings Pill */}
          <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-400 hidden sm:inline">画角:</span>
            <button
              onClick={() => setSettings(s => ({ ...s, aspectRatio: '9:16' }))}
              className={`px-2 py-0.5 rounded font-bold transition ${
                settings.aspectRatio === '9:16' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📱 9:16 縦画面
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, aspectRatio: '16:9' }))}
              className={`px-2 py-0.5 rounded font-bold transition ${
                settings.aspectRatio === '16:9' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💻 16:9 横
            </button>
          </div>
        </div>

        {/* Mobile View Switching Tabs (Shown on small screens) */}
        <div className="lg:hidden flex items-center justify-around bg-slate-950 border-t border-b border-slate-800/80 py-1.5 px-2 text-xs z-20 shrink-0">
          <button
            onClick={() => setMobileTab('timeline')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
              mobileTab === 'timeline' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏱️ タイムライン
          </button>
          <button
            onClick={() => setMobileTab('inspector')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
              mobileTab === 'inspector' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ 文字・エフェクト
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
              mobileTab === 'preview' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔍 全体プレビュー
          </button>
        </div>

        {/* Right Inspector Panel (Responsive: drawer/tab on mobile, side panel on desktop) */}
        <div className={`w-full lg:w-80 shrink-0 ${
          mobileTab === 'inspector' ? 'flex-1 overflow-y-auto' : 'hidden lg:block'
        }`}>
          <CharInspector
            selectedClip={selectedClip}
            onUpdateClip={handleUpdateClip}
            onToggleSplit={handleToggleSplit}
            settings={settings}
            onUpdateSettings={(newS) => setSettings(s => ({ ...s, ...newS }))}
          />
        </div>
      </div>

      {/* Bottom Visual Timeline (Shown on Desktop always, or on Mobile Timeline Tab) */}
      <div className={`h-40 sm:h-44 shrink-0 ${
        mobileTab === 'inspector' ? 'hidden lg:block' : 'block'
      }`}>
        <Timeline
          lyrics={lyrics}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          selectedClipId={selectedClipId}
          onSelectClip={setSelectedClipId}
          onToggleSplit={handleToggleSplit}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
        />
      </div>

      {/* Suno Bookmarklet Modal */}
      <BookmarkletModal
        isOpen={isBookmarkletOpen}
        onClose={() => setIsBookmarkletOpen(false)}
      />
    </div>
  );
}

export default App;
