import React, { useState } from 'react';
import { BookOpen, Check, ArrowRight, X } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface TutorialOverlayProps {
  onComplete: () => void;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '1. STEERING & MOVEMENT',
    desc: 'Use WASD or Arrow Keys (or Swipe/D-pad on mobile) to guide your AlphaFeed cyber-snake across the infinite grid.',
    tip: 'Press Space for Turbo Hyperdash!'
  },
  {
    title: '2. ALPHABET FEEDING',
    desc: 'Devour alphabet letters scattered across the neon grid. Each letter you eat becomes an inscribed segment on your growing tail.',
    tip: 'Watch your tail spell out your feeding history!'
  },
  {
    title: '3. SPELLING TARGET WORDS',
    desc: 'Look at the top center HUD. Eat the flashing next letter in the target word to maintain combos and trigger massive word explosions!',
    tip: 'Completing words grants big gem bonuses.'
  },
  {
    title: '4. DODGING HAZARDS',
    desc: 'Avoid red cyber monoliths and pulsing laser barriers. In Standard & Hardcore modes, your own body is lethal—unless in Ghost mode!',
    tip: 'Use the radar minimap in the top right to spot threats.'
  },
  {
    title: '5. POWER-UPS & CIPHERS',
    desc: 'Collect glowing power-ups: Speed ⚡, Magnet 🧲, Ghost Phasing 👻, and Character Shifter ✦ to switch alphabets to Greek or Cyber Runes!',
    tip: 'Ghost mode lets you slip harmlessly through walls!'
  }
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-pixel text-sm tracking-wider">ACADEMY TUTORIAL</h3>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            aria-label="Exit tutorial"
            className="p-1 text-slate-400 hover:text-slate-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-[10px] font-pixel text-emerald-400/90 mb-1">
            STEP {currentStep + 1} OF {TUTORIAL_STEPS.length}
          </div>
          <h4 className="font-pixel text-base text-slate-100 mb-2">{step.title}</h4>
          <p className="font-cyber text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
            {step.desc}
          </p>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-cyber text-xs">
            <strong>PRO TIP:</strong> {step.tip}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Next / Finish Button */}
        <button
          onClick={() => {
            audio.playClick();
            if (isLast) {
              onComplete();
            } else {
              setCurrentStep((c) => c + 1);
            }
          }}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs rounded tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLast ? (
            <>
              <Check className="w-4 h-4" />
              <span>COMMENCE SIMULATION (+100 GEMS)</span>
            </>
          ) : (
            <>
              <span>NEXT LESSON</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
