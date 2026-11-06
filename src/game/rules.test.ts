import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  checkCircleBoxCollision, 
  checkHeadObstacleCollision, 
  checkHeadSelfCollision, 
  processLetterCollection, 
  updatePowerUps,
  DIFFICULTY_CONFIGS 
} from './rules';
import { Obstacle, SnakeSegment } from '../types/game';

test('circle box collision returns true when overlapping', () => {
  // Center at (100, 100), radius 20, box at (110, 100) with w=40, h=40
  const hit = checkCircleBoxCollision(100, 100, 20, 110, 100, 40, 40);
  assert.equal(hit, true);

  // Far away
  const miss = checkCircleBoxCollision(100, 100, 10, 200, 200, 20, 20);
  assert.equal(miss, false);
});

test('checkHeadObstacleCollision detects collisions and respects ghost phase', () => {
  const obstacle: Obstacle = {
    id: 'obs-1',
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    type: 'monolith'
  };

  // Direct hit with ghost false
  const hit = checkHeadObstacleCollision({ x: 50, y: 50 }, 15, obstacle, false);
  assert.equal(hit, true);

  // Direct hit with ghost active (should phase through!)
  const phased = checkHeadObstacleCollision({ x: 50, y: 50 }, 15, obstacle, true);
  assert.equal(phased, false);
});

test('checkHeadSelfCollision respects selfCollisionAllowed and ghosting', () => {
  const head = { x: 100, y: 100 };
  const segments: SnakeSegment[] = [];
  
  // 15 segments trailing back
  for (let i = 0; i < 15; i++) {
    segments.push({ x: 100 - i * 5, y: 100 });
  }
  // Put a segment right on the head at index 12 (looping back)
  segments[12] = { x: 101, y: 100 };

  // Should collide when allowed
  const shouldCollide = checkHeadSelfCollision(head, segments, true, false, 8, 10);
  assert.equal(shouldCollide, true);

  // Should NOT collide when casual mode (selfCollisionAllowed = false)
  const casualSafe = checkHeadSelfCollision(head, segments, false, false, 8, 10);
  assert.equal(casualSafe, false);

  // Should NOT collide when ghost power-up is active
  const ghostSafe = checkHeadSelfCollision(head, segments, true, true, 8, 10);
  assert.equal(ghostSafe, false);
});

test('processLetterCollection handles target letter matches, streak increments, and word completion', () => {
  const targetWord = 'NEO';
  
  // Step 1: Eat 'N' (match)
  const res1 = processLetterCollection('N', targetWord, 0, 1, 1.0, false);
  assert.equal(res1.isTargetLetter, true);
  assert.equal(res1.newProgress, 1);
  assert.equal(res1.wordCompleted, false);
  assert.equal(res1.newStreak, 2);
  assert.ok(res1.pointsEarned > 0);

  // Step 2: Eat 'E' (match)
  const res2 = processLetterCollection('E', targetWord, 1, 2, 1.0, false);
  assert.equal(res2.isTargetLetter, true);
  assert.equal(res2.newProgress, 2);
  assert.equal(res2.wordCompleted, false);
  assert.equal(res2.newStreak, 3);

  // Step 3: Eat 'O' (completion!)
  const res3 = processLetterCollection('O', targetWord, 2, 3, 1.5, true);
  assert.equal(res3.isTargetLetter, true);
  assert.equal(res3.newProgress, 3);
  assert.equal(res3.wordCompleted, true);
  assert.ok(res3.pointsEarned > 500); // Big bonus
  assert.ok(res3.bonusGems >= 5); // Golden + word complete gems

  // Step 4: Non-matching letter
  const resWrong = processLetterCollection('Z', targetWord, 0, 5, 1.0, false);
  assert.equal(resWrong.isTargetLetter, false);
  assert.equal(resWrong.newProgress, 0); // Didn't advance
  assert.equal(resWrong.newStreak, 1); // Streak reset to 1
});

test('updatePowerUps counts down and removes expired buffs', () => {
  const buffs = {
    speed: 5.0,
    ghost: 1.0,
    magnet: 0.5
  };

  const updated = updatePowerUps(buffs, 0.8);
  assert.equal(Math.round((updated.speed || 0) * 10) / 10, 4.2);
  assert.equal(Math.round((updated.ghost || 0) * 10) / 10, 0.2);
  assert.equal(updated.magnet, undefined); // Expired and cleaned up
});

test('difficulty configs provide distinct balanced gameplay knobs', () => {
  assert.ok(DIFFICULTY_CONFIGS.hardcore.baseSpeed > DIFFICULTY_CONFIGS.casual.baseSpeed);
  assert.equal(DIFFICULTY_CONFIGS.casual.selfCollision, false);
  assert.equal(DIFFICULTY_CONFIGS.standard.selfCollision, true);
  assert.ok(DIFFICULTY_CONFIGS.chaos.scoreMultiplier > DIFFICULTY_CONFIGS.standard.scoreMultiplier);
});
