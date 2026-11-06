import { Achievement } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_bite',
    title: 'First Bite',
    description: 'Feed on your very first alphabet letter in the infinite grid.',
    iconName: 'Zap',
    rewardGems: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'spelling_bee',
    title: 'Word Constructor',
    description: 'Complete spelling your first target word.',
    iconName: 'Type',
    rewardGems: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'lexicographer',
    title: 'Lexicographer',
    description: 'Spell 10 target words in a single game run.',
    iconName: 'BookOpen',
    rewardGems: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'speed_demon',
    title: 'Hyperdash Runner',
    description: 'Pick up 5 Speed Boost power-ups.',
    iconName: 'Flame',
    rewardGems: 75,
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'ghost_rider',
    title: 'Quantum Phasing',
    description: 'Pass through obstacles unharmed while in Ghost Mode.',
    iconName: 'Ghost',
    rewardGems: 80,
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'century_snake',
    title: 'Century Serpent',
    description: 'Grow your snake tail to 50 segments long.',
    iconName: 'Maximize2',
    rewardGems: 120,
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'polyglot',
    title: 'Cipher Master',
    description: 'Pick up a Character Shifter and play with Greek or Runic alphabets.',
    iconName: 'Sparkles',
    rewardGems: 70,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'hardcore_survivor',
    title: 'Cyber Veteran',
    description: 'Score over 3,000 points on Hardcore difficulty.',
    iconName: 'ShieldAlert',
    rewardGems: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 3000
  },
  {
    id: 'daily_crusher',
    title: 'Daily Champion',
    description: 'Complete a Daily Challenge objective.',
    iconName: 'CalendarCheck',
    rewardGems: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'fashionista',
    title: 'Neon Stylist',
    description: 'Unlock 3 distinct custom skins for your snake.',
    iconName: 'Palette',
    rewardGems: 120,
    unlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'arena_gladiator',
    title: 'Apex Alpha',
    description: 'Eliminate or out-survive 3 rival bot snakes in Multiplayer Arena.',
    iconName: 'Trophy',
    rewardGems: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'alphabet_streak',
    title: 'Alphabetical Harmony',
    description: 'Reach a target word spelling streak of 5x combo multiplier.',
    iconName: 'TrendingUp',
    rewardGems: 90,
    unlocked: false,
    progress: 0,
    maxProgress: 5
  }
];
