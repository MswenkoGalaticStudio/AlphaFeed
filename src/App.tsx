import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  DifficultyLevel, 
  FloatingText, 
  GameMode, 
  GameState, 
  GameStats, 
  GridLetter, 
  Obstacle, 
  Particle, 
  PowerUpItem, 
  PowerUpType, 
  Snake, 
  SnakeSegment, 
  Vector2D 
} from './types/game';
import { 
  DIFFICULTY_CONFIGS, 
  calculateBotSteering, 
  checkHeadObstacleCollision, 
  checkHeadSelfCollision, 
  processLetterCollection, 
  updatePowerUps 
} from './game/rules';
import { getCharSetLetters, getRandomWord } from './game/words';
import { renderGameScene } from './game/canvasRenderer';
import { audio } from './audio/synthwave';
import { loadProfile, saveProfile, syncCloudSave } from './storage/cloudSave';
import { getSkinById } from './data/skins';
import { createMultiplayerBots } from './game/multiplayer';
import { generateDailyChallenge, getTodayDateString } from './game/dailyChallenge';
import { submitScore } from './game/leaderboards';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';

// UI Components
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { MobileControls } from './components/MobileControls';
import { SkinsModal } from './components/SkinsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>('title');
  const [gameMode, setGameMode] = useState<GameMode>('arcade');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('standard');
  const [profile, setProfile] = useState(() => loadProfile());
  const [isMuted, setIsMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Modals visibility
  const [activeModal, setActiveModal] = useState<
    'skins' | 'leaderboard' | 'daily' | 'achievements' | 'multiplayer' | 'tutorial' | 'settings' | null
  >(null);

  // Responsive mobile view check
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? (window.innerWidth < 768 || 'ontouchstart' in window) : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Run statistics for GameOver modal
  const [endStats, setEndStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    length: 10,
    wordsCompleted: 0,
    lettersEaten: 0,
    gemsEarned: 0,
    timeAlive: 0,
    alphabetStreak: 1,
    killCount: 0
  });
  const [rankAchieved, setRankAchieved] = useState<number | undefined>();

  // Achievement toast notification
  const [achievementToast, setAchievementToast] = useState<string | null>(null);

  // Refs for simulation loop (never reset on React renders)
  const playerRef = useRef<Snake>({
    id: 'player',
    name: 'Player',
    isBot: false,
    skinId: profile.equippedSkin || 'neon_viper',
    head: { x: 0, y: 0 },
    direction: { x: 1, y: 0 },
    targetDirection: { x: 1, y: 0 },
    segments: [],
    speed: 180,
    baseSpeed: 180,
    length: 8,
    score: 0,
    targetWord: 'ALPHA',
    targetWordProgress: 0,
    wordsCompleted: 0,
    alive: true,
    color: '#06b6d4',
    boostActive: false,
    activePowerUps: {}
  });

  const otherSnakesRef = useRef<Snake[]>([]);
  const lettersRef = useRef<GridLetter[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const streakRef = useRef<number>(1);
  const letterSpawnTimerRef = useRef<number>(0);
  const powerUpSpawnTimerRef = useRef<number>(0);
  const timeAliveRef = useRef<number>(0);
  const gemsEarnedRunRef = useRef<number>(0);
  const dailyTargetRef = useRef<{ words: number; length: number; modifier: string } | null>(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncCloudSave(profile);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [profile]);

  // Sync state to body dataset
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Audio setup on load
  useEffect(() => {
    audio.setTrack(profile.soundtrackTrack);
    audio.setVolumes(profile.bgmVolume, profile.sfxVolume, isMuted);
  }, [profile.soundtrackTrack, profile.bgmVolume, profile.sfxVolume, isMuted]);

  // Trigger achievement unlock
  const triggerAchievement = useCallback((achId: string) => {
    const ach = INITIAL_ACHIEVEMENTS.find(a => a.id === achId);
    if (!ach) return;

    setProfile(prev => {
      const currentAch = prev.achievements[achId];
      if (currentAch?.unlocked) return prev;

      audio.playAchievement();
      setAchievementToast(`ACHIEVEMENT UNLOCKED: ${ach.title}`);
      setTimeout(() => setAchievementToast(null), 4000);

      const updated = {
        ...prev,
        gems: prev.gems + ach.rewardGems,
        achievements: {
          ...prev.achievements,
          [achId]: { unlocked: true, progress: ach.maxProgress, unlockedAt: new Date().toISOString() }
        }
      };
      saveProfile(updated);
      return updated;
    });
  }, []);

  // Initialize a new game session
  const initGameSession = useCallback((mode: GameMode = 'arcade', diff: DifficultyLevel = difficulty) => {
    const cfg = DIFFICULTY_CONFIGS[diff];
    const skin = getSkinById(profile.equippedSkin);

    const initialSegments: SnakeSegment[] = [];
    for (let i = 0; i < 8; i++) {
      initialSegments.push({
        x: -i * 16,
        y: 0,
        char: 'ALPHA'[i % 5]
      });
    }

    const startWord = getRandomWord('latin', diff);

    playerRef.current = {
      id: 'player',
      name: profile.username || 'Player',
      isBot: false,
      skinId: skin.id,
      head: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      targetDirection: { x: 1, y: 0 },
      segments: initialSegments,
      speed: cfg.baseSpeed,
      baseSpeed: cfg.baseSpeed,
      length: 8,
      score: 0,
      targetWord: startWord,
      targetWordProgress: 0,
      wordsCompleted: 0,
      alive: true,
      color: skin.headColor,
      boostActive: false,
      activePowerUps: {}
    };

    cameraRef.current = { x: 0, y: 0 };
    streakRef.current = 1;
    timeAliveRef.current = 0;
    gemsEarnedRunRef.current = 0;
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Daily Challenge setup
    if (mode === 'daily') {
      const daily = generateDailyChallenge();
      dailyTargetRef.current = {
        words: daily.targetWordsToSpell,
        length: daily.requiredLength,
        modifier: daily.modifier
      };
      if (daily.modifier === 'hyper_speed') {
        playerRef.current.baseSpeed *= 1.4;
        playerRef.current.speed = playerRef.current.baseSpeed;
      } else if (daily.modifier === 'infinite_magnet') {
        playerRef.current.activePowerUps.magnet = 9999;
      }
    } else {
      dailyTargetRef.current = null;
    }

    // Multiplayer bots
    if (mode === 'multiplayer') {
      otherSnakesRef.current = createMultiplayerBots(4, 2800);
    } else {
      otherSnakesRef.current = [];
    }

    // Procedural Obstacles - ensure safe runway >= 550px from origin and clear forward corridor
    const obstacles: Obstacle[] = [];
    const obsCount = cfg.obstacleCount;
    for (let i = 0; i < obsCount; i++) {
      const angle = (i / obsCount) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 550 + Math.random() * 1400;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;

      // Keep corridor ahead of (0,0) completely clear
      if (Math.hypot(x, y) < 480 || (x > 0 && x < 750 && Math.abs(y) < 120)) {
        continue;
      }

      const type = i % 3 === 0 ? 'laser' : i % 4 === 0 ? 'vortex' : 'monolith';

      obstacles.push({
        id: `obs-${i}`,
        x,
        y,
        width: type === 'laser' ? 140 : 44,
        height: type === 'laser' ? 12 : 44,
        type,
        pulseSpeed: 1 + Math.random()
      });
    }
    obstaclesRef.current = obstacles;

    // Grant 1.5s initial ghost grace period on spawn so player never dies without input
    playerRef.current.activePowerUps.ghost = 1.8;

    // Initial Letters
    const letters: GridLetter[] = [];
    const charPool = getCharSetLetters('latin');
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 1200;
      const char = charPool[Math.floor(Math.random() * charPool.length)];
      letters.push({
        id: `letter-${i}`,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        char,
        charSet: 'latin',
        isTarget: char === startWord[0],
        spawnTime: Date.now(),
        pulseOffset: Math.random() * Math.PI * 2,
        isGolden: Math.random() < 0.12
      });
    }
    lettersRef.current = letters;

    // PowerUps
    powerUpsRef.current = [];

    setGameMode(mode);
    setDifficulty(diff);
    setGameState('playing');
    setActiveModal(null);

    audio.startBGM();
  }, [profile.equippedSkin, profile.username, difficulty]);

  // Handle autostart query param (?autostart=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        initGameSession('arcade');
      }
    }
  }, [initGameSession]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter on Title Screen starts game
      if (gameState === 'title' && !activeModal) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          initGameSession('arcade');
          return;
        }
      }

      // Enter on GameOver triggers Try Again
      if (gameState === 'gameover') {
        if (e.key === 'Enter') {
          e.preventDefault();
          initGameSession(gameMode);
          return;
        }
      }

      // Escape or P toggles Pause
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          setGameState('paused');
          audio.stopBGM();
        } else if (gameState === 'paused') {
          setGameState('playing');
          audio.startBGM();
        }
        return;
      }

      // M toggles Mute
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted(m => !m);
        return;
      }

      // R restarts in Playing or Paused
      if ((e.key === 'r' || e.key === 'R') && (gameState === 'playing' || gameState === 'paused')) {
        initGameSession(gameMode);
        return;
      }

      if (gameState !== 'playing') return;

      const player = playerRef.current;
      const cur = player.direction;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (cur.y !== 1) player.targetDirection = { x: 0, y: -1 };
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (cur.y !== -1) player.targetDirection = { x: 0, y: 1 };
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (cur.x !== 1) player.targetDirection = { x: -1, y: 0 };
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (cur.x !== -1) player.targetDirection = { x: 1, y: 0 };
      } else if (e.key === ' ') {
        // Boost
        player.boostActive = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && playerRef.current) {
        playerRef.current.boostActive = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activeModal, gameMode, initGameSession]);

  // Main 60Hz Game Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      if (gameState === 'playing') {
        const player = playerRef.current;
        const cfg = DIFFICULTY_CONFIGS[difficulty];
        timeAliveRef.current += dt;

        // 1. Player Movement & Smooth Turning
        const turnSpeed = cfg.turnSpeed * dt;
        const targetDir = player.targetDirection;
        const newDirX = player.direction.x + (targetDir.x - player.direction.x) * turnSpeed;
        const newDirY = player.direction.y + (targetDir.y - player.direction.y) * turnSpeed;
        const dirLen = Math.hypot(newDirX, newDirY) || 1;
        player.direction = { x: newDirX / dirLen, y: newDirY / dirLen };

        // Speed calculation
        let currentSpeed = player.baseSpeed;
        if (player.activePowerUps.speed && player.activePowerUps.speed > 0) {
          currentSpeed *= 1.7;
        }
        if (player.boostActive) {
          currentSpeed *= cfg.boostMultiplier;
        }
        player.speed = currentSpeed;

        // Advance head
        player.head.x += player.direction.x * player.speed * dt;
        player.head.y += player.direction.y * player.speed * dt;

        // Camera follow smoothly
        cameraRef.current.x += (player.head.x - cameraRef.current.x) * 0.12;
        cameraRef.current.y += (player.head.y - cameraRef.current.y) * 0.12;

        // Update body segments trailing
        const segmentDist = 16;
        if (player.segments.length > 0) {
          let prevX = player.head.x;
          let prevY = player.head.y;

          for (let i = 0; i < player.segments.length; i++) {
            const seg = player.segments[i];
            const dx = seg.x - prevX;
            const dy = seg.y - prevY;
            const dist = Math.hypot(dx, dy);

            if (dist > segmentDist) {
              const ratio = (dist - segmentDist) / dist;
              seg.x -= dx * ratio;
              seg.y -= dy * ratio;
            }

            prevX = seg.x;
            prevY = seg.y;
          }
        }

        // 2. Power-up timers
        player.activePowerUps = updatePowerUps(player.activePowerUps, dt);

        // 3. Magnet effect: pull nearby letters
        const hasMagnet = player.activePowerUps.magnet && player.activePowerUps.magnet > 0;
        const magnetRange = hasMagnet ? 320 : 0;
        if (hasMagnet) {
          for (const l of lettersRef.current) {
            const dx = player.head.x - l.x;
            const dy = player.head.y - l.y;
            const dist = Math.hypot(dx, dy);
            if (dist < magnetRange && dist > 10) {
              const pullSpeed = 400 * dt;
              l.x += (dx / dist) * pullSpeed;
              l.y += (dy / dist) * pullSpeed;
            }
          }
        }

        // 4. Letter Eating Collision
        const headRadius = 16;
        const letterRadius = 14;
        const eatDistSq = (headRadius + letterRadius) * (headRadius + letterRadius);

        for (let i = lettersRef.current.length - 1; i >= 0; i--) {
          const l = lettersRef.current[i];
          const dx = player.head.x - l.x;
          const dy = player.head.y - l.y;

          if (dx * dx + dy * dy < eatDistSq) {
            // Eaten!
            lettersRef.current.splice(i, 1);

            const result = processLetterCollection(
              l.char,
              player.targetWord,
              player.targetWordProgress,
              streakRef.current,
              cfg.scoreMultiplier,
              l.isGolden
            );

            player.score += result.pointsEarned;
            player.targetWordProgress = result.newProgress;
            streakRef.current = result.newStreak;
            gemsEarnedRunRef.current += result.bonusGems;

            // Grow segment carrying the letter
            player.segments.push({
              x: player.head.x,
              y: player.head.y,
              char: l.char
            });
            player.length = player.segments.length;

            // Sound
            audio.playLetterEat(result.isTargetLetter, result.newStreak);

            // Floating text
            floatingTextsRef.current.push({
              id: `ft-${Date.now()}-${Math.random()}`,
              x: l.x,
              y: l.y - 10,
              text: result.isTargetLetter ? `+${result.pointsEarned}` : `+${result.pointsEarned}`,
              color: result.isTargetLetter ? '#22d3ee' : '#94a3b8',
              life: 1.0,
              maxLife: 1.0
            });

            // Particles
            for (let p = 0; p < 6; p++) {
              particlesRef.current.push({
                x: l.x,
                y: l.y,
                vx: (Math.random() - 0.5) * 160,
                vy: (Math.random() - 0.5) * 160,
                color: l.isGolden ? '#facc15' : '#06b6d4',
                size: 3,
                life: 0.6,
                maxLife: 0.6,
                char: p === 0 ? l.char : undefined
              });
            }

            // Target word completion!
            if (result.wordCompleted) {
              player.wordsCompleted += 1;
              audio.playWordComplete();

              floatingTextsRef.current.push({
                id: `ft-word-${Date.now()}`,
                x: player.head.x,
                y: player.head.y - 30,
                text: `WORD COMPLETE! +${result.pointsEarned}`,
                color: '#ec4899',
                life: 1.8,
                maxLife: 1.8
              });

              // Assign next target word
              player.targetWord = getRandomWord('latin', difficulty);
              player.targetWordProgress = 0;

              // Check achievements
              if (player.wordsCompleted >= 1) triggerAchievement('spelling_bee');
              if (player.wordsCompleted >= 10) triggerAchievement('lexicographer');
            }

            // First bite achievement
            triggerAchievement('first_bite');
            if (player.length >= 50) triggerAchievement('century_snake');
            break;
          }
        }

        // 5. Power-up Items Collision
        for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
          const pu = powerUpsRef.current[i];
          const dx = player.head.x - pu.x;
          const dy = player.head.y - pu.y;

          if (dx * dx + dy * dy < 28 * 28) {
            powerUpsRef.current.splice(i, 1);
            audio.playPowerUp();

            if (pu.type === 'emp') {
              // EMP Bomb: destroy obstacles in 400px radius
              for (let o = obstaclesRef.current.length - 1; o >= 0; o--) {
                const obs = obstaclesRef.current[o];
                const odx = player.head.x - obs.x;
                const ody = player.head.y - obs.y;
                if (odx * odx + ody * ody < 450 * 450) {
                  obstaclesRef.current.splice(o, 1);
                  // Spawn bonus golden letters
                  lettersRef.current.push({
                    id: `emp-gem-${Math.random()}`,
                    x: obs.x,
                    y: obs.y,
                    char: '★',
                    charSet: 'neon',
                    isGolden: true,
                    spawnTime: Date.now(),
                    pulseOffset: 0
                  });
                }
              }
            } else if (pu.type === 'shifter') {
              // Transform letters to Greek or Runic
              const sets: Array<'greek' | 'runic' | 'neon'> = ['greek', 'runic', 'neon'];
              const chosen = sets[Math.floor(Math.random() * sets.length)];
              const lettersPool = getCharSetLetters(chosen);
              for (const l of lettersRef.current) {
                l.char = lettersPool[Math.floor(Math.random() * lettersPool.length)];
                l.charSet = chosen;
              }
              triggerAchievement('polyglot');
            } else {
              player.activePowerUps[pu.type] = (player.activePowerUps[pu.type] || 0) + pu.duration;
            }

            if (pu.type === 'speed') triggerAchievement('speed_demon');

            floatingTextsRef.current.push({
              id: `ft-pu-${Date.now()}`,
              x: pu.x,
              y: pu.y - 20,
              text: `${pu.type.toUpperCase()} ACTIVATED!`,
              color: '#facc15',
              life: 1.2,
              maxLife: 1.2
            });
            break;
          }
        }

        // 6. Hazard & Obstacle Collisions
        const isGhost = !!(player.activePowerUps.ghost && player.activePowerUps.ghost > 0);
        let crashed = false;

        for (const obs of obstaclesRef.current) {
          if (checkHeadObstacleCollision(player.head, 14, obs, isGhost)) {
            crashed = true;
            break;
          }
        }

        // Self-collision
        if (!crashed && checkHeadSelfCollision(player.head, player.segments, cfg.selfCollision, isGhost)) {
          crashed = true;
        }

        // Multiplayer other snakes collision
        if (!crashed && otherSnakesRef.current.length > 0 && !isGhost) {
          for (const bot of otherSnakesRef.current) {
            if (!bot.alive) continue;
            for (const seg of bot.segments) {
              const dx = player.head.x - seg.x;
              const dy = player.head.y - seg.y;
              if (dx * dx + dy * dy < 16 * 16) {
                crashed = true;
                break;
              }
            }
            if (crashed) break;
          }
        }

        // Handle Crash / Game Over
        if (crashed) {
          player.alive = false;
          audio.playCrash();
          audio.stopBGM();

          // Save final run stats
          const earned = gemsEarnedRunRef.current + Math.floor(player.score / 100);
          const finalScore = player.score;
          const best = Math.max(profile.highScore, finalScore);

          setEndStats({
            score: finalScore,
            highScore: best,
            length: player.length,
            wordsCompleted: player.wordsCompleted,
            lettersEaten: player.length - 8,
            gemsEarned: earned,
            timeAlive: Math.floor(timeAliveRef.current),
            alphabetStreak: streakRef.current,
            killCount: 0
          });

          // Submit to Leaderboard
          const submission = submitScore(
            profile.username,
            finalScore,
            player.wordsCompleted,
            player.length,
            difficulty,
            player.skinId
          );
          setRankAchieved(submission.rank);

          // Update profile in cloud & local storage
          setProfile(prev => {
            const updated = {
              ...prev,
              highScore: Math.max(prev.highScore, finalScore),
              longestSnake: Math.max(prev.longestSnake, player.length),
              totalWordsSpelled: prev.totalWordsSpelled + player.wordsCompleted,
              totalLettersEaten: prev.totalLettersEaten + Math.max(0, player.length - 8),
              gamesPlayed: prev.gamesPlayed + 1,
              gems: prev.gems + earned
            };
            saveProfile(updated);
            syncCloudSave(updated);
            return updated;
          });

          setGameState('gameover');
        }

        // 7. Update Rival Bots in Multiplayer
        if (otherSnakesRef.current.length > 0) {
          for (const bot of otherSnakesRef.current) {
            if (!bot.alive) continue;
            const newBotDir = calculateBotSteering(
              bot,
              lettersRef.current,
              obstaclesRef.current,
              [player, ...otherSnakesRef.current.filter(b => b.id !== bot.id)],
              dt
            );
            bot.direction = newBotDir;
            bot.head.x += bot.direction.x * bot.speed * dt;
            bot.head.y += bot.direction.y * bot.speed * dt;

            // Update bot segments
            if (bot.segments.length > 0) {
              let prevX = bot.head.x;
              let prevY = bot.head.y;
              for (const seg of bot.segments) {
                const dx = seg.x - prevX;
                const dy = seg.y - prevY;
                const dist = Math.hypot(dx, dy);
                if (dist > 16) {
                  const r = (dist - 16) / dist;
                  seg.x -= dx * r;
                  seg.y -= dy * r;
                }
                prevX = seg.x;
                prevY = seg.y;
              }
            }
          }
        }

        // 8. Spawn fresh letters near player camera if below capacity
        letterSpawnTimerRef.current += dt;
        if (letterSpawnTimerRef.current > cfg.letterSpawnInterval && lettersRef.current.length < 55) {
          letterSpawnTimerRef.current = 0;
          const angle = Math.random() * Math.PI * 2;
          const dist = 300 + Math.random() * 800;
          const charPool = getCharSetLetters('latin');

          // 25% chance to spawn next target letter!
          const nextTargetChar = player.targetWord ? player.targetWord[player.targetWordProgress] : null;
          const char = (Math.random() < 0.25 && nextTargetChar)
            ? nextTargetChar
            : charPool[Math.floor(Math.random() * charPool.length)];

          lettersRef.current.push({
            id: `letter-${Date.now()}-${Math.random()}`,
            x: player.head.x + Math.cos(angle) * dist,
            y: player.head.y + Math.sin(angle) * dist,
            char,
            charSet: 'latin',
            isTarget: char === nextTargetChar,
            spawnTime: Date.now(),
            pulseOffset: Math.random() * Math.PI * 2,
            isGolden: Math.random() < 0.1
          });
        }

        // 9. Spawn occasional Power-Ups
        powerUpSpawnTimerRef.current += dt;
        if (powerUpSpawnTimerRef.current > 14 && powerUpsRef.current.length < 4) {
          powerUpSpawnTimerRef.current = 0;
          const ptypes: PowerUpType[] = ['speed', 'magnet', 'ghost', 'shifter', 'emp', 'slowmo'];
          const chosenType = ptypes[Math.floor(Math.random() * ptypes.length)];
          const angle = Math.random() * Math.PI * 2;
          const dist = 350 + Math.random() * 650;

          powerUpsRef.current.push({
            id: `pu-${Date.now()}`,
            x: player.head.x + Math.cos(angle) * dist,
            y: player.head.y + Math.sin(angle) * dist,
            type: chosenType,
            duration: 8,
            spawnTime: Date.now()
          });
        }

        // 10. Update particles and floating text
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (p.life <= 0) particlesRef.current.splice(i, 1);
        }

        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y -= 30 * dt;
          ft.life -= dt;
          if (ft.life <= 0) floatingTextsRef.current.splice(i, 1);
        }
      }

      // Render Scene
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGameScene({
            ctx,
            width: canvas.width,
            height: canvas.height,
            camera: cameraRef.current,
            player: playerRef.current,
            otherSnakes: otherSnakesRef.current,
            letters: lettersRef.current,
            powerUps: powerUpsRef.current,
            obstacles: obstaclesRef.current,
            particles: particlesRef.current,
            floatingTexts: floatingTextsRef.current,
            time: now / 1000,
            showHUD: gameState === 'playing' || gameState === 'paused'
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, difficulty, profile.highScore, profile.username, triggerAchievement]);

  // Window resize observer for canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-cyber">
      {/* Background HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* Retro CRT Scanlines Overlay */}
      {profile.crtEffect && (
        <div className="absolute inset-0 crt-overlay pointer-events-none z-15" />
      )}

      {/* In-Game HUD (when playing) */}
      {gameState === 'playing' && (
        <GameHUD
          player={playerRef.current}
          highScore={profile.highScore}
          streak={streakRef.current}
          scoreMultiplier={DIFFICULTY_CONFIGS[difficulty].scoreMultiplier}
          difficulty={difficulty}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(m => !m)}
          onPause={() => {
            setGameState('paused');
            audio.stopBGM();
          }}
          onRestart={() => initGameSession(gameMode)}
        />
      )}

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          profile={profile}
          difficulty={difficulty}
          onSetDifficulty={setDifficulty}
          onStartGame={(mode) => initGameSession(mode)}
          onOpenSkins={() => setActiveModal('skins')}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenAchievements={() => setActiveModal('achievements')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenDaily={() => setActiveModal('daily')}
          onOpenMultiplayer={() => setActiveModal('multiplayer')}
          onStartTutorial={() => setActiveModal('tutorial')}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(m => !m)}
          isOnline={isOnline}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => {
            setGameState('playing');
            audio.startBGM();
          }}
          onRestart={() => initGameSession(gameMode)}
          onExitToTitle={() => {
            setGameState('title');
            audio.stopBGM();
          }}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(m => !m)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={endStats}
          rankAchieved={rankAchieved}
          onTryAgain={() => initGameSession(gameMode)}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onExitToTitle={() => {
            setGameState('title');
            audio.stopBGM();
          }}
        />
      )}

      {/* Mobile Touch Controls */}
      {(profile.touchControls || isMobile) && gameState === 'playing' && (
        <MobileControls
          onDirectionChange={(dir) => {
            playerRef.current.targetDirection = dir;
          }}
          onBoostStart={() => {
            playerRef.current.boostActive = true;
          }}
          onBoostEnd={() => {
            playerRef.current.boostActive = false;
          }}
          isBoosting={playerRef.current.boostActive}
        />
      )}

      {/* Sub-Modals */}
      {activeModal === 'skins' && (
        <SkinsModal
          unlockedSkins={profile.unlockedSkins}
          equippedSkinId={profile.equippedSkin}
          gems={profile.gems}
          onEquipSkin={(skinId) => {
            setProfile(p => {
              const updated = { ...p, equippedSkin: skinId };
              saveProfile(updated);
              return updated;
            });
            playerRef.current.skinId = skinId;
          }}
          onBuySkin={(skin) => {
            if (profile.gems >= skin.price) {
              setProfile(p => {
                const updated = {
                  ...p,
                  gems: p.gems - skin.price,
                  unlockedSkins: [...p.unlockedSkins, skin.id],
                  equippedSkin: skin.id
                };
                saveProfile(updated);
                return updated;
              });
              playerRef.current.skinId = skin.id;
              triggerAchievement('fashionista');
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'daily' && (
        <DailyChallengeModal
          streak={profile.dailyStreak}
          isCompletedToday={profile.lastDailyDate === getTodayDateString()}
          onStartChallenge={() => initGameSession('daily')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          profile={profile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'multiplayer' && (
        <MultiplayerLobbyModal
          onJoinArena={(code) => {
            initGameSession('multiplayer');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'tutorial' && (
        <TutorialOverlay
          onComplete={() => {
            setProfile(p => {
              const updated = { ...p, gems: p.gems + 100 };
              saveProfile(updated);
              return updated;
            });
            setActiveModal(null);
            initGameSession('arcade');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          profile={profile}
          onUpdateProfile={(updater) => {
            setProfile(prev => {
              const updated = updater(prev);
              saveProfile(updated);
              return updated;
            });
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Achievement Toast Banner */}
      {achievementToast && (
        <div className="fixed top-6 inset-x-0 mx-auto w-fit max-w-sm z-50 px-4 py-2.5 rounded-xl bg-amber-500/90 text-slate-950 font-pixel text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-in fade-in slide-in-from-top-4 duration-300">
          {achievementToast}
        </div>
      )}
    </div>
  );
}
