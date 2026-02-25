export type DummyPhoto = {
  id: number;
  animal: string;
  color: { r: number; g: number; b: number };
};

/**
 * ~56 curated Pexels animal photos (3-4 per species).
 * CDN URL: https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1
 * `color` is the representative dominant hue used for color-distance matching.
 */
export const DUMMY_PHOTOS: DummyPhoto[] = [
  // ── Flamingo ──
  { id: 987947,   animal: 'flamingo',  color: { r: 210, g: 130, b: 150 } },
  { id: 441222,   animal: 'flamingo',  color: { r: 215, g: 125, b: 145 } },
  { id: 13995054, animal: 'flamingo',  color: { r: 205, g: 135, b: 155 } },
  { id: 18118690, animal: 'flamingo',  color: { r: 200, g: 120, b: 140 } },
  // ── Elephant ──
  { id: 1054655,  animal: 'elephant',  color: { r: 130, g: 130, b: 115 } },
  { id: 4577507,  animal: 'elephant',  color: { r: 120, g: 125, b: 110 } },
  { id: 7001091,  animal: 'elephant',  color: { r: 115, g: 120, b: 110 } },
  { id: 247431,   animal: 'elephant',  color: { r: 110, g: 120, b: 125 } },
  // ── Tiger ──
  { id: 302304,   animal: 'tiger',     color: { r: 185, g: 115, b: 50  } },
  { id: 39857,    animal: 'tiger',     color: { r: 180, g: 110, b: 45  } },
  { id: 2055100,  animal: 'tiger',     color: { r: 190, g: 120, b: 55  } },
  { id: 774544,   animal: 'tiger',     color: { r: 185, g: 115, b: 50  } },
  // ── Parrot ──
  { id: 37833,    animal: 'parrot',    color: { r:  55, g: 130, b: 185 } },
  { id: 6279041,  animal: 'parrot',    color: { r: 200, g: 150, b:  50 } },
  { id: 53360,    animal: 'parrot',    color: { r:  60, g: 120, b: 175 } },
  { id: 87416,    animal: 'parrot',    color: { r:  80, g: 155, b:  75 } },
  // ── Bluebird ──
  { id: 792416,   animal: 'bluebird',  color: { r:  80, g: 115, b: 175 } },
  { id: 27958191, animal: 'bluebird',  color: { r:  75, g: 120, b: 180 } },
  // ── Fox ──
  { id: 3634929,  animal: 'fox',       color: { r: 175, g:  90, b:  45 } },
  { id: 31338476, animal: 'fox',       color: { r: 180, g:  95, b:  50 } },
  { id: 2295744,  animal: 'fox',       color: { r: 170, g:  85, b:  40 } },
  { id: 27986881, animal: 'fox',       color: { r: 175, g:  90, b:  45 } },
  // ── Penguin ──
  { id: 20512551, animal: 'penguin',   color: { r:  60, g:  75, b: 100 } },
  { id: 724695,   animal: 'penguin',   color: { r:  55, g:  70, b:  95 } },
  { id: 14459295, animal: 'penguin',   color: { r:  65, g:  80, b: 105 } },
  // ── Panda ──
  { id: 7619816,  animal: 'panda',     color: { r: 125, g: 130, b: 120 } },
  { id: 30629354, animal: 'panda',     color: { r: 115, g: 130, b: 105 } },
  { id: 14925845, animal: 'panda',     color: { r: 120, g: 135, b: 110 } },
  { id: 15073098, animal: 'panda',     color: { r: 120, g: 130, b: 115 } },
  // ── Lion ──
  { id: 2674052,  animal: 'lion',      color: { r: 190, g: 155, b:  60 } },
  { id: 30705114, animal: 'lion',      color: { r: 185, g: 155, b:  65 } },
  { id: 12756544, animal: 'lion',      color: { r: 195, g: 158, b:  55 } },
  { id: 33045,    animal: 'lion',      color: { r: 180, g: 145, b:  55 } },
  // ── Deer ──
  { id: 34973998, animal: 'deer',      color: { r: 130, g: 135, b:  90 } },
  { id: 10148657, animal: 'deer',      color: { r: 145, g: 120, b:  75 } },
  { id: 8954101,  animal: 'deer',      color: { r: 110, g: 115, b:  80 } },
  { id: 247385,   animal: 'deer',      color: { r: 120, g: 130, b:  90 } },
  // ── Wolf ──
  { id: 682375,   animal: 'wolf',      color: { r: 110, g: 110, b: 115 } },
  { id: 11245841, animal: 'wolf',      color: { r: 105, g: 110, b: 120 } },
  { id: 1074882,  animal: 'wolf',      color: { r: 115, g: 115, b: 125 } },
  // ── Peacock ──
  { id: 674010,   animal: 'peacock',   color: { r:  45, g: 130, b: 140 } },
  { id: 45911,    animal: 'peacock',   color: { r:  40, g: 125, b: 145 } },
  { id: 27638514, animal: 'peacock',   color: { r:  50, g: 130, b: 140 } },
  { id: 18263817, animal: 'peacock',   color: { r:  45, g: 120, b: 135 } },
  // ── Polar Bear ──
  { id: 28974076, animal: 'polarbear', color: { r: 200, g: 215, b: 228 } },
  { id: 6678531,  animal: 'polarbear', color: { r: 195, g: 210, b: 225 } },
  { id: 53425,    animal: 'polarbear', color: { r: 205, g: 218, b: 230 } },
  { id: 12395457, animal: 'polarbear', color: { r: 160, g: 190, b: 215 } },
  // ── Red Panda ──
  { id: 146232,   animal: 'redpanda',  color: { r: 170, g:  68, b:  35 } },
  { id: 145902,   animal: 'redpanda',  color: { r: 165, g:  65, b:  32 } },
  { id: 2569229,  animal: 'redpanda',  color: { r: 175, g:  70, b:  38 } },
  { id: 146102,   animal: 'redpanda',  color: { r: 168, g:  67, b:  34 } },
  // ── Chameleon ──
  { id: 321899,   animal: 'chameleon', color: { r:  95, g: 165, b:  65 } },
  { id: 7892461,  animal: 'chameleon', color: { r: 100, g: 170, b:  60 } },
  { id: 3688578,  animal: 'chameleon', color: { r:  80, g: 160, b:  70 } },
  { id: 751682,   animal: 'chameleon', color: { r: 130, g: 150, b:  55 } },
];

const PARAMS = '?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1';

export function photoUrl(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg${PARAMS}`;
}

// ─── preloader ────────────────────────────────────────────────────────────────

const imageCache = new Map<number, HTMLImageElement>();
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
export function getDummyImage(id: number): HTMLImageElement | null {
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
export function assignDummiesByColor(segments: HTMLCanvasElement[], shuffle = false): number[][] {
  return segments.map(seg => {
    const c = getDominantColor(seg);
    const sorted = [...DUMMY_PHOTOS].sort((a, b) => colorDistSq(c, a.color) - colorDistSq(c, b.color));
    const pool = shuffle ? sorted.slice(0, 20).sort(() => Math.random() - 0.5) : sorted;
    return pool.slice(0, 8).map(p => p.id);
  });
}

/** Random fallback — used before processed segments are available. */
export function assignDummies(): number[][] {
  const pick8 = () => [...DUMMY_PHOTOS].sort(() => Math.random() - 0.5).slice(0, 8).map(p => p.id);
  return [pick8(), pick8(), pick8(), pick8()];
}
