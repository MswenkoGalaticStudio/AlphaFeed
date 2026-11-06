import React from 'react';
import { PowerUpType, Snake } from '../types/game';
import { Volume2, VolumeX, Pause, RotateCcw } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface GameHUDProps {
  player: Snake;
  highScore: number;
  streak: number;
  scoreMultiplier: number;
  difficulty: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  highScore,
  streak,
  scoreMultiplier,
  difficulty,
  isMuted,
  onToggleMute,
  onPause,
  onRestart
}) => {
  const targetWord = player.targetWord || '';
  const progress = player.targetWordProgress || 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-6 select-none">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full gap-2 sm:gap-4">
        {/* Top Bar for Mobile: Score on Left, Utilities on Right */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          {/* Score & Length */}
          <div className="flex flex-col gap-0.5 pointer-events-auto bg-slate-950/85 p-2 sm:p-3 rounded-lg border border-slate-800">
            <div className="flex items-baseline gap-2 sm:gap-3">
              <div>
                <div className="text-[9px] font-cyber uppercase tracking-wider text-slate-400">SCORE</div>
                <div className="font-pixel text-base sm:text-2xl text-cyan-400 tabular-nums">
                  {player.score.toLocaleString()}
                </div>
              </div>

              <div className="border-l border-slate-800 pl-2 sm:pl-3">
                <div className="text-[9px] font-cyber uppercase tracking-wider text-slate-500">BEST</div>
                <div className="font-pixel text-xs sm:text-sm text-slate-400 tabular-nums">
                  {Math.max(highScore, player.score).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800/80 text-[10px] sm:text-xs font-cyber">
              <span className="text-slate-400">
                LEN: <strong className="text-pink-400 font-pixel text-[10px] sm:text-[11px]">{player.length}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                WORDS: <strong className="text-emerald-400 font-pixel text-[10px] sm:text-[11px]">{player.wordsCompleted}</strong>
              </span>
              {streak > 1 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-semibold animate-pulse">
                    {streak}x
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Utilities visible on mobile in top-right */}
          <div className="flex sm:hidden items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => {
                audio.playClick();
                onToggleMute();
              }}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="p-2 rounded bg-slate-950/85 border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                audio.playClick();
                onPause();
              }}
              aria-label="Pause game"
              className="p-2 rounded bg-slate-950/85 border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              <Pause className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                audio.playClick();
                onRestart();
              }}
              aria-label="Restart run"
              className="p-2 rounded bg-slate-950/85 border border-slate-800 text-slate-300 hover:text-pink-400"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Cluster: Active Target Word Spell Tracker */}
        <div className="flex flex-col items-center pointer-events-auto bg-slate-950/85 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <div className="text-[8px] sm:text-[9px] font-pixel tracking-wider text-cyan-400/90 mb-1 flex items-center gap-2">
            <span>TARGET WORD</span>
            <span className="text-slate-500">[{difficulty.toUpperCase()}]</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {targetWord.split('').map((char, index) => {
              const isFilled = index < progress;
              const isNext = index === progress;

              return (
                <div
                  key={index}
                  className={`w-6 h-7 sm:w-8 sm:h-9 flex items-center justify-center font-pixel text-[11px] sm:text-sm rounded transition-all ${
                    isFilled
                      ? 'bg-cyan-500 text-slate-950 border border-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : isNext
                      ? 'bg-slate-900 text-cyan-300 border-2 border-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Right Cluster on Desktop: Utility Buttons */}
        <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              audio.playClick();
              onToggleMute();
            }}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-2 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onPause();
            }}
            aria-label="Pause game"
            className="p-2 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            aria-label="Restart run"
            className="p-2 rounded bg-slate-950/80 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-pink-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Active Buffs & Power-ups */}
      <div className="flex items-end justify-between w-full">
        {/* Active Power-up Status Pills */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {Object.entries(player.activePowerUps).map(([type, duration]) => {
            if (!duration || duration <= 0) return null;
            const pType = type as PowerUpType;
            const icons: Record<PowerUpType, string> = {
              speed: '⚡ HYPERDASH',
              magnet: '🧲 MAGNET',
              ghost: '👻 GHOST PHASE',
              shifter: '✦ CHAR SHIFT',
              slowmo: '⏳ SLOW-MO',
              emp: '💣 EMP PULSE'
            };

            return (
              <div
                key={type}
                className="px-3 py-1.5 rounded bg-slate-950/90 border border-cyan-400/80 text-cyan-300 font-pixel text-[10px] flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                <span>{icons[pType] || type}</span>
                <span className="font-mono text-white tabular-nums font-bold">
                  {duration.toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Speed Boost Indicator */}
        {player.boostActive && (
          <div className="px-3 py-1 rounded bg-pink-500/20 border border-pink-500 text-pink-400 font-pixel text-[9px] animate-pulse">
            TURBO BOOSTING
          </div>
        )}
      </div>
    </div>
  );
};
