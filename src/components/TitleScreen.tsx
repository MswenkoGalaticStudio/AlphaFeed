import React from 'react';
import { 
  DifficultyLevel, 
  GameMode, 
  PlayerProfile 
} from '../types/game';
import { 
  Trophy, 
  Palette, 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  BookOpen, 
  Flame, 
  Users 
} from 'lucide-react';
import { audio } from '../audio/synthwave';

interface TitleScreenProps {
  profile: PlayerProfile;
  difficulty: DifficultyLevel;
  onSetDifficulty: (d: DifficultyLevel) => void;
  onStartGame: (mode: GameMode) => void;
  onOpenSkins: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenDaily: () => void;
  onOpenMultiplayer: () => void;
  onStartTutorial: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isOnline: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  difficulty,
  onSetDifficulty,
  onStartGame,
  onOpenSkins,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenSettings,
  onOpenDaily,
  onOpenMultiplayer,
  onStartTutorial,
  isMuted,
  onToggleMute,
  isOnline
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center text-slate-100 p-6 z-20 select-none overflow-y-auto">
      {/* Top Status Strip */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 py-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-3 text-xs font-cyber tracking-wider">
          <span className="flex items-center gap-1.5 text-cyan-400">
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-cyan-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span className="font-semibold">{isOnline ? 'CLOUD SYNCED' : 'OFFLINE MODE'}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono">ID: {profile.cloudId}</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-semibold">{profile.gems.toLocaleString()} GEMS</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audio.playClick();
              onToggleMute();
            }}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-2 rounded bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            aria-label="Settings"
            className="p-2 rounded bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="my-auto flex flex-col items-center text-center max-w-2xl px-4 py-8">
        {/* Bespoke Retro Emblem SVG */}
        <div className="relative mb-6">
          <svg className="w-24 h-24 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" fill="none">
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="4" />
            <path d="M30 65 L48 25 L52 25 L70 65 M36 52 L64 52" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" />
            <circle cx="50" cy="50" r="38" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="font-pixel text-4xl sm:text-5xl md:text-6xl tracking-wider text-glow-cyan text-cyan-400 mb-3">
          ALPHA<span className="text-pink-500 text-glow-magenta">FEED</span>
        </h1>
        <p className="font-cyber text-slate-300 text-sm sm:text-base max-w-md mb-8">
          Devour alphabets. Spell high-voltage words. Outmaneuver obstacles in the infinite synthwave grid.
        </p>

        {/* Primary Start CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-8">
          <button
            data-start="true"
            onClick={() => {
              audio.playClick();
              onStartGame('arcade');
            }}
            className="w-full sm:w-64 py-4 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-sm rounded tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            START GAME
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenDaily();
            }}
            className="w-full sm:w-auto py-4 px-6 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/60 hover:border-amber-400 text-amber-400 font-pixel text-xs rounded tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            DAILY CHALLENGE
          </button>
        </div>

        {/* Mode & Navigation Dock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg mb-8">
          <button
            onClick={() => {
              audio.playClick();
              onOpenMultiplayer();
            }}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-pink-500 rounded text-left transition-all"
          >
            <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>MULTIPLAYER</span>
            </div>
            <div className="text-[11px] text-slate-400 font-cyber">Arena Battle</div>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenSkins();
            }}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded text-left transition-all"
          >
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Palette className="w-3.5 h-3.5" />
              <span>SKINS</span>
            </div>
            <div className="text-[11px] text-slate-400 font-cyber">8 Pixel Outfits</div>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenLeaderboard();
            }}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-yellow-400 rounded text-left transition-all"
          >
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>RANKINGS</span>
            </div>
            <div className="text-[11px] text-slate-400 font-cyber">Global Rivals</div>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onStartTutorial();
            }}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 rounded text-left transition-all"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>TUTORIAL</span>
            </div>
            <div className="text-[11px] text-slate-400 font-cyber">Academy</div>
          </button>
        </div>

        {/* Difficulty Selection Strip */}
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-xs font-cyber uppercase tracking-wider text-slate-400">
            DIFFICULTY LEVEL
          </span>
          <div className="inline-flex rounded-lg p-1 bg-slate-900/90 border border-slate-800">
            {(['casual', 'standard', 'hardcore', 'chaos'] as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  audio.playClick();
                  onSetDifficulty(d);
                }}
                className={`px-3 py-1.5 text-xs font-cyber uppercase tracking-wider rounded transition-colors ${
                  difficulty === d 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Hint in Footer */}
      <div className="w-full text-center text-xs text-slate-500 font-cyber py-3 border-t border-slate-800">
        WASD or Arrow Keys to Move · Space for Turbo Dash · Esc or P to Pause · Touch &amp; Swipe Supported
      </div>
    </div>
  );
};
