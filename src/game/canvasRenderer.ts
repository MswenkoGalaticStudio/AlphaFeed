import { 
  FloatingText, 
  GridLetter, 
  Obstacle, 
  Particle, 
  PowerUpItem, 
  Snake 
} from '../types/game';
import { getSkinById } from '../data/skins';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: { x: number; y: number };
  player: Snake;
  otherSnakes: Snake[];
  letters: GridLetter[];
  powerUps: PowerUpItem[];
  obstacles: Obstacle[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  time: number;
  showHUD?: boolean;
}

const TILE_SIZE = 48;

export function renderGameScene(rc: RenderContext) {
  const { ctx, width, height, camera, player, otherSnakes, letters, powerUps, obstacles, particles, floatingTexts, time, showHUD } = rc;

  // Clear screen with deep dark cyberpunk tone
  ctx.fillStyle = '#060911';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  // Center camera on viewport
  ctx.translate(width / 2 - camera.x, height / 2 - camera.y);

  // 1. Render Infinite Grid & Starfield
  renderInfiniteGrid(ctx, camera, width, height, time);

  // 2. Render Obstacles
  for (const obs of obstacles) {
    renderObstacle(ctx, obs, time);
  }

  // 3. Render Power-ups
  for (const pu of powerUps) {
    renderPowerUp(ctx, pu, time);
  }

  // 4. Render Letters
  for (const letter of letters) {
    renderLetter(ctx, letter, time);
  }

  // 5. Render Rival Bot Snakes
  for (const bot of otherSnakes) {
    if (bot.alive) {
      renderSnake(ctx, bot, time, false);
    }
  }

  // 6. Render Player Snake (when active game)
  if (player.alive && showHUD) {
    renderSnake(ctx, player, time, true);
  }

  // 7. Render Particles
  renderParticles(ctx, particles);

  // 8. Render Floating Texts
  renderFloatingTexts(ctx, floatingTexts);

  ctx.restore();

  // 9. Render Minimap Radar in top-right HUD (only when playing/paused)
  if (showHUD) {
    renderMinimap(ctx, width, height, player, otherSnakes, letters, obstacles);
  }
}

function renderInfiniteGrid(
  ctx: CanvasRenderingContext2D,
  camera: { x: number; y: number },
  width: number,
  height: number,
  time: number
) {
  const left = camera.x - width / 2;
  const top = camera.y - height / 2;
  const right = camera.x + width / 2;
  const bottom = camera.y + height / 2;

  // Subtle Parallax Starfield dots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  const starDensity = 200;
  const startStarX = Math.floor(left / starDensity) * starDensity;
  const startStarY = Math.floor(top / starDensity) * starDensity;

  for (let x = startStarX; x < right + starDensity; x += starDensity) {
    for (let y = startStarY; y < bottom + starDensity; y += starDensity) {
      const pseudoRand = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const frac = pseudoRand - Math.floor(pseudoRand);
      if (frac > 0.4) {
        const starX = x + (frac * starDensity * 0.8);
        const starY = y + ((frac * 3.7) % 1) * starDensity * 0.8;
        const size = frac > 0.85 ? 2.5 : 1.5;
        ctx.fillRect(starX, starY, size, size);
      }
    }
  }

  // Subtle Infinite Grid Lines
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)'; // Neon sky hairline
  ctx.lineWidth = 1;

  const startGridX = Math.floor(left / TILE_SIZE) * TILE_SIZE;
  const startGridY = Math.floor(top / TILE_SIZE) * TILE_SIZE;

  ctx.beginPath();
  for (let x = startGridX; x <= right; x += TILE_SIZE) {
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let y = startGridY; y <= bottom; y += TILE_SIZE) {
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();

  // Coordinate Markers on major grid lines (every 240px)
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.font = '9px "Press Start 2P", monospace';
  const majorGrid = TILE_SIZE * 5;
  const startMajorX = Math.floor(left / majorGrid) * majorGrid;
  const startMajorY = Math.floor(top / majorGrid) * majorGrid;

  for (let x = startMajorX; x <= right; x += majorGrid) {
    for (let y = startMajorY; y <= bottom; y += majorGrid) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }
}

function renderObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  if (obs.type === 'monolith') {
    // Cyber Monolith with neon border and hazard warning
    const halfW = obs.width / 2;
    const halfH = obs.height / 2;

    // Body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW, -halfH, obs.width, obs.height);

    // Neon frame
    ctx.strokeStyle = '#ef4444'; // Red alert outline
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW, -halfH, obs.width, obs.height);

    // Inner tech grid
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(-halfW + 4, -halfH + 4, obs.width - 8, obs.height - 8);

    // Hazard stripes
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-halfW + 4, -halfH + 4);
    ctx.lineTo(halfW - 4, halfH - 4);
    ctx.moveTo(-halfW + 4, halfH - 4);
    ctx.lineTo(halfW - 4, -halfH + 4);
    ctx.stroke();

  } else if (obs.type === 'laser') {
    // Pulsing electric laser barrier
    const halfW = obs.width / 2;
    const halfH = obs.height / 2;
    const pulse = Math.sin(time * 6) * 0.3 + 0.7;

    // Laser glow
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10 * pulse;

    ctx.fillStyle = `rgba(244, 63, 94, ${0.4 * pulse})`;
    ctx.fillRect(-halfW, -halfH, obs.width, obs.height);

    // High energy core beam
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-halfW + 2, -2, obs.width - 4, 4);

    ctx.shadowBlur = 0;

  } else {
    // Vortex / Hazard singularity
    const radius = obs.width / 2;
    const angle = time * 2;
    ctx.rotate(angle);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUpItem, time: number) {
  ctx.save();
  ctx.translate(pu.x, pu.y);

  const bob = Math.sin(time * 4) * 4;
  ctx.translate(0, bob);

  // Outer rotating neon beacon ring
  ctx.rotate(time * 2);
  ctx.strokeStyle = pu.type === 'speed' ? '#06b6d4' :
                    pu.type === 'magnet' ? '#ec4899' :
                    pu.type === 'ghost' ? '#a855f7' :
                    pu.type === 'emp' ? '#ef4444' :
                    pu.type === 'slowmo' ? '#38bdf8' : '#eab308';
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -16, 32, 32);

  ctx.rotate(-time * 2); // reset rotation for icon

  // Background badge
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  // Icon symbol
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';

  const icons: Record<string, string> = {
    speed: '⚡',
    magnet: '🧲',
    ghost: '👻',
    shifter: '✦',
    emp: '💣',
    slowmo: '⏳'
  };

  ctx.fillText(icons[pu.type] || '★', 0, 1);

  ctx.restore();
}

