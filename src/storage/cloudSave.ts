import { DifficultyLevel, PlayerProfile } from '../types/game';

const STORAGE_KEY = 'alphafeed_player_profile_v1';

export function generateCloudId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const suffixes = ['NEON', 'VIPER', 'CYBER', 'GLITCH', 'PULSE', 'RADAR', 'RETRO'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `AF-${code}-${suffix}`;
}

export const DEFAULT_PROFILE: PlayerProfile = {
  cloudId: generateCloudId(),
  username: 'RetroRunner',
  gems: 350, // Starter gems to explore skins
  highScore: 1250,
  longestSnake: 24,
  totalWordsSpelled: 14,
  totalLettersEaten: 95,
  gamesPlayed: 3,
  dailyStreak: 1,
  lastDailyDate: '',
  equippedSkin: 'neon_viper',
  unlockedSkins: ['neon_viper'],
  achievements: {
    first_bite: { unlocked: true, progress: 1, unlockedAt: new Date().toISOString() },
    spelling_bee: { unlocked: true, progress: 1, unlockedAt: new Date().toISOString() }
  },
  soundtrackTrack: 0,
  bgmVolume: 0.35,
  sfxVolume: 0.65,
  crtEffect: true,
  touchControls: false,
  difficulty: 'standard',
  lastSyncTime: Date.now()
};

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return { ...DEFAULT_PROFILE };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      achievements: { ...DEFAULT_PROFILE.achievements, ...(parsed.achievements || {}) },
      unlockedSkins: Array.from(new Set([...(parsed.unlockedSkins || ['neon_viper'])]))
    };
  } catch (e) {
    console.error('Failed to load local profile:', e);
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    profile.lastSyncTime = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

/**
 * Export save data as JSON file for cross-device migration
 */
export function exportSaveData(profile: PlayerProfile): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(profile, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `alphafeed_save_${profile.cloudId}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import save data from JSON string
 */
export function importSaveData(jsonText: string): PlayerProfile | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed.cloudId || typeof parsed.gems !== 'number') {
      throw new Error('Invalid save file schema');
    }
    const cleanProfile: PlayerProfile = {
      ...DEFAULT_PROFILE,
      ...parsed,
      lastSyncTime: Date.now()
    };
    saveProfile(cleanProfile);
    return cleanProfile;
  } catch (err) {
    console.error('Failed to import save data:', err);
    return null;
  }
}

/**
 * Simulates real-time cloud synchronization
 */
export async function syncCloudSave(profile: PlayerProfile): Promise<{ success: boolean; message: string }> {
  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, message: 'Offline: Progress saved locally. Will sync when back online.' };
  }

  // Simulate remote cloud server latency
  await new Promise(resolve => setTimeout(resolve, 400));
  saveProfile(profile);

  return { success: true, message: `Synced with Cloud ID ${profile.cloudId}` };
}
