export type DummyPhoto = {
  id: string;
  animal: string;
  color: { r: number; g: number; b: number };
};

/**
 * 52 curated Unsplash animal photos (3–4 per species).
 * `color` is the representative dominant hue used for color-distance matching.
 */
export const DUMMY_PHOTOS: DummyPhoto[] = [
  // ── Flamingo ──
  { id: 'ub1sSvJ_Tbs', animal: 'flamingo',  color: { r: 200, g: 110, b: 130 } },
  { id: 'R-iCTA7FiYk', animal: 'flamingo',  color: { r: 215, g: 125, b: 145 } },
  { id: 'pM6-EusnWPA', animal: 'flamingo',  color: { r: 160, g:  80, b: 100 } },
  { id: 'IWO-VOmZ9LQ', animal: 'flamingo',  color: { r: 200, g: 130, b: 150 } },
  // ── Elephant ──
  { id: 'y-Ej0o2OHTo', animal: 'elephant',  color: { r: 110, g: 120, b: 110 } },
  { id: 'qcsTbBd5MZs', animal: 'elephant',  color: { r: 120, g: 125, b: 115 } },
  { id: 'e11qQdvYksw', animal: 'elephant',  color: { r: 130, g: 130, b: 120 } },
  { id: '9c7GTWQF4m0', animal: 'elephant',  color: { r:  90, g:  90, b:  85 } },
  // ── Tiger ──
  { id: '5RBXc7R-YWs', animal: 'tiger',     color: { r: 180, g: 110, b:  50 } },
  { id: 'gRB4Euk4BYQ', animal: 'tiger',     color: { r: 185, g: 120, b:  55 } },
  { id: 'VmJDcG0rhDQ', animal: 'tiger',     color: { r: 175, g: 115, b:  45 } },
  // ── Parrot ──
  { id: 'OQgEyxy4rQ8', animal: 'parrot',    color: { r:  50, g: 120, b: 180 } },
  { id: 'FKCgL0vAtK0', animal: 'parrot',    color: { r:  80, g: 150, b:  70 } },
  { id: '2u8Q65xlcxI', animal: 'parrot',    color: { r: 100, g: 160, b:  80 } },
  // ── Bluebird ──
  { id: 'OeYUyI7jWwc', animal: 'bluebird',  color: { r:  80, g: 115, b: 175 } },
  { id: 'R8SwfEpq18M', animal: 'bluebird',  color: { r:  75, g: 120, b: 180 } },
  { id: 'tXe5DnvDCwE', animal: 'bluebird',  color: { r:  80, g: 125, b: 180 } },
  // ── Fox ──
  { id: 'U_sceRuniqM', animal: 'fox',       color: { r: 175, g:  85, b:  40 } },
  { id: 'C996mAcg6_M', animal: 'fox',       color: { r: 170, g:  90, b:  45 } },
  { id: 'NKJZS2XYFkY', animal: 'fox',       color: { r: 180, g:  95, b:  50 } },
  { id: 'xUUZcpQlqpM', animal: 'fox',       color: { r: 160, g: 120, b:  80 } },
  // ── Penguin ──
  { id: 'Tc_Z3BQ5Smk', animal: 'penguin',   color: { r:  60, g:  75, b: 100 } },
  { id: 'UFzAiLIwsNM', animal: 'penguin',   color: { r:  55, g:  70, b:  95 } },
  { id: 'LyFpyS_aMlw', animal: 'penguin',   color: { r:  50, g:  65, b:  90 } },
  { id: 'vB1uFkCCMEY', animal: 'penguin',   color: { r: 150, g: 175, b: 210 } },
  // ── Panda ──
  { id: '5hkojozyGJk', animal: 'panda',     color: { r: 140, g: 140, b: 140 } },
  { id: 'fwTkHoR67Ss', animal: 'panda',     color: { r: 110, g: 130, b: 100 } },
  { id: '6kW7LBDglVc', animal: 'panda',     color: { r: 120, g: 135, b: 110 } },
  // ── Lion ──
  { id: 'Akt_T4R4USo', animal: 'lion',      color: { r: 195, g: 158, b:  65 } },
  { id: 'LnttOmjgnyk', animal: 'lion',      color: { r: 185, g: 155, b:  70 } },
  { id: 'BbergGbopTE', animal: 'lion',      color: { r: 180, g: 145, b:  55 } },
  // ── Deer ──
  { id: 'nLYfyMf1FQg', animal: 'deer',      color: { r: 130, g: 140, b:  90 } },
  { id: 'Sjiu7bPRyco', animal: 'deer',      color: { r: 120, g: 120, b:  90 } },
  { id: 'E2fBNP96ULg', animal: 'deer',      color: { r: 100, g: 100, b:  80 } },
  // ── Wolf ──
  { id: 'Y_iaEubRNA0', animal: 'wolf',      color: { r: 100, g: 110, b: 120 } },
  { id: 'kR1Aer8c_WI', animal: 'wolf',      color: { r: 110, g: 115, b: 125 } },
  { id: 'BfeNzyi79W0', animal: 'wolf',      color: { r: 130, g: 135, b: 145 } },
  { id: '0LBz-24B0ew', animal: 'wolf',      color: { r:  90, g: 100, b: 110 } },
  // ── Peacock ──
  { id: '3EBj4jp99Gk', animal: 'peacock',   color: { r:  40, g: 120, b: 140 } },
  { id: 'WxwEsPUdpqI', animal: 'peacock',   color: { r:  35, g: 115, b: 145 } },
  { id: 'JJuoTDdS3cw', animal: 'peacock',   color: { r:  45, g: 125, b: 135 } },
  // ── Polar Bear ──
  { id: 'o1bnhassePU', animal: 'polarbear', color: { r: 200, g: 215, b: 230 } },
  { id: 'h3mvnxur8VQ', animal: 'polarbear', color: { r: 195, g: 210, b: 225 } },
  { id: 'vVEs6QBRZOs', animal: 'polarbear', color: { r: 205, g: 220, b: 235 } },
  { id: 'qQWV91TTBrE', animal: 'polarbear', color: { r: 210, g: 220, b: 230 } },
  // ── Red Panda ──
  { id: 'mIchd08vksg', animal: 'redpanda',  color: { r: 170, g:  70, b:  35 } },
  { id: 'z0bFIUBHVYY', animal: 'redpanda',  color: { r: 175, g:  75, b:  38 } },
  { id: 'ERm7haDBW8k', animal: 'redpanda',  color: { r: 165, g:  68, b:  32 } },
  { id: '9bK9n1jvYFA', animal: 'redpanda',  color: { r: 172, g:  72, b:  36 } },
  // ── Chameleon ──
  { id: 'uu_Uh55fK24', animal: 'chameleon', color: { r:  95, g: 170, b:  55 } },
  { id: 'Ehxew3uXKok', animal: 'chameleon', color: { r:  80, g: 165, b: 110 } },
  { id: '0_W5LTv9IPk', animal: 'chameleon', color: { r: 100, g: 175, b:  55 } },
];

