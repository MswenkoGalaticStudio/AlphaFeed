import React from 'react';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { PlayerProfile } from '../types/game';
import { 
  Trophy, 
  X, 
  Check, 
  Zap, 
  Type, 
  BookOpen, 
  Flame, 
  Ghost, 
  Maximize2, 
  Sparkles, 
  ShieldAlert, 
  CalendarCheck, 
  Palette, 
  TrendingUp 
} from 'lucide-react';
import { audio } from '../audio/synthwave';

interface AchievementsModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Type: <Type className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Ghost: <Ghost className="w-5 h-5" />,
  Maximize2: <Maximize2 className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  CalendarCheck: <CalendarCheck className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ profile, onClose }) => {
  const userAchievements = profile.achievements || {};

  const totalUnlocked = INITIAL_ACHIEVEMENTS.filter(
    (a) => userAchievements[a.id]?.unlocked
  ).length;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="font-pixel text-xl sm:text-2xl text-cyan-400 text-glow-cyan tracking-wider">
                ACHIEVEMENTS
              </h2>
              <div className="text-[11px] font-cyber text-slate-400">
                Unlocked {totalUnlocked} of {INITIAL_ACHIEVEMENTS.length} Milestones
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievements List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const userAch = userAchievements[ach.id];
            const isUnlocked = !!userAch?.unlocked;
            const progress = isUnlocked ? ach.maxProgress : (userAch?.progress || 0);
            const pct = Math.min(100, Math.round((progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-cyan-500/40 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className={`p-3 rounded-lg border flex-shrink-0 ${
                    isUnlocked
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {ICON_MAP[ach.iconName] || <Trophy className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`font-pixel text-xs sm:text-sm truncate ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                      {ach.title}
                    </h3>
                    <span className="font-pixel text-[10px] text-amber-400 flex-shrink-0">
                      +{ach.rewardGems} GEMS
                    </span>
                  </div>

                  <p className="font-cyber text-xs text-slate-400 leading-normal mb-2">
                    {ach.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isUnlocked ? 'bg-cyan-400' : 'bg-slate-700'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isUnlocked ? (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-400 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <span className="font-cyber text-[11px] text-slate-500">
                      {progress}/{ach.maxProgress}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
