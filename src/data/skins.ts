import { Skin } from '../types/game';

export const SKINS: Skin[] = [
  {
    id: 'neon_viper',
    name: 'Neon Viper',
    description: 'The iconic cyber-serpent. High-voltage cyan body with hot magenta accents.',
    price: 0,
    headColor: '#06b6d4', // Cyan
    bodyColor: '#0891b2',
    eyeColor: '#f43f5e', // Hot pink
    accentColor: '#ec4899',
    trailColor: '#06b6d4',
    unlocked: true,
    badge: 'DEFAULT'
  },
  {
    id: 'retro_8bit',
    name: 'Retro 8-Bit',
    description: 'Relive the 1997 monochrome dot-matrix display. Pure nostalgic phosphor green.',
    price: 150,
    headColor: '#84cc16', // Lime green
    bodyColor: '#4d7c0f',
    eyeColor: '#14532d',
    accentColor: '#a3e635',
    trailColor: '#84cc16',
    unlocked: false,
    badge: 'CLASSIC'
  },
  {
    id: 'cyber_glitch',
    name: 'Cyber Glitch',
    description: 'Corrupted neural network stream with shifting holographic violet and data tear echoes.',
    price: 300,
    headColor: '#a855f7', // Purple
    bodyColor: '#7e22ce',
    eyeColor: '#38bdf8',
    accentColor: '#c084fc',
    trailColor: '#a855f7',
    unlocked: false,
    badge: 'HOLO'
  },
  {
    id: 'rainbow_prism',
    name: 'Rainbow Prism',
    description: 'Refracts pure synthwave sunlight through crystalline scales with chromatic shifting.',
    price: 500,
    headColor: '#f43f5e',
    bodyColor: '#3b82f6',
    eyeColor: '#eab308',
    accentColor: '#10b981',
    trailColor: '#ec4899',
    unlocked: false,
    badge: 'CHROMA'
  },
  {
    id: 'golden_champion',
    name: 'Gold Champion',
    description: 'Forged from high-roller arcade tokens. Emits glowing golden sparks upon turning.',
    price: 800,
    headColor: '#eab308', // Gold
    bodyColor: '#ca8a04',
    eyeColor: '#f8fafc',
    accentColor: '#fef08a',
    trailColor: '#facc15',
    unlocked: false,
    badge: 'LEGEND'
  },
  {
    id: 'mecha_drake',
    name: 'Mecha Drake',
    description: 'Heavy industrial titanium plating with hazardous reactor orange cooling vents.',
    price: 450,
    headColor: '#f97316', // Orange
    bodyColor: '#334155',
    eyeColor: '#38bdf8',
    accentColor: '#fb923c',
    trailColor: '#f97316',
    unlocked: false,
    badge: 'ARMOR'
  },
  {
    id: 'bubblegum_pop',
    name: 'Bubblegum Pop',
    description: 'Pastel dreamscape aesthetic. Sweet marshmallow pink with refreshing spearmint bands.',
    price: 250,
    headColor: '#f472b6', // Pastel Pink
    bodyColor: '#2dd4bf', // Teal mint
    eyeColor: '#ffffff',
    accentColor: '#fbcfe8',
    trailColor: '#f472b6',
    unlocked: false,
    badge: 'VAPOR'
  },
  {
    id: 'terminal_ascii',
    name: 'Terminal 1982',
    description: 'Monochromatic green CRT phosphor code matrix. Raw cyber-terminal elegance.',
    price: 350,
    headColor: '#22c55e', // Emerald terminal
    bodyColor: '#15803d',
    eyeColor: '#bbf7d0',
    accentColor: '#4ade80',
    trailColor: '#22c55e',
    unlocked: false,
    badge: 'ASCII'
  }
];

export function getSkinById(id: string): Skin {
  return SKINS.find(s => s.id === id) || SKINS[0];
}
