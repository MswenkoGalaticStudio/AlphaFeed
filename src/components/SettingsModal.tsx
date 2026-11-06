import React, { useRef, useState } from 'react';
import { PlayerProfile } from '../types/game';
import { audio } from '../audio/synthwave';
import { exportSaveData, importSaveData, syncCloudSave } from '../storage/cloudSave';
import { 
  Settings, 
  X, 
  Volume2, 
  Music, 
  Tv, 
  Smartphone, 
  Cloud, 
  Download, 
  Upload, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface SettingsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onUpdateProfile,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleBgmVolumeChange = (vol: number) => {
    audio.setVolumes(vol, profile.sfxVolume);
    onUpdateProfile((p) => ({ ...p, bgmVolume: vol }));
  };

  const handleSfxVolumeChange = (vol: number) => {
    audio.setVolumes(profile.bgmVolume, vol);
    onUpdateProfile((p) => ({ ...p, sfxVolume: vol }));
  };

  const handleTrackChange = (trackIndex: number) => {
    audio.setTrack(trackIndex);
    onUpdateProfile((p) => ({ ...p, soundtrackTrack: trackIndex }));
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const result = await syncCloudSave(profile);
    setIsSyncing(false);
    setSyncStatus(result.message);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const imported = importSaveData(text);
      if (imported) {
        onUpdateProfile(() => imported);
        setSyncStatus('Save profile imported successfully!');
      } else {
        setSyncStatus('Failed to import: Invalid save file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(15,23,42,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="font-pixel text-xl sm:text-2xl text-slate-100 tracking-wider">
              SETTINGS
            </h2>
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

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Section: Audio & Synthwave */}
          <div className="space-y-4">
            <h3 className="font-pixel text-xs text-cyan-400 flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span>SYNTHWAVE SOUNDTRACK</span>
            </h3>

            {/* Track Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-cyber text-slate-400">ACTIVE TRACK</label>
              <div className="grid grid-cols-3 gap-2">
                {audio.tracks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      audio.playClick();
                      handleTrackChange(t.id);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      profile.soundtrackTrack === t.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-pixel text-[10px] truncate mb-0.5">{t.name}</div>
                    <div className="text-[9px] font-cyber text-slate-500">{t.style}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Volumes */}
            <div className="space-y-3 font-cyber text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Music Volume</span>
                  <span className="font-mono">{Math.round(profile.bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={profile.bgmVolume}
                  onChange={(e) => handleBgmVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>SFX Volume</span>
                  <span className="font-mono">{Math.round(profile.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={profile.sfxVolume}
                  onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Display & Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="font-pixel text-xs text-pink-400 flex items-center gap-2">
              <Tv className="w-4 h-4" />
              <span>DISPLAY &amp; INTERFACE</span>
            </h3>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-cyber text-slate-300">Retro CRT Scanlines Effect</span>
              </div>
              <input
                type="checkbox"
                checked={profile.crtEffect}
                onChange={(e) => {
                  audio.playClick();
                  onUpdateProfile((p) => ({ ...p, crtEffect: e.target.checked }));
                }}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-cyber text-slate-300">Always Show Touch D-Pad</span>
              </div>
              <input
                type="checkbox"
                checked={profile.touchControls}
                onChange={(e) => {
                  audio.playClick();
                  onUpdateProfile((p) => ({ ...p, touchControls: e.target.checked }));
                }}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </div>
          </div>

          {/* Section: Cloud Save & Backup */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="font-pixel text-xs text-amber-400 flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span>PERSISTENT CLOUD SAVE</span>
            </h3>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-cyber space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CLOUD IDENTITY:</span>
                <span className="font-mono text-cyan-400 font-bold">{profile.cloudId}</span>
              </div>

              {syncStatus && (
                <div className="text-[11px] text-cyan-300 p-2 rounded bg-cyan-950/40 border border-cyan-800">
                  {syncStatus}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  disabled={isSyncing}
                  onClick={handleSyncNow}
                  className="flex-1 py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-cyber flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
                </button>

                <button
                  onClick={() => exportSaveData(profile)}
                  className="py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-cyber flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-cyber flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
