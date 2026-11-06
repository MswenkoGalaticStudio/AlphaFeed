import { 
  DifficultyLevel, 
  GridLetter, 
  Obstacle, 
  PowerUpType, 
  Snake, 
  SnakeSegment, 
  Vector2D 
} from '../types/game';
import { isTargetLetter } from './words';

export interface DifficultyConfig {
  baseSpeed: number;
  boostMultiplier: number;
  selfCollision: boolean;
  obstacleCount: number;
  scoreMultiplier: number;
  letterSpawnInterval: number;
  turnSpeed: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  casual: {
    baseSpeed: 140,
    boostMultiplier: 1.5,
    selfCollision: false,
    obstacleCount: 12,
    scoreMultiplier: 1.0,
    letterSpawnInterval: 1.2,
    turnSpeed: 4.8
  },
  standard: {
    baseSpeed: 180,
    boostMultiplier: 1.65,
    selfCollision: true,
    obstacleCount: 22,
    scoreMultiplier: 1.5,
    letterSpawnInterval: 1.0,
    turnSpeed: 5.2
  },
  hardcore: {
    baseSpeed: 230,
    boostMultiplier: 1.8,
    selfCollision: true,
    obstacleCount: 36,
    scoreMultiplier: 2.5,
    letterSpawnInterval: 0.8,
    turnSpeed: 5.8
  },
  chaos: {
    baseSpeed: 210,
    boostMultiplier: 2.0,
    selfCollision: true,
    obstacleCount: 30,
    scoreMultiplier: 3.0,
    letterSpawnInterval: 0.6,
    turnSpeed: 6.2
  }
};

/**
 * Circle to Box collision check
 */
export function checkCircleBoxCollision(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rx - rw / 2, Math.min(cx, rx + rw / 2));
  const closestY = Math.max(ry - rh / 2, Math.min(cy, ry + rh / 2));

  const distanceX = cx - closestX;
  const distanceY = cy - closestY;

  return distanceX * distanceX + distanceY * distanceY < radius * radius;
}

/**
 * Checks if snake head hits an obstacle
 */
export function checkHeadObstacleCollision(
  head: Vector2D,
  headRadius: number,
  obstacle: Obstacle,
  isGhostActive: boolean = false
): boolean {
  if (isGhostActive) return false;
  return checkCircleBoxCollision(
    head.x,
    head.y,
    headRadius,
    obstacle.x,
    obstacle.y,
    obstacle.width,
    obstacle.height
  );
}

/**
 * Checks if snake head collides with its own body segments
 */
export function checkHeadSelfCollision(
  head: Vector2D,
  segments: SnakeSegment[],
  selfCollisionAllowed: boolean,
  isGhostActive: boolean = false,
  skipSegmentsCount: number = 8,
  hitRadius: number = 10
): boolean {
  if (!selfCollisionAllowed || isGhostActive) return false;
  if (segments.length <= skipSegmentsCount) return false;

  const hitRadiusSq = hitRadius * hitRadius;

  // Skip the first few segments immediately behind the head to prevent false self-eating
  for (let i = skipSegmentsCount; i < segments.length; i++) {
    const seg = segments[i];
    const dx = head.x - seg.x;
    const dy = head.y - seg.y;
    if (dx * dx + dy * dy < hitRadiusSq) {
      return true;
    }
  }

  return false;
}

/**
 * Letter eating processing result
 */
export interface LetterEatResult {
  newProgress: number;
  isTargetLetter: boolean;
  wordCompleted: boolean;
  pointsEarned: number;
  bonusGems: number;
  newStreak: number;
}

/**
 * Process eating a letter: check target match, compute score & bonus
 */
export function processLetterCollection(
  letterChar: string,
  targetWord: string,
  currentProgress: number,
  streak: number,
  difficultyMultiplier: number,
  isGolden: boolean = false
): LetterEatResult {
  const isTarget = isTargetLetter(letterChar, targetWord, currentProgress);

  let newProgress = currentProgress;
  let wordCompleted = false;
  let newStreak = streak;

  let basePoints = isGolden ? 50 : 20;
  let bonusGems = isGolden ? 2 : 0;

  if (isTarget) {
    newProgress = currentProgress + 1;
    newStreak = streak + 1;
    basePoints += 50 * newStreak;

    if (newProgress >= targetWord.length) {
      wordCompleted = true;
      // Bonus for spelling entire word
      basePoints += targetWord.length * 150 * newStreak;
      bonusGems += Math.max(5, targetWord.length * 2);
    }
  } else {
    // Ate a letter that was not the next target
    // Reset word streak, but don't reset target word
    newStreak = 1;
  }

  const finalPoints = Math.round(basePoints * difficultyMultiplier);

  return {
    newProgress,
    isTargetLetter: isTarget,
    wordCompleted,
    pointsEarned: finalPoints,
    bonusGems,
    newStreak
  };
}

