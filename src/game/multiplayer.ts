import { Snake, Vector2D } from '../types/game';
import { SKINS } from '../data/skins';
import { getRandomWord } from './words';

export interface MultiplayerEvent {
  id: string;
  text: string;
  time: number;
}

export interface MultiplayerRoom {
  code: string;
  isCustom: boolean;
  maxPlayers: number;
  events: MultiplayerEvent[];
}

export const BOT_NAMES = [
  'NeonGhost', 'ByteBite', 'VoxelViper', 'PixelPython', 'ZeroCool_99',
  'CyberHydra', 'GlitchWorm', 'SynthCobra', 'MatrixStalker', 'RetroBasilisk'
];

export function createMultiplayerBots(count: number = 3, arenaSize: number = 2400): Snake[] {
  const bots: Snake[] = [];
  const skinsPool = SKINS.filter(s => s.id !== 'golden_champion');

  for (let i = 0; i < count; i++) {
    const name = BOT_NAMES[i % BOT_NAMES.length];
    const skin = skinsPool[i % skinsPool.length];
    
    // Spawn at random locations away from center
    const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
    const distance = 400 + Math.random() * 400;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const dirAngle = Math.random() * Math.PI * 2;
    const dir: Vector2D = {
      x: Math.cos(dirAngle),
      y: Math.sin(dirAngle)
    };

    // Pre-populate initial segments
    const segments = [];
    const initialLen = 8 + Math.floor(Math.random() * 8);
    for (let s = 0; s < initialLen; s++) {
      segments.push({
        x: x - dir.x * s * 16,
        y: y - dir.y * s * 16,
        char: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[s % 26]
      });
    }

    const targetWord = getRandomWord('latin');

    bots.push({
      id: `bot-${i}-${Date.now()}`,
      name,
      isBot: true,
      skinId: skin.id,
      head: { x, y },
      direction: dir,
      targetDirection: dir,
      segments,
      speed: 170,
      baseSpeed: 170,
      length: initialLen,
      score: 400 + Math.floor(Math.random() * 800),
      targetWord,
      targetWordProgress: 0,
      wordsCompleted: 1 + Math.floor(Math.random() * 3),
      alive: true,
      color: skin.headColor,
      boostActive: false,
      activePowerUps: {}
    });
  }

  return bots;
}

export function generateRoomCode(): string {
  const words = ['NEON', 'GRID', 'WARP', 'BYTE', 'WAVE', 'NOVA', 'CYBER'];
  const num = Math.floor(10 + Math.random() * 90);
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}-${num}`;
}
