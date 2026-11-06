export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'tutorial';

export type GameMode = 'arcade' | 'daily' | 'multiplayer' | 'tutorial';

export type DifficultyLevel = 'casual' | 'standard' | 'hardcore' | 'chaos';

export type CharSetType = 'latin' | 'greek' | 'runic' | 'neon';

export type PowerUpType = 'speed' | 'magnet' | 'shifter' | 'ghost' | 'slowmo' | 'emp';

export interface Vector2D {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
  char?: string;
  angle?: number;
}

export interface Snake {
  id: string;
  name: string;
  isBot: boolean;
  skinId: string;
  head: Vector2D;
  direction: Vector2D;
  targetDirection: Vector2D;
  segments: SnakeSegment[];
  speed: number;
  baseSpeed: number;
  length: number;
  score: number;
  targetWord: string;
  targetWordProgress: number; // index of next letter needed
  wordsCompleted: number;
  alive: boolean;
  color: string;
  boostActive: boolean;
  activePowerUps: {
    [key in PowerUpType]?: number; // remaining duration in seconds
  };
}

export interface GridLetter {
  id: string;
  x: number;
  y: number;
  char: string;
  charSet: CharSetType;
  isTarget?: boolean;
  spawnTime: number;
  pulseOffset: number;
  isGolden?: boolean;
}

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  duration: number; // effect duration when picked up
  spawnTime: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'monolith' | 'laser' | 'vortex';
  pulseSpeed?: number;
  angle?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  char?: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  headColor: string;
  bodyColor: string;
  eyeColor: string;
  accentColor: string;
  trailColor: string;
  unlocked: boolean;
  badge?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  rewardGems: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  wordsSpelled: number;
  length: number;
  difficulty: DifficultyLevel;
  date: string;
  skinId: string;
  isSelf?: boolean;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  targetWordsToSpell: number;
  requiredLength: number;
  modifier: 'hyper_speed' | 'infinite_magnet' | 'ghost_world' | 'scramble_mayhem';
  modifierName: string;
  rewardGems: number;
  completed: boolean;
  bestScore: number;
}

export interface PlayerProfile {
  cloudId: string;
  username: string;
  gems: number;
  highScore: number;
  longestSnake: number;
  totalWordsSpelled: number;
  totalLettersEaten: number;
  gamesPlayed: number;
  dailyStreak: number;
  lastDailyDate: string;
  equippedSkin: string;
  unlockedSkins: string[];
  achievements: Record<string, { unlocked: boolean; progress: number; unlockedAt?: string }>;
  soundtrackTrack: number; // 0, 1, 2
  bgmVolume: number;
  sfxVolume: number;
  crtEffect: boolean;
  touchControls: boolean;
  difficulty: DifficultyLevel;
  lastSyncTime: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  length: number;
  wordsCompleted: number;
  lettersEaten: number;
  gemsEarned: number;
  timeAlive: number;
  alphabetStreak: number;
  killCount: number;
}
