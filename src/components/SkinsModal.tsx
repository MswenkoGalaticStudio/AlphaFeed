import React, { useState } from 'react';
import { SKINS, getSkinById } from '../data/skins';
import { Skin } from '../types/game';
import { X, Check, Lock, Sparkles } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface SkinsModalProps {
  unlockedSkins: string[];
  equippedSkinId: string;
  gems: number;
  onEquipSkin: (skinId: string) => void;
  onBuySkin: (skin: Skin) => void;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  unlockedSkins,
  equippedSkinId,
  gems,
  onEquipSkin,
  onBuySkin,
  onClose
}) => {
  const [selectedSkinId, setSelectedSkinId] = useState<string>(equippedSkinId);
  const selectedSkin = getSkinById(selectedSkinId);
  const isUnlocked = unlockedSkins.includes(selectedSkin.id);
  const isEquipped = equippedSkinId === selectedSkin.id;
  const canAfford = gems >= selectedSkin.price;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-pixel text-xl sm:text-2xl text-cyan-400 text-glow-cyan tracking-wider">
              SKIN WARDROBE
            </h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-pixel text-[10px]">
              {gems.toLocaleString()} GEMS
            </span>
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

        {/* Selected Skin Interactive Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
          {/* Animated 2D Snake Visual Preview Canvas / SVG */}
          <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-slate-900/90 rounded-xl border border-slate-700/80 p-2">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              {/* Segments */}
              <circle cx="28" cy="50" r="11" fill={selectedSkin.bodyColor} stroke={selectedSkin.accentColor} strokeWidth="2" />
              <text x="28" y="54" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="'Press Start 2P'">P</text>

              <circle cx="48" cy="50" r="11" fill={selectedSkin.bodyColor} stroke={selectedSkin.accentColor} strokeWidth="2" />
              <text x="48" y="54" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="'Press Start 2P'">O</text>

              {/* Head */}
              <circle cx="70" cy="50" r="14" fill={selectedSkin.headColor} stroke={selectedSkin.accentColor} strokeWidth="2.5" />
              {/* Eyes */}
              <rect x="74" y="42" width="5" height="4" fill={selectedSkin.eyeColor} />
              <rect x="74" y="54" width="5" height="4" fill={selectedSkin.eyeColor} />
              <rect x="76" y="43" width="2" height="2" fill="#ffffff" />
              <rect x="76" y="55" width="2" height="2" fill="#ffffff" />
            </svg>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="font-pixel text-lg text-slate-100">{selectedSkin.name}</h3>
              {selectedSkin.badge && (
                <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-slate-800 text-cyan-400 border border-cyan-500/30">
                  {selectedSkin.badge}
                </span>
              )}
            </div>
            <p className="font-cyber text-slate-400 text-xs sm:text-sm mb-4">
              {selectedSkin.description}
            </p>

            {/* Action Button for Selected Skin */}
            {isEquipped ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-500/20 text-cyan-400 font-pixel text-xs border border-cyan-500/50">
                <Check className="w-4 h-4" />
                <span>CURRENTLY EQUIPPED</span>
              </div>
            ) : isUnlocked ? (
              <button
                onClick={() => {
                  audio.playClick();
                  onEquipSkin(selectedSkin.id);
                }}
                className="py-2.5 px-6 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-pixel text-xs tracking-wider transition-all cursor-pointer"
              >
                EQUIP SKIN
              </button>
            ) : (
              <button
                disabled={!canAfford}
                onClick={() => {
                  audio.playClick();
                  onBuySkin(selectedSkin);
                }}
                className={`py-2.5 px-6 rounded font-pixel text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNLOCK FOR {selectedSkin.price} GEMS</span>
              </button>
            )}
          </div>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SKINS.map((skin) => {
            const unlocked = unlockedSkins.includes(skin.id);
            const equipped = equippedSkinId === skin.id;
            const isSelected = selectedSkinId === skin.id;

            return (
              <button
                key={skin.id}
                onClick={() => {
                  audio.playClick();
                  setSelectedSkinId(skin.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-800/90 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: skin.headColor }}
                  />
                  {equipped ? (
                    <span className="text-[9px] font-pixel text-cyan-400">ACTIVE</span>
                  ) : !unlocked ? (
                    <Lock className="w-3 h-3 text-slate-500" />
                  ) : null}
                </div>

                <div className="font-pixel text-[11px] text-slate-200 truncate mb-1">
                  {skin.name}
                </div>

                <div className="text-[10px] font-cyber text-slate-400">
                  {unlocked ? 'Unlocked' : `${skin.price} Gems`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
