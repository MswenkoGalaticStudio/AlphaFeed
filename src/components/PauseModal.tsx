import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExitToTitle,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-none select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        <h2 className="font-pixel text-2xl text-cyan-400 text-glow-cyan tracking-wider mb-2">
          SYSTEM PAUSED
        </h2>
        <p className="font-cyber text-slate-400 text-xs mb-6">
          Simulation frozen. Choose directive to resume or abort.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              audio.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-xs rounded tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME RUN
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel text-xs rounded tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART MISSION
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onToggleMute();
            }}
            className="w-full py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 font-cyber text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>AUDIO: {isMuted ? 'MUTED' : 'ACTIVE'}</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onExitToTitle();
            }}
            className="w-full py-3 px-4 bg-transparent hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 font-pixel text-xs rounded tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            EXIT TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
