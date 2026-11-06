import { DifficultyLevel, LeaderboardEntry } from '../types/game';

const LEADERBOARD_STORAGE_KEY = 'alphafeed_global_leaderboards_v1';

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', rank: 1, playerName: 'NeonValkyrie', score: 14820, wordsSpelled: 38, length: 112, difficulty: 'chaos', date: '2026-11-04', skinId: 'golden_champion' },
  { id: 'lb-2', rank: 2, playerName: 'ZeroKool_88', score: 12450, wordsSpelled: 31, length: 94, difficulty: 'hardcore', date: '2026-11-05', skinId: 'cyber_glitch' },
  { id: 'lb-3', rank: 3, playerName: 'PixelViper', score: 9840, wordsSpelled: 27, length: 78, difficulty: 'standard', date: '2026-11-03', skinId: 'retro_8bit' },
  { id: 'lb-4', rank: 4, playerName: 'GlitchPhantom', score: 8710, wordsSpelled: 24, length: 72, difficulty: 'hardcore', date: '2026-11-05', skinId: 'cyber_glitch' },
  { id: 'lb-5', rank: 5, playerName: 'SynthRunner', score: 7650, wordsSpelled: 21, length: 65, difficulty: 'standard', date: '2026-11-02', skinId: 'neon_viper' },
  { id: 'lb-6', rank: 6, playerName: 'MechaByte', score: 6420, wordsSpelled: 18, length: 58, difficulty: 'standard', date: '2026-11-01', skinId: 'mecha_drake' },
  { id: 'lb-7', rank: 7, playerName: 'ChromaWave', score: 5310, wordsSpelled: 15, length: 48, difficulty: 'chaos', date: '2026-11-04', skinId: 'rainbow_prism' },
  { id: 'lb-8', rank: 8, playerName: 'CyberNomad', score: 4620, wordsSpelled: 14, length: 42, difficulty: 'standard', date: '2026-11-03', skinId: 'terminal_ascii' },
  { id: 'lb-9', rank: 9, playerName: 'BubbleBiter', score: 3890, wordsSpelled: 12, length: 36, difficulty: 'casual', date: '2026-11-05', skinId: 'bubblegum_pop' },
  { id: 'lb-10', rank: 10, playerName: 'RetroNovice', score: 2840, wordsSpelled: 9, length: 28, difficulty: 'casual', date: '2026-11-05', skinId: 'retro_8bit' }
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return [...INITIAL_LEADERBOARD];
    }
    return JSON.parse(raw);
  } catch (err) {
    return [...INITIAL_LEADERBOARD];
  }
}

export function submitScore(
  playerName: string,
  score: number,
  wordsSpelled: number,
  length: number,
  difficulty: DifficultyLevel,
  skinId: string
): { rank: number; isTop10: boolean } {
  const current = getLeaderboard();
  const dateStr = new Date().toISOString().split('T')[0];

  const newEntry: LeaderboardEntry = {
    id: `self-${Date.now()}`,
    rank: 0,
    playerName,
    score,
    wordsSpelled,
    length,
    difficulty,
    date: dateStr,
    skinId,
    isSelf: true
  };

  const updated = [...current, newEntry];
  // Sort descending by score
  updated.sort((a, b) => b.score - a.score);

  // Recalculate ranks
  updated.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  const rank = updated.findIndex(e => e.id === newEntry.id) + 1;
  const isTop10 = rank <= 10;

  // Keep top 25
  const top25 = updated.slice(0, 25);
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(top25));

  return { rank, isTop10 };
}
