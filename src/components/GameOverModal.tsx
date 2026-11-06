import React from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { GameStats } from '../types/game';
import { audio } from '../audio/synthwave';

interface GameOverModalProps {
  stats: GameStats;
  rankAchieved?: number;
  onTryAgain: () => void;
  onOpenLeaderboard: () => void;
  onExitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  rankAchieved,
  onTryAgain,
  onOpenLeaderboard,
  onExitToTitle
}) => {
  const isNewRecord = stats.score >= stats.highScore && stats.score > 0;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-none select-none">
      <div className="w-full max-w-md bg-slate-900 border border-pink-500/50 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_35px_rgba(236,72,153,0.25)] animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-block p-3 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-500 mb-3">
          <RotateCcw className="w-7 h-7" />
        </div>

        <h2 className="font-pixel text-2xl sm:text-3xl text-pink-500 text-glow-magenta tracking-wider mb-1">
          SIGNAL TERMINATED
        </h2>
        <p className="font-cyber text-slate-400 text-xs sm:text-sm mb-6">
          Collision recorded in the grid. Run telemetry archived.
        </p>

        {isNewRecord && (
          <div className="mb-6 py-2 px-4 bg-amber-500/10 border border-amber-500/40 rounded-lg text-amber-300 font-pixel text-xs flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>NEW PERSONAL RECORD!</span>
          </div>
        )}

        {/* 3-Column Tabular Numerals Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-cyber text-slate-400 uppercase">FINAL SCORE</div>
            <div className="font-pixel text-base sm:text-lg text-cyan-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-cyber text-slate-400 uppercase">WORDS</div>
            <div className="font-pixel text-base sm:text-lg text-emerald-400 tabular-nums">
              {stats.wordsCompleted}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-cyber text-slate-400 uppercase">MAX LENGTH</div>
            <div className="font-pixel text-base sm:text-lg text-pink-400 tabular-nums">
              {stats.length}
            </div>
          </div>
        </div>

        {/* Reward Gems Banner */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 rounded-lg border border-slate-800 mb-6 text-xs font-cyber">
          <span className="text-slate-400">LETTER GEMS EARNED</span>
          <span className="font-pixel text-amber-400 text-sm">+{stats.gemsEarned} GEMS</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            data-start="true"
            onClick={() => {
              audio.playClick();
              onTryAgain();
            }}
            className="w-full py-4 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-xs rounded tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            TRY AGAIN [ENTER]
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                audio.playClick();
                onOpenLeaderboard();
              }}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel text-[11px] rounded tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              RANKINGS
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onExitToTitle();
              }}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel text-[11px] rounded tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              TITLE MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
