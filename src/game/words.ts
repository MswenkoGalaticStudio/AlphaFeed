import { CharSetType } from '../types/game';

export const LATIN_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const GREEK_CHARSET = [
  'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 
  'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 
  'Φ', 'Χ', 'Ψ', 'Ω'
];

export const RUNIC_CHARSET = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ',
  'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ',
  'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'
];

export const NEON_CHARSET = [
  '★', '✦', '⚡', '❖', '⬡', '◈', '⬢', '❂', '✺', '✪',
  '✜', '▲', '▼', '◀', '▶', '◉', '■', '◆', '▲', '✸'
];

export const WORD_LISTS: Record<CharSetType, string[]> = {
  latin: [
    // 3 letters
    'NEO', 'BIT', 'RUN', 'RAY', 'ION', 'WEB', 'VOX', 'ARC', 'GEM', 'POW', 'HEX', 'VIP', 'CPU', 'RAM', 'SYN', 'ZAP',
    // 4 letters
    'NEON', 'WAVE', 'BYTE', 'GLOW', 'WARP', 'BEAM', 'ECHO', 'DISK', 'DUSK', 'GRID', 'RAVE', 'CHIP', 'FLUX', 'NOVA', 'CORE', 'MECH', 'PULS', 'DART', 'ZOOM', 'DATA', 'CODE',
    // 5 letters
    'ALPHA', 'CYBER', 'RETRO', 'SYNTH', 'TURBO', 'PIXEL', 'SNAKE', 'SHIFT', 'LASER', 'SONIC', 'VAPOR', 'GHOST', 'RADAR', 'TITAN', 'DRIVE', 'ORBIT', 'SOLAR', 'PRISM', 'SPEED', 'FLASH', 'SPACE',
    // 6-8 letters
    'ARCADE', 'VECTOR', 'SIGNAL', 'CHROME', 'RUNNER', 'FUTURE', 'COSMIC', 'VORTEX', 'HACKER', 'MATRIX', 'GLITCH', 'SYNTHWAVE', 'CYBERPUNK', 'ALPHAFEED', 'SUPERNOVA'
  ],
  greek: [
    'ΑΛΦΑ', 'ΒΗΤΑ', 'ΓΑΜΑ', 'ΔΕΛΤΑ', 'ΖΗΤΑ', 'ΗΘΟΣ', 'ΘΕΟΣ', 'ΙΩΤΑ', 'ΚΑΠΑ', 'ΛΟΓΟΣ', 'ΜΥΘΟΣ', 'ΝΙΚΗ', 'ΞΕΝΟΣ', 'ΟΜΙΚΡΟΝ', 'ΠΥΡ', 'ΡΥΘΜΟΣ', 'ΣΙΓΜΑ', 'ΤΑΥ', 'ΥΠΝΟΣ', 'ΦΩΣ', 'ΧΑΟΣ', 'ΨΥΧΗ', 'ΩΜΕΓΑ'
  ],
  runic: [
    'ᚠᚢᚦ', 'ᚨᚱᚲ', 'ᚷᚹᚺ', 'ᚾᛁᛃ', 'ᛈᛇᛉ', 'ᛊᛏᛒ', 'ᛖᛗᛚ', 'ᛜᛞᛟ', 'ᚠᚨᛊᛏ', 'ᛚᚢᛗ', 'ᚱᚢᚾᛖ'
  ],
  neon: [
    '★✦⚡', '❖⬡◈', '⬢❂✺', '✪✜▲', '◀▶◉', '■◆▲', '✦⚡❖', '⬡◈⬢', '★⚡✪'
  ]
};

export function getCharSetLetters(charSet: CharSetType): string[] {
  switch (charSet) {
    case 'greek':
      return GREEK_CHARSET;
    case 'runic':
      return RUNIC_CHARSET;
    case 'neon':
      return NEON_CHARSET;
    case 'latin':
    default:
      return LATIN_CHARSET;
  }
}

export function getRandomWord(charSet: CharSetType, targetDifficulty?: string): string {
  const words = WORD_LISTS[charSet] || WORD_LISTS.latin;
  
  if (targetDifficulty === 'casual') {
    // Shorter words for casual
    const shortWords = words.filter(w => w.length <= 5);
    return shortWords[Math.floor(Math.random() * shortWords.length)] || words[0];
  } else if (targetDifficulty === 'hardcore') {
    // Longer words for hardcore
    const longWords = words.filter(w => w.length >= 5);
    return longWords[Math.floor(Math.random() * longWords.length)] || words[0];
  }

  return words[Math.floor(Math.random() * words.length)];
}

export function isTargetLetter(char: string, targetWord: string, currentProgress: number): boolean {
  if (!targetWord || currentProgress >= targetWord.length) return false;
  return targetWord[currentProgress].toUpperCase() === char.toUpperCase();
}
