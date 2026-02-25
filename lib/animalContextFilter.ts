import { DUMMY_PHOTOS } from './dummyGenerators';

// ─── Color target computation ────────────────────────────────────────────────

/**
 * Average the dominant colors of assigned dummy photos to produce a
 * per-segment "animal palette" target color for color harmony blending.
 */
export function computeAnimalTargetColor(
  photoIds: number[]
): { r: number; g: number; b: number } {
  const colors = photoIds
    .map(id => DUMMY_PHOTOS.find(p => p.id === id)?.color)
    .filter((c): c is { r: number; g: number; b: number } => c !== undefined);

  if (colors.length === 0) return { r: 128, g: 128, b: 128 };

  return {
    r: Math.round(colors.reduce((s, c) => s + c.r, 0) / colors.length),
    g: Math.round(colors.reduce((s, c) => s + c.g, 0) / colors.length),
    b: Math.round(colors.reduce((s, c) => s + c.b, 0) / colors.length),
  };
}

// ─── Fur texture generation ───────────────────────────────────────────────────

/** 128×128 organic fiber texture — generated once, then cached. */
let furPatternCache: HTMLCanvasElement | null = null;

function getFurPattern(): HTMLCanvasElement {
  if (furPatternCache) return furPatternCache;

  const SIZE = 128;
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext('2d')!;
  const imgData = ctx.createImageData(SIZE, SIZE);
  const { data } = imgData;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;

      // Three overlapping directional sine waves → organic fur-fiber pattern
      const a = Math.sin(x * 0.28 + y * 0.12 + Math.sin(x * 0.09) * 2.8) * 0.5 + 0.5;
      const b = Math.sin(x * 0.14 + y * 0.22 + Math.cos(y * 0.07) * 3.2) * 0.5 + 0.5;
      const d = Math.sin((x + y) * 0.18 + Math.sin(x * 0.05 - y * 0.06) * 4.0) * 0.5 + 0.5;
      const combined = a * 0.45 + b * 0.35 + d * 0.20;

      // Bias toward bright so the overlay is subtle bright-side texture
      const v = Math.round((combined * 0.55 + 0.45) * 255);
      data[idx]     = v;
      data[idx + 1] = Math.round(v * 0.97); // slight warm tint (natural fur)
      data[idx + 2] = Math.round(v * 0.93);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  furPatternCache = c;
  return c;
}

// ─── Main effect function ─────────────────────────────────────────────────────

/**
 * Apply the Animal Context Filter to an existing canvas context (in-place).
 *
 * Two effects, both extremely subtle:
 * 1. **Color harmony** — shift each pixel toward the animal palette's
 *    dominant color by `strength * 0.015` blend factor (max 1.5% at 100).
 * 2. **Fur texture overlay** — tile the organic fiber pattern at
 *    `strength * 0.02` opacity (max 2% at 100) using 'overlay' composite,
 *    which only affects luminance and preserves hue.
 */
export function applyAnimalContext(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  targetColor: { r: number; g: number; b: number },
  strength: number  // 0–100
): void {
  const t = strength / 100; // normalized 0–1

  // ── 1. Color harmony (histogram color pull) ──────────────────────────────
  const blend = t * 0.015;   // max 1.5% blend per pixel toward target
  if (blend > 0) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const { data } = imgData;
    const { r: tr, g: tg, b: tb } = targetColor;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = data[i]     + (tr - data[i])     * blend;
      data[i + 1] = data[i + 1] + (tg - data[i + 1]) * blend;
      data[i + 2] = data[i + 2] + (tb - data[i + 2]) * blend;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ── 2. Fur texture overlay ───────────────────────────────────────────────
  const furOpacity = t * 0.02;  // max 2% opacity
  if (furOpacity >= 0.001) {
    const pattern = ctx.createPattern(getFurPattern(), 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalAlpha = furOpacity;
      ctx.globalCompositeOperation = 'overlay'; // luminance-only blend
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}
