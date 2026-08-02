import { useState, useRef, useEffect, useCallback } from 'react';
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
    aspectRatio: '16:9', // Default to 16:9 as requested!
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

  // Web Audio Analyser and Audio Context setup
  const setupAudioContext = () => {
    if (!audioRef.current) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;

        try {
          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);
        } catch (mediaErr) {
          console.warn('Media element source setup fallback:', mediaErr);
        }

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn('AudioContext setup skipped:', e);
    }
  };

  const getAudioEnergy = useCallback(() => {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    return avg / 255;
  }, []);

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
    setupAudioContext();

    if (!audioRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.warn('Audio play error:', e);
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
    <div className="flex flex-col h-[100dvh] w-screen bg-[#f2f4f8] text-slate-900 overflow-hidden font-sans">
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
        onLoadSample={handleLoadSample}
        onStartExport={handleStartExport}
        isExporting={isExporting}
        songTitle={songTitle}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Area: Preview Monitor Stage */}
        <div className="h-[340px] sm:h-[370px] shrink-0 flex flex-col items-center justify-center p-3 border-b border-slate-200/80 relative bg-slate-900/5">
          {/* Aspect Ratio Toggle Bar */}
          <div className="flex items-center gap-2 mb-2 bg-white/80 backdrop-blur-md border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
            <span className="text-slate-500">表示モード:</span>
            <button
              onClick={() => setSettings(s => ({ ...s, aspectRatio: '16:9' }))}
              className={`px-3 py-0.5 rounded-lg transition ${
                settings.aspectRatio === '16:9' 
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              💻 16:9 標準
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, aspectRatio: '9:16' }))}
              className={`px-3 py-0.5 rounded-lg transition ${
                settings.aspectRatio === '9:16' 
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📱 9:16 縦動画
            </button>
          </div>

          {/* Fixed 16:9 Monitor Stage Frame */}
          <div className="w-full max-w-[620px] aspect-[16/9] max-h-[300px] sm:max-h-[320px] rounded-2xl border border-slate-800 bg-[#03050a] shadow-2xl relative flex items-center justify-center p-2 overflow-hidden">
            {/* Canvas Rendering Box (Fits 16:9 or 9:16 inside container) */}
            <div className={`relative transition-all h-full ${
              settings.aspectRatio === '9:16'
                ? 'aspect-[9/16] mx-auto rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl'
                : 'w-full rounded-xl overflow-hidden'
            }`}>
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
          </div>
        </div>

        {/* Bottom Workspace Split (Left: Inspector & Menu, Right: Vertical Timeline) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Bottom-Left: Inspector & Menu */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-200/80">
            <CharInspector
              selectedClip={selectedClip}
              onUpdateClip={handleUpdateClip}
              onToggleSplit={handleToggleSplit}
              settings={settings}
              onUpdateSettings={(newS) => setSettings(s => ({ ...s, ...newS }))}
            />
          </div>

          {/* Bottom-Right: Vertical Timeline */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex-1 overflow-hidden">
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
        </div>
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
