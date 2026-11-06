import React from 'react';
import { generateDailyChallenge } from '../game/dailyChallenge';
import { Flame, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface DailyChallengeModalProps {
  streak: number;
  isCompletedToday: boolean;
  onStartChallenge: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  streak,
  isCompletedToday,
  onStartChallenge,
  onClose
}) => {
  const challenge = generateDailyChallenge();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
            <div>
              <h2 className="font-pixel text-xl sm:text-2xl text-amber-400 text-glow-amber tracking-wider">
                DAILY CHALLENGE
              </h2>
              <div className="text-[11px] font-cyber text-slate-400">Date: {challenge.date}</div>
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

        {/* Streak Counter Strip */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 rounded-xl border border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-cyber uppercase tracking-wider text-slate-400">
                ACTIVE STREAK
              </div>
              <div className="font-pixel text-lg text-slate-100">
                {streak} {streak === 1 ? 'DAY' : 'DAYS'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-cyber uppercase tracking-wider text-slate-400">
              REWARD
            </div>
            <div className="font-pixel text-amber-400 text-sm">
              +{challenge.rewardGems} GEMS
            </div>
          </div>
        </div>

        {/* Challenge Mission Brief */}
        <div className="p-5 bg-slate-950/90 rounded-xl border border-amber-500/20 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-amber-500/20 text-amber-300 border border-amber-500/40">
              MODIFIER: {challenge.modifierName}
            </span>
          </div>

          <h3 className="font-pixel text-base text-slate-100 mb-2">{challenge.title}</h3>
          <p className="font-cyber text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
            {challenge.description}
          </p>

          {/* Objectives Checkboxes */}
          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-cyber">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Spell at least {challenge.targetWordsToSpell} target words</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Reach tail length of {challenge.requiredLength} segments</span>
            </div>
          </div>
        </div>

        {/* Start / Action CTA */}
        {isCompletedToday ? (
          <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 font-pixel text-xs">
            TODAY'S MISSION COMPLETE! COME BACK TOMORROW.
          </div>
        ) : (
          <button
            onClick={() => {
              audio.playClick();
              onStartChallenge();
            }}
            className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>COMMENCE DAILY CHALLENGE</span>
          </button>
        )}
      </div>
    </div>
  );
};
