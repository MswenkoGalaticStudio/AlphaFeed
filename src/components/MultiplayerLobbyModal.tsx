import React, { useState } from 'react';
import { generateRoomCode } from '../game/multiplayer';
import { Users, X, Swords, Globe, Lock, ShieldCheck } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface MultiplayerLobbyModalProps {
  onJoinArena: (roomCode: string) => void;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  onJoinArena,
  onClose
}) => {
  const [roomCode, setRoomCode] = useState<string>(generateRoomCode());
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-pink-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(236,72,153,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-pink-400" />
            <div>
              <h2 className="font-pixel text-xl sm:text-2xl text-pink-400 text-glow-magenta tracking-wider">
                BATTLE ARENA
              </h2>
              <div className="text-[11px] font-cyber text-slate-400">
                Cross-Platform Multi-Snake Combat
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

        {/* Lobby Settings */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] font-cyber uppercase tracking-wider text-slate-400 mb-2">
              MATCHMAKING SECTOR
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ROOM-CODE"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 font-pixel text-xs text-pink-400 tracking-wider focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={() => {
                  audio.playClick();
                  setRoomCode(generateRoomCode());
                }}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-cyber text-xs rounded-lg transition-colors"
              >
                Random
              </button>
            </div>
          </div>

          {/* Arena Rules Overview */}
          <div className="grid grid-cols-2 gap-3 text-xs font-cyber">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">Infinite Grid</strong>
                <span className="text-slate-400 text-[11px]">Compete on expansive shared coordinates.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Swords className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">Tail Splatter</strong>
                <span className="text-slate-400 text-[11px]">Defeated snakes burst into edible letters!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enter Arena CTA */}
        <button
          onClick={() => {
            audio.playClick();
            onJoinArena(roomCode);
          }}
          className="w-full py-4 px-6 bg-pink-500 hover:bg-pink-400 text-slate-950 font-pixel text-xs rounded tracking-wider shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Swords className="w-4 h-4" />
          <span>ENTER BATTLE ARENA</span>
        </button>
      </div>
    </div>
  );
};
