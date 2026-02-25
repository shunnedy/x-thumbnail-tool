const TEXTURE_SIZE = 512;
const cache = new Map<string, HTMLCanvasElement>();

export function getTexture(type: 'nature' | 'abstract'): HTMLCanvasElement {
  if (cache.has(type)) return cache.get(type)!;
  const canvas = type === 'nature' ? generateNature() : generateAbstract();
  cache.set(type, canvas);
  return canvas;
}

/** Forest/organic texture: dark greens, blobs, grain, vein lines */
function generateNature(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Base: dark forest green
  ctx.fillStyle = 'hsl(120, 38%, 10%)';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Organic blobs
  for (let i = 0; i < 35; i++) {
    const x = Math.random() * TEXTURE_SIZE;
    const y = Math.random() * TEXTURE_SIZE;
    const r = 12 + Math.random() * 65;
    const hue = 95 + Math.random() * 55;
    const light = 15 + Math.random() * 22;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `hsla(${hue}, 55%, ${light}%, 0.75)`);
    grad.addColorStop(0.6, `hsla(${hue}, 45%, ${light - 4}%, 0.3)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  }

  // Fine grain dots
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * TEXTURE_SIZE;
    const y = Math.random() * TEXTURE_SIZE;
    const r = 0.4 + Math.random() * 1.8;
    const hue = 85 + Math.random() * 65;
    const light = 20 + Math.random() * 35;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 55%, ${light}%, ${0.2 + Math.random() * 0.45})`;
    ctx.fill();
  }

  // Vein lines
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE);
    ctx.bezierCurveTo(
      Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE,
      Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE,
      Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE
    );
    ctx.strokeStyle = `hsla(${100 + Math.random() * 40}, 60%, 32%, 0.22)`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.stroke();
  }

  // Subtle moss patches
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * TEXTURE_SIZE;
    const y = Math.random() * TEXTURE_SIZE;
    const r = 20 + Math.random() * 40;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${130 + Math.random() * 20}, 70%, 18%, 0.35)`;
    ctx.fill();
  }

  return canvas;
}

/** Abstract geometric texture: purple-blue gradient + shapes + grid */
function generateAbstract(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Base gradient
  const base = ctx.createLinearGradient(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  base.addColorStop(0, 'hsl(230, 70%, 8%)');
  base.addColorStop(0.5, 'hsl(260, 65%, 12%)');
  base.addColorStop(1, 'hsl(290, 55%, 10%)');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Geometric shapes
  for (let i = 0; i < 16; i++) {
    const x = Math.random() * TEXTURE_SIZE;
    const y = Math.random() * TEXTURE_SIZE;
    const size = 25 + Math.random() * 100;
    const hue = 185 + Math.random() * 125;
    const alpha = 0.12 + Math.random() * 0.28;
    ctx.fillStyle = `hsla(${hue}, 85%, 60%, ${alpha})`;

    const type = Math.floor(Math.random() * 3);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    if (type === 0) {
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
    } else if (type === 1) {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    }
    ctx.restore();
  }

  // Fine grid overlay
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= TEXTURE_SIZE; x += 14) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TEXTURE_SIZE); ctx.stroke();
  }
  for (let y = 0; y <= TEXTURE_SIZE; y += 14) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TEXTURE_SIZE, y); ctx.stroke();
  }

  // Diagonal accent streaks
  for (let i = 0; i < 5; i++) {
    const hue = 200 + Math.random() * 100;
    const streak = ctx.createLinearGradient(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
    streak.addColorStop(0, `hsla(${hue}, 80%, 65%, 0)`);
    streak.addColorStop(0.5, `hsla(${hue}, 80%, 65%, 0.18)`);
    streak.addColorStop(1, `hsla(${hue}, 80%, 65%, 0)`);
    ctx.strokeStyle = streak;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    const offset = (Math.random() - 0.5) * TEXTURE_SIZE;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + TEXTURE_SIZE, TEXTURE_SIZE);
    ctx.stroke();
  }

  // Radial glow at center
  const glow = ctx.createRadialGradient(
    TEXTURE_SIZE / 2, TEXTURE_SIZE / 2, 0,
    TEXTURE_SIZE / 2, TEXTURE_SIZE / 2, TEXTURE_SIZE * 0.6
  );
  glow.addColorStop(0, 'rgba(100, 160, 255, 0.08)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  return canvas;
}
