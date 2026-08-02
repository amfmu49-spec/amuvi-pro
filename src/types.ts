export type MotionType = 
  | 'stagger-pop' 
  | 'kinetic-bounce' 
  | 'typewriter' 
  | 'slide-up' 
  | 'zoom-in' 
  | 'glitch-flicker' 
  | 'rotate-in' 
  | 'wave-float' 
  | 'cinematic-fade' 
  | 'vocaloid' 
  | 'bounce' 
  | 'cinematic' 
  | 'telop' 
  | 'mix' 
  | 'auto';

export interface CharLayer {
  id: string;
  char: string;
  index: number;
  offsetTime: number; // in seconds relative to start of clip
  duration: number; // in seconds
  xOffset: number; // offset X in px
  yOffset: number; // offset Y in px
  scale: number; // 1.0 default
  rotation: number; // in deg
  color?: string;
  glowColor?: string;
  motionType?: MotionType;
}

export interface LyricClip {
  id: string;
  text: string;
  start_s: number;
  end_s: number;
  isSplit?: boolean; // 文字バラけ有効か
  staggerDelay?: number; // 秒数（例: 0.08sごとに一文字出現）
  chars?: CharLayer[];
  fontFamily?: string;
  textColor?: string;
  fontSize?: number;
  motionType?: MotionType;
  x?: number;
  y?: number;
  align?: 'left' | 'center' | 'right';
}

export type PresetThemeId = 
  | 'cyberpunk' 
  | 'cinematic-gold' 
  | 'kinetic-stagger' 
  | 'lofi-dream' 
  | 'pop-bounce' 
  | 'matrix-glitch' 
  | 'minimal-dark';

export interface PresetTheme {
  id: PresetThemeId;
  name: string;
  description: string;
  fontFamily: string;
  textColor: string;
  accentColor: string;
  glowColor: string;
  bgColor: string;
  visualizerType: 'waveform' | 'particles' | 'bars' | 'circle' | 'none';
  defaultMotion: MotionType;
}

export interface AppSettings {
  motionType: MotionType;
  fontFamily: string;
  fontSize: number;
  autoSize: boolean;
  textColor: string;
  glowColor: string;
  glowIntensity: number;
  autoColor: boolean;
  beatSyncIntensity: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '1080p' | '4k' | '720p';
  fps: 30 | 60;
  songTitle: string;
  artistName: string;
  overlayStyle: 'none' | 'intro' | 'corner' | 'minimal';
  visualizerType: 'none' | 'particles' | 'waveform' | 'bars' | 'circle' | 'grid';
  visualizerColor: string;
  visualizerSensitivity: number;
  effectType: 'none' | 'vhs' | 'rgb-shift' | 'glitch' | 'shake' | 'bloom' | 'flash' | 'cinema' | 'vintage' | 'halftone' | 'negative' | 'rainbow' | 'fireworks' | 'lightning' | 'fire' | 'laser';
  kanjiEmphasis: boolean;
  currentTheme: PresetThemeId;
}

export const FONTS = [
  { name: 'Dela Gothic One (極太インパクト)', value: "'Dela Gothic One', sans-serif" },
  { name: 'Orbitron (サイバー・近未来)', value: "'Orbitron', sans-serif" },
  { name: 'Montserrat (モダンプロ)', value: "'Montserrat', sans-serif" },
  { name: 'Zen Kaku Gothic New (高級角ゴ)', value: "'Zen Kaku Gothic New', sans-serif" },
  { name: 'Shippori Mincho (美麗明朝)', value: "'Shippori Mincho', serif" },
  { name: 'Noto Serif JP (優雅明朝)', value: "'Noto Serif JP', serif" },
  { name: 'M PLUS Rounded 1c (丸ゴシック)', value: "'M PLUS Rounded 1c', sans-serif" },
  { name: 'Mochiy Pop One (アニメ・ポップ)', value: "'Mochiy Pop One', sans-serif" },
  { name: 'Reggae One (ロック・エッジ)', value: "'Reggae One', sans-serif" },
  { name: 'DotGothic16 (ピクセル・レトロ)', value: "'DotGothic16', sans-serif" }
];

export const PRESET_THEMES: Record<PresetThemeId, PresetTheme> = {
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'サイバーパンク風ネオングローとアグレッシブなグリッチ',
    fontFamily: "'Orbitron', sans-serif",
    textColor: '#00f0ff',
    accentColor: '#ff0055',
    glowColor: '#00f0ff',
    bgColor: '#050711',
    visualizerType: 'bars',
    defaultMotion: 'glitch-flicker'
  },
  'cinematic-gold': {
    id: 'cinematic-gold',
    name: 'Cinematic Gold',
    description: '深みのある黒にゴールドが映える映画字幕クオリティ',
    fontFamily: "'Shippori Mincho', serif",
    textColor: '#fbbf24',
    accentColor: '#f59e0b',
    glowColor: '#d97706',
    bgColor: '#090a0f',
    visualizerType: 'particles',
    defaultMotion: 'cinematic-fade'
  },
  'kinetic-stagger': {
    id: 'kinetic-stagger',
    name: 'Kinetic Stagger',
    description: '文字が1文字ずつダイナミックに飛び出れ文字バラけ特化',
    fontFamily: "'Dela Gothic One', sans-serif",
    textColor: '#ffffff',
    accentColor: '#ec4899',
    glowColor: '#f43f5e',
    bgColor: '#0b0f19',
    visualizerType: 'waveform',
    defaultMotion: 'stagger-pop'
  },
  'lofi-dream': {
    id: 'lofi-dream',
    name: 'Lofi Dream',
    description: 'ノスタルジックなパステルと粒子のアコースティック空間',
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    textColor: '#e0e7ff',
    accentColor: '#818cf8',
    glowColor: '#c084fc',
    bgColor: '#0d111e',
    visualizerType: 'particles',
    defaultMotion: 'wave-float'
  },
  'pop-bounce': {
    id: 'pop-bounce',
    name: 'Pop Anime',
    description: 'アニメOPのような弾ける元気なバウンスモーション',
    fontFamily: "'Mochiy Pop One', sans-serif",
    textColor: '#facc15',
    accentColor: '#38bdf8',
    glowColor: '#f472b6',
    bgColor: '#0c0e1a',
    visualizerType: 'bars',
    defaultMotion: 'kinetic-bounce'
  },
  'matrix-glitch': {
    id: 'matrix-glitch',
    name: 'Matrix Cyber',
    description: '漆黒の中にライムグリーンが光るデジタルノイズ空間',
    fontFamily: "'DotGothic16', sans-serif",
    textColor: '#22c55e',
    accentColor: '#10b981',
    glowColor: '#4ade80',
    bgColor: '#030704',
    visualizerType: 'bars',
    defaultMotion: 'typewriter'
  },
  'minimal-dark': {
    id: 'minimal-dark',
    name: 'Minimal Obsidian',
    description: '無駄を削ぎ落とした洗練されたモダンプロスタイル',
    fontFamily: "'Montserrat', sans-serif",
    textColor: '#f8fafc',
    accentColor: '#94a3b8',
    glowColor: '#3b82f6',
    bgColor: '#0a0d14',
    visualizerType: 'waveform',
    defaultMotion: 'slide-up'
  }
};

export interface CharacterConfig {
  fontFamily?: string;
  textColor?: string;
  fontSize?: number;
  motionType?: string;
}

export interface LineConfig {
  fontFamily?: string;
  textColor?: string;
  fontSize?: number;
  motionType?: string;
  chars?: Record<number, CharacterConfig>;
}

export type CustomConfigMap = Record<string, LineConfig>;

