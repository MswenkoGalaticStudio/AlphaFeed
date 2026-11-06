import { DailyChallenge } from '../types/game';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateDailyChallenge(dateStr: string = getTodayDateString()): DailyChallenge {
  // Deterministic seed based on date string
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const modifiers: Array<{
    type: DailyChallenge['modifier'];
    name: string;
    desc: string;
  }> = [
    {
      type: 'hyper_speed',
      name: 'Turbo Overdrive',
      desc: 'Base velocity increased by +40%. Adrenaline score bonus +50%!'
    },
    {
      type: 'infinite_magnet',
      name: 'Magnetic Resonance',
      desc: 'Continuous letter pull aura active! Attract nearby letters with ease.'
    },
    {
      type: 'ghost_world',
      name: 'Phase Matrix',
      desc: 'Obstacles emit zero physical resistance, but self-collision is critical!'
    },
    {
      type: 'scramble_mayhem',
      name: 'Glyph Tempest',
      desc: 'Golden letters spawn at triple frequency. High value runes everywhere!'
    }
  ];

  const modIndex = absHash % modifiers.length;
  const mod = modifiers[modIndex];

  const targetWordsCount = 4 + (absHash % 4); // 4 to 7 words
  const requiredLen = 25 + (absHash % 20); // 25 to 44 length

  return {
    date: dateStr,
    title: `Operation: ${mod.name}`,
    description: `Complete today's synthwave objective: Spell ${targetWordsCount} target words and reach tail length of ${requiredLen}. ${mod.desc}`,
    targetWordsToSpell: targetWordsCount,
    requiredLength: requiredLen,
    modifier: mod.type,
    modifierName: mod.name,
    rewardGems: 400,
    completed: false,
    bestScore: 0
  };
}