function renderLetter(ctx: CanvasRenderingContext2D, letter: GridLetter, time: number) {
  ctx.save();
  ctx.translate(letter.x, letter.y);

  // Floating bob animation
  const bob = Math.sin(time * 3 + letter.pulseOffset) * 3;
  ctx.translate(0, bob);

  const isTarget = letter.isTarget;
  const isGolden = letter.isGolden;

  const size = isTarget ? 30 : 26;
  const half = size / 2;

  // Glow if target or golden
  if (isTarget || isGolden) {
    ctx.shadowColor = isGolden ? '#facc15' : '#06b6d4';
    ctx.shadowBlur = 12;
  }

  // Base pixel tile
  ctx.fillStyle = isGolden ? '#854d0e' : isTarget ? '#164e63' : '#1e293b';
  ctx.fillRect(-half, -half, size, size);

  // Tile border
  ctx.strokeStyle = isGolden ? '#facc15' : isTarget ? '#22d3ee' : '#475569';
  ctx.lineWidth = isTarget ? 2.5 : 1.5;
  ctx.strokeRect(-half, -half, size, size);

  // Letter character in center
  ctx.font = `${isTarget ? 14 : 12}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isGolden ? '#fef08a' : isTarget ? '#ffffff' : '#94a3b8';
  ctx.fillText(letter.char, 0, 1);

  // Target pointer ring
  if (isTarget) {
    const pulseRing = (Math.sin(time * 5) + 1) * 3 + size / 2;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, pulseRing, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function renderSnake(ctx: CanvasRenderingContext2D, snake: Snake, time: number, isPlayer: boolean) {
  const skin = getSkinById(snake.skinId);
  const isGhost = !!(snake.activePowerUps.ghost && snake.activePowerUps.ghost > 0);
  const isBoost = snake.boostActive || !!(snake.activePowerUps.speed && snake.activePowerUps.speed > 0);

  ctx.save();

  if (isGhost) {
    ctx.globalAlpha = 0.55; // Ethereal ghost phasing appearance
  }

  // 1. Render Body Segments (from tail to neck)
  const segmentRadius = 13;
  for (let i = snake.segments.length - 1; i >= 0; i--) {
    const seg = snake.segments[i];
    ctx.save();
    ctx.translate(seg.x, seg.y);

    // Segment base circle/box
    ctx.fillStyle = skin.bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, segmentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Segment border
    ctx.strokeStyle = skin.accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Render letter carried on this segment
    if (seg.char) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.char, 0, 1);
    }

    ctx.restore();
  }

  // 2. Render Snake Head
  ctx.save();
  ctx.translate(snake.head.x, snake.head.y);

  // Rotate head in facing direction
  const headAngle = Math.atan2(snake.direction.y, snake.direction.x);
  ctx.rotate(headAngle);

  // Boost glow
  if (isBoost) {
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
  }

  const headRadius = 16;

  // Head main body (retro rounded capsule)
  ctx.fillStyle = skin.headColor;
  ctx.beginPath();
  ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Head rim
  ctx.strokeStyle = skin.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pixel eyes
  ctx.fillStyle = skin.eyeColor;
  // Left eye
  ctx.fillRect(4, -8, 6, 4);
  // Right eye
  ctx.fillRect(4, 4, 6, 4);

  // Directional pixel pupils
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, -7, 2, 2);
  ctx.fillRect(7, 5, 2, 2);

  // Little fangs / sensor antenna
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, -3);
  ctx.lineTo(19, -5);
  ctx.moveTo(14, 3);
  ctx.lineTo(19, 5);
  ctx.stroke();

  ctx.restore();

  // Name tag for bots or player in multiplayer
  if (!isPlayer || snake.isBot) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(snake.name, snake.head.x, snake.head.y - 24);
  }

  ctx.restore();
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;

    if (p.char) {
      // Letter spark
      ctx.font = `${Math.floor(p.size * 2)}px "Press Start 2P", monospace`;
      ctx.fillText(p.char, p.x, p.y);
    } else {
      // Pixel dot
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1.0;
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  for (const ft of texts) {
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function renderMinimap(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  player: Snake,
  otherSnakes: Snake[],
  letters: GridLetter[],
  obstacles: Obstacle[]
) {
  const isMobile = viewW < 640;
  const mapSize = isMobile ? 80 : 124;
  const padding = isMobile ? 10 : 16;
  const mapX = viewW - mapSize - padding;
  const mapY = isMobile ? 56 : padding + 54; // Below utility buttons on both mobile and desktop

  ctx.save();
  // Radar background box
  ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
  ctx.fillRect(mapX, mapY, mapSize, mapSize);

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mapX, mapY, mapSize, mapSize);

  // Radar range: ~1600px radius
  const radarRange = 1600;
  const scale = (mapSize / 2) / radarRange;
  const centerX = mapX + mapSize / 2;
  const centerY = mapY + mapSize / 2;

  // Radar crosshairs
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mapX, centerY);
  ctx.lineTo(mapX + mapSize, centerY);
  ctx.moveTo(centerX, mapY);
  ctx.lineTo(centerX, mapY + mapSize);
  ctx.arc(centerX, centerY, mapSize * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  // Render obstacles on radar
  ctx.fillStyle = '#ef4444';
  for (const obs of obstacles) {
    const dx = (obs.x - player.head.x) * scale;
    const dy = (obs.y - player.head.y) * scale;
    if (Math.abs(dx) < mapSize / 2 && Math.abs(dy) < mapSize / 2) {
      ctx.fillRect(centerX + dx - 1, centerY + dy - 1, 3, 3);
    }
  }

  // Render letters on radar
  for (const letter of letters) {
    const dx = (letter.x - player.head.x) * scale;
    const dy = (letter.y - player.head.y) * scale;
    if (Math.abs(dx) < mapSize / 2 && Math.abs(dy) < mapSize / 2) {
      ctx.fillStyle = letter.isTarget ? '#06b6d4' : letter.isGolden ? '#eab308' : '#64748b';
      const sz = letter.isTarget ? 3 : 2;
      ctx.fillRect(centerX + dx - 1, centerY + dy - 1, sz, sz);
    }
  }

  // Render rival snakes
  ctx.fillStyle = '#f43f5e';
  for (const other of otherSnakes) {
    if (!other.alive) continue;
    const dx = (other.head.x - player.head.x) * scale;
    const dy = (other.head.y - player.head.y) * scale;
    if (Math.abs(dx) < mapSize / 2 && Math.abs(dy) < mapSize / 2) {
      ctx.fillRect(centerX + dx - 2, centerY + dy - 2, 4, 4);
    }
  }

  // Render Player Head in exact center (bright neon cyan dot)
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