/**
 * Update remaining duration of active powerups
 */
export function updatePowerUps(
  activePowerUps: Record<string, number | undefined>,
  dt: number
): Record<string, number | undefined> {
  const updated: Record<string, number | undefined> = {};
  for (const [key, duration] of Object.entries(activePowerUps)) {
    if (duration !== undefined && duration > 0) {
      const remaining = duration - dt;
      if (remaining > 0) {
        updated[key] = remaining;
      }
    }
  }
  return updated;
}

/**
 * Applies a powerup to a snake
 */
export function applyPowerUp(
  snake: Snake,
  type: PowerUpType,
  duration: number = 8
): void {
  snake.activePowerUps[type] = (snake.activePowerUps[type] || 0) + duration;
}

/**
 * Bot AI steering policy
 * Steers towards nearest target letter while avoiding obstacles and nearby snake bodies
 */
export function calculateBotSteering(
  bot: Snake,
  letters: GridLetter[],
  obstacles: Obstacle[],
  otherSnakes: Snake[],
  dt: number
): Vector2D {
  const head = bot.head;
  const currentDir = bot.direction;

  // 1. Find best target letter
  let bestLetter: GridLetter | null = null;
  let minLetterDistSq = Infinity;

  // Prefer target letter first
  const nextTargetChar = bot.targetWord ? bot.targetWord[bot.targetWordProgress] : null;

  for (const l of letters) {
    const dx = l.x - head.x;
    const dy = l.y - head.y;
    const distSq = dx * dx + dy * dy;

    // Prioritize target letter if within 800px range
    if (nextTargetChar && l.char.toUpperCase() === nextTargetChar.toUpperCase() && distSq < 800 * 800) {
      bestLetter = l;
      break;
    }

    if (distSq < minLetterDistSq) {
      minLetterDistSq = distSq;
      bestLetter = l;
    }
  }

  let desiredX = currentDir.x;
  let desiredY = currentDir.y;

  if (bestLetter) {
    const toLetterX = bestLetter.x - head.x;
    const toLetterY = bestLetter.y - head.y;
    const len = Math.hypot(toLetterX, toLetterY) || 1;
    desiredX = toLetterX / len;
    desiredY = toLetterY / len;
  }

  // 2. Obstacle avoidance force
  let avoidX = 0;
  let avoidY = 0;
  const avoidanceRadius = 90;

  for (const obs of obstacles) {
    const dx = head.x - obs.x;
    const dy = head.y - obs.y;
    const dist = Math.hypot(dx, dy);

    if (dist < avoidanceRadius + Math.max(obs.width, obs.height) / 2) {
      const strength = (avoidanceRadius + 50 - dist) / (avoidanceRadius + 50);
      avoidX += (dx / (dist || 1)) * strength * 2.5;
      avoidY += (dy / (dist || 1)) * strength * 2.5;
    }
  }

  // 3. Snake body collision avoidance
  for (const other of otherSnakes) {
    if (!other.alive) continue;
    // Check first 15 segments of other snakes
    const segsToCheck = other.id === bot.id ? other.segments.slice(6, 20) : other.segments.slice(0, 15);
    for (const seg of segsToCheck) {
      const dx = head.x - seg.x;
      const dy = head.y - seg.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 50) {
        avoidX += (dx / (dist || 1)) * 3;
        avoidY += (dy / (dist || 1)) * 3;
      }
    }
  }

  // Combine desired direction and avoidance
  let finalX = desiredX + avoidX;
  let finalY = desiredY + avoidY;
  const finalLen = Math.hypot(finalX, finalY) || 1;
  finalX /= finalLen;
  finalY /= finalLen;

  // Smooth turn towards target
  const turnSpeed = 4.5 * dt;
  const newX = currentDir.x + (finalX - currentDir.x) * turnSpeed;
  const newY = currentDir.y + (finalY - currentDir.y) * turnSpeed;
  const newLen = Math.hypot(newX, newY) || 1;

  return {
    x: newX / newLen,
    y: newY / newLen
  };
}
