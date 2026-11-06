import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Vector2D } from '../types/game';

interface MobileControlsProps {
  onDirectionChange: (dir: Vector2D) => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  isBoosting: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionChange,
  onBoostStart,
  onBoostEnd,
  isBoosting
}) => {
  return (
    <div className="fixed bottom-6 inset-x-6 flex items-end justify-between pointer-events-none z-20 select-none">
      {/* 4-Way D-Pad on Left */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-44 h-44 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 backdrop-blur-none">
        <div />
        <button
          type="button"
          aria-label="Move Up"
          onTouchStart={(e) => { e.preventDefault(); onDirectionChange({ x: 0, y: -1 }); }}
          onMouseDown={() => onDirectionChange({ x: 0, y: -1 })}
          className="flex items-center justify-center bg-slate-900 border border-slate-700 active:bg-cyan-500 active:text-slate-950 rounded-xl text-slate-300"
        >
          <ChevronUp className="w-8 h-8" />
        </button>
        <div />

        <button
          type="button"
          aria-label="Move Left"
          onTouchStart={(e) => { e.preventDefault(); onDirectionChange({ x: -1, y: 0 }); }}
          onMouseDown={() => onDirectionChange({ x: -1, y: 0 })}
          className="flex items-center justify-center bg-slate-900 border border-slate-700 active:bg-cyan-500 active:text-slate-950 rounded-xl text-slate-300"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-500/40" />
        </div>
        <button
          type="button"
          aria-label="Move Right"
          onTouchStart={(e) => { e.preventDefault(); onDirectionChange({ x: 1, y: 0 }); }}
          onMouseDown={() => onDirectionChange({ x: 1, y: 0 })}
          className="flex items-center justify-center bg-slate-900 border border-slate-700 active:bg-cyan-500 active:text-slate-950 rounded-xl text-slate-300"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div />
        <button
          type="button"
          aria-label="Move Down"
          onTouchStart={(e) => { e.preventDefault(); onDirectionChange({ x: 0, y: 1 }); }}
          onMouseDown={() => onDirectionChange({ x: 0, y: 1 })}
          className="flex items-center justify-center bg-slate-900 border border-slate-700 active:bg-cyan-500 active:text-slate-950 rounded-xl text-slate-300"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
        <div />
      </div>

      {/* Turbo Boost Button on Right */}
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <button
          type="button"
          aria-label="Turbo Boost"
          onTouchStart={(e) => { e.preventDefault(); onBoostStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onBoostEnd(); }}
          onMouseDown={onBoostStart}
          onMouseUp={onBoostEnd}
          onMouseLeave={onBoostEnd}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
            isBoosting
              ? 'bg-pink-500 text-slate-950 border-white scale-95 shadow-[0_0_20px_rgba(236,72,153,0.8)]'
              : 'bg-slate-900 text-pink-400 border-pink-500/80 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
          }`}
        >
          <Zap className="w-7 h-7" />
          <span className="font-pixel text-[8px] mt-0.5">BOOST</span>
        </button>
      </div>
    </div>
  );
};