const BASE = 'https://images.unsplash.com/photo-';
const PARAMS = '?w=1280&h=720&fit=crop&auto=format&q=80';

export function photoUrl(id: string): string {
  return `${BASE}${id}${PARAMS}`;
}

// ─── preloader ────────────────────────────────────────────────────────────────

const imageCache = new Map<string, HTMLImageElement>();
let preloadStarted = false;

/** Call once at app startup to preload all dummy photos in the background. */
export async function preloadDummies(): Promise<void> {
  if (preloadStarted) return;
  preloadStarted = true;
  await Promise.all(
    DUMMY_PHOTOS.map(({ id }) => new Promise<void>(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => { imageCache.set(id, img); resolve(); };
      img.onerror = () => resolve(); // fail silently; buildStack shows gray placeholder
      img.src = photoUrl(id);
    }))
  );
}

/** Synchronous lookup — returns null if image not yet loaded. */
export function getDummyImage(id: string): HTMLImageElement | null {
  return imageCache.get(id) ?? null;
}

// ─── color matching ───────────────────────────────────────────────────────────

function colorDistSq(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function getDominantColor(canvas: HTMLCanvasElement): { r: number; g: number; b: number } {
  const ctx = canvas.getContext('2d')!;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 40) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  return { r: r / n, g: g / n, b: b / n };
}

/**
 * Returns 8 photo IDs per segment, sorted by color proximity to the segment's dominant color.
 * shuffle=true: picks from top-20 randomly (variety on reshuffle while keeping color relevance).
 */
export function assignDummiesByColor(segments: HTMLCanvasElement[], shuffle = false): string[][] {
  return segments.map(seg => {
    const c = getDominantColor(seg);
    const sorted = [...DUMMY_PHOTOS].sort((a, b) => colorDistSq(c, a.color) - colorDistSq(c, b.color));
    const pool = shuffle ? sorted.slice(0, 20).sort(() => Math.random() - 0.5) : sorted;
    return pool.slice(0, 8).map(p => p.id);
  });
}

/** Random fallback — used before processed segments are available. */
export function assignDummies(): string[][] {
  const pick8 = () => [...DUMMY_PHOTOS].sort(() => Math.random() - 0.5).slice(0, 8).map(p => p.id);
  return [pick8(), pick8(), pick8(), pick8()];
}
