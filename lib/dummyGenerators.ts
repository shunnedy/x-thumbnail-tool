import { OUTPUT_W, OUTPUT_H } from './canvasUtils';

export type DummyType =
  | 'flamingo' | 'elephant' | 'tiger' | 'parrot' | 'bluebird'
  | 'fox' | 'penguin' | 'panda' | 'lion' | 'deer'
  | 'wolf' | 'peacock' | 'polarbear' | 'redpanda' | 'chameleon';

export const ALL_DUMMY_TYPES: DummyType[] = [
  'flamingo', 'elephant', 'tiger', 'parrot', 'bluebird',
  'fox', 'penguin', 'panda', 'lion', 'deer',
  'wolf', 'peacock', 'polarbear', 'redpanda', 'chameleon',
];

/** Representative hue for color-distance ranking */
const DUMMY_COLORS: Record<DummyType, { r: number; g: number; b: number }> = {
  flamingo:  { r: 210, g: 130, b: 150 },
  elephant:  { r: 120, g: 135, b: 148 },
  tiger:     { r: 195, g: 125, b: 55  },
  parrot:    { r: 75,  g: 158, b: 75  },
  bluebird:  { r: 75,  g: 125, b: 195 },
  fox:       { r: 175, g: 88,  b: 48  },
  penguin:   { r: 58,  g: 78,  b: 118 },
  panda:     { r: 148, g: 148, b: 148 },
  lion:      { r: 198, g: 158, b: 48  },
  deer:      { r: 158, g: 108, b: 68  },
  wolf:      { r: 108, g: 118, b: 138 },
  peacock:   { r: 48,  g: 138, b: 148 },
  polarbear: { r: 188, g: 208, b: 228 },
  redpanda:  { r: 178, g: 68,  b: 38  },
  chameleon: { r: 118, g: 188, b: 48  },
};

const cache = new Map<DummyType, HTMLCanvasElement>();

export function getDummy(type: DummyType): HTMLCanvasElement {
  if (cache.has(type)) return cache.get(type)!;
  const canvas = generateDummy(type);
  cache.set(type, canvas);
  return canvas;
}

// ─── color matching ──────────────────────────────────────────────────────────

function colorDistSq(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
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
 * Returns 8 dummy types per segment, sorted by color proximity.
 * shuffle=true: picks from top-10 randomly (variety on reshuffle while preserving color relevance).
 */
export function assignDummiesByColor(segments: HTMLCanvasElement[], shuffle = false): DummyType[][] {
  return segments.map(seg => {
    const c = getDominantColor(seg);
    const sorted = [...ALL_DUMMY_TYPES]
      .sort((a, b) => colorDistSq(c, DUMMY_COLORS[a]) - colorDistSq(c, DUMMY_COLORS[b]));
    const pool = shuffle ? sorted.slice(0, 10).sort(() => Math.random() - 0.5) : sorted;
    return pool.slice(0, 8) as DummyType[];
  });
}

/** Random fallback – used before processed segments are available */
export function assignDummies(): DummyType[][] {
  const pick8 = (): DummyType[] =>
    [...ALL_DUMMY_TYPES].sort(() => Math.random() - 0.5).slice(0, 8) as DummyType[];
  return [pick8(), pick8(), pick8(), pick8()];
}

// ─── generator ───────────────────────────────────────────────────────────────

function generateDummy(type: DummyType): HTMLCanvasElement {
  const W = OUTPUT_W, H = OUTPUT_H;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  switch (type) {
    case 'flamingo':  drawFlamingo(ctx, W, H);  break;
    case 'elephant':  drawElephant(ctx, W, H);  break;
    case 'tiger':     drawTiger(ctx, W, H);     break;
    case 'parrot':    drawParrot(ctx, W, H);    break;
    case 'bluebird':  drawBluebird(ctx, W, H);  break;
    case 'fox':       drawFox(ctx, W, H);       break;
    case 'penguin':   drawPenguin(ctx, W, H);   break;
    case 'panda':     drawPanda(ctx, W, H);     break;
    case 'lion':      drawLion(ctx, W, H);      break;
    case 'deer':      drawDeer(ctx, W, H);      break;
    case 'wolf':      drawWolf(ctx, W, H);      break;
    case 'peacock':   drawPeacock(ctx, W, H);   break;
    case 'polarbear': drawPolarBear(ctx, W, H); break;
    case 'redpanda':  drawRedPanda(ctx, W, H);  break;
    case 'chameleon': drawChameleon(ctx, W, H); break;
  }
  return c;
}

// ─── shared helpers ───────────────────────────────────────────────────────────

function gradBg(ctx: CanvasRenderingContext2D, W: number, H: number, top: string, bot: string) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function ground(ctx: CanvasRenderingContext2D, W: number, H: number, y: number, col: string) {
  ctx.fillStyle = col; ctx.fillRect(0, y, W, H - y);
}

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2e'; ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
}

// ─── FLAMINGO ─────────────────────────────────────────────────────────────────

function drawFlamingo(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#f5c8d5', '#d87090');
  // water
  const wg = ctx.createLinearGradient(0, H * 0.73, 0, H);
  wg.addColorStop(0, 'rgba(200,140,165,0.55)'); wg.addColorStop(1, 'rgba(170,110,140,0.8)');
  ctx.fillStyle = wg; ctx.fillRect(0, H * 0.73, W, H * 0.27);

  const pairs: [number, number, number][] = [[W * 0.32, 0, 1], [W * 0.62, H * 0.04, -1], [W * 0.52, H * 0.02, 1]];
  for (const [ox, oy, flip] of pairs) {
    ctx.save(); ctx.translate(ox, oy);
    // body
    ctx.beginPath(); ctx.ellipse(0, H * 0.43, W * 0.055, H * 0.11, 0.15 * flip, 0, Math.PI * 2);
    ctx.fillStyle = '#e07898'; ctx.fill();
    // wing fold
    ctx.beginPath(); ctx.ellipse(W * 0.03 * flip, H * 0.42, W * 0.04, H * 0.06, 0.3 * flip, 0, Math.PI * 2);
    ctx.fillStyle = '#c85878'; ctx.fill();
    // neck
    ctx.beginPath(); ctx.strokeStyle = '#e07898'; ctx.lineWidth = W * 0.028; ctx.lineCap = 'round';
    ctx.moveTo(0, H * 0.34);
    ctx.bezierCurveTo(-W * 0.07 * flip, H * 0.22, W * 0.06 * flip, H * 0.13, 0, H * 0.06);
    ctx.stroke();
    // head
    ctx.beginPath(); ctx.arc(0, H * 0.055, W * 0.022, 0, Math.PI * 2); ctx.fillStyle = '#c85878'; ctx.fill();
    // beak
    ctx.beginPath(); ctx.strokeStyle = '#e8c820'; ctx.lineWidth = 3;
    ctx.moveTo(W * 0.022, H * 0.048); ctx.lineTo(W * 0.052, H * 0.062); ctx.lineTo(W * 0.034, H * 0.074); ctx.stroke();
    // legs
    ctx.strokeStyle = '#d06080'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-W * 0.018, H * 0.53); ctx.lineTo(-W * 0.018, H * 0.73); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.018, H * 0.53); ctx.lineTo(W * 0.018, H * 0.70); ctx.lineTo(W * 0.038, H * 0.73); ctx.stroke();
    // reflection
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.ellipse(0, H * 0.8, W * 0.025, H * 0.04, 0, 0, Math.PI * 2); ctx.fillStyle = '#e07898'; ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

// ─── ELEPHANT ─────────────────────────────────────────────────────────────────

function drawElephant(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#9aacba', '#6a808e');
  ground(ctx, W, H, H * 0.75, '#506070');

  const cx = W * 0.48, cy = H * 0.52;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.76, W * 0.2, H * 0.03, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40,55,65,0.35)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.21, H * 0.21, 0, 0, Math.PI * 2); ctx.fillStyle = '#7a8e9e'; ctx.fill();
  // head
  ctx.beginPath(); ctx.ellipse(cx + W * 0.19, cy - H * 0.1, W * 0.14, H * 0.135, 0, 0, Math.PI * 2); ctx.fillStyle = '#7a8e9e'; ctx.fill();
  // ear
  ctx.beginPath(); ctx.ellipse(cx + W * 0.295, cy - H * 0.115, W * 0.075, H * 0.115, 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#9ab0be'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + W * 0.295, cy - H * 0.115, W * 0.05, H * 0.08, 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#c090a0'; ctx.fill();
  // trunk
  ctx.beginPath(); ctx.strokeStyle = '#7a8e9e'; ctx.lineWidth = W * 0.048; ctx.lineCap = 'round';
  ctx.moveTo(cx + W * 0.31, cy - H * 0.04);
  ctx.bezierCurveTo(cx + W * 0.40, cy + H * 0.09, cx + W * 0.3, cy + H * 0.2, cx + W * 0.18, cy + H * 0.22); ctx.stroke();
  // tusk
  ctx.beginPath(); ctx.strokeStyle = '#e0d8c0'; ctx.lineWidth = 5;
  ctx.moveTo(cx + W * 0.29, cy - H * 0.05);
  ctx.bezierCurveTo(cx + W * 0.37, cy, cx + W * 0.38, cy + H * 0.06, cx + W * 0.33, cy + H * 0.09); ctx.stroke();
  // eye
  eye(ctx, cx + W * 0.27, cy - H * 0.15, 7);
  // legs
  ctx.fillStyle = '#6a7e8e';
  for (const lx of [cx - W * 0.13, cx - W * 0.04, cx + W * 0.05, cx + W * 0.14]) {
    ctx.beginPath();
    ctx.roundRect(lx - W * 0.03, cy + H * 0.17, W * 0.058, H * 0.17, 8);
    ctx.fill();
  }
  // tail
  ctx.beginPath(); ctx.strokeStyle = '#7a8e9e'; ctx.lineWidth = 4;
  ctx.moveTo(cx - W * 0.21, cy - H * 0.04);
  ctx.bezierCurveTo(cx - W * 0.27, cy + H * 0.04, cx - W * 0.29, cy + H * 0.08, cx - W * 0.26, cy + H * 0.12); ctx.stroke();
}

// ─── TIGER ────────────────────────────────────────────────────────────────────

function drawTiger(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#d4a048', '#986018');
  ground(ctx, W, H, H * 0.76, '#785010');

  const cx = W * 0.46, cy = H * 0.5;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.77, W * 0.22, H * 0.03, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(60,30,0,0.3)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.21, H * 0.15, 0.1, 0, Math.PI * 2); ctx.fillStyle = '#c87030'; ctx.fill();
  // head
  ctx.beginPath(); ctx.ellipse(cx + W * 0.22, cy - H * 0.04, W * 0.13, H * 0.12, 0, 0, Math.PI * 2); ctx.fillStyle = '#c87030'; ctx.fill();
  // ears
  for (const [ex, flip] of [[W * 0.13, -1], [W * 0.22, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx + ex, cy - H * 0.14);
    ctx.lineTo(cx + ex + W * 0.03 * flip, cy - H * 0.23);
    ctx.lineTo(cx + ex + W * 0.07, cy - H * 0.14);
    ctx.fillStyle = '#c87030'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + ex + W * 0.01 * flip, cy - H * 0.155);
    ctx.lineTo(cx + ex + W * 0.03 * flip, cy - H * 0.205);
    ctx.lineTo(cx + ex + W * 0.055, cy - H * 0.155);
    ctx.fillStyle = '#e09080'; ctx.fill();
  }
  // cheeks
  ctx.beginPath(); ctx.ellipse(cx + W * 0.22, cy - H * 0.02, W * 0.065, H * 0.055, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d88040'; ctx.fill();
  // body stripes
  ctx.strokeStyle = '#703018'; ctx.lineWidth = 6;
  for (const [sx, a] of [[-W * 0.1, 0.2], [-W * 0.02, 0.1], [W * 0.06, -0.1], [W * 0.13, -0.2]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(cx + sx, cy - H * 0.13); ctx.lineTo(cx + sx + W * 0.025 * a * 5, cy + H * 0.13); ctx.stroke();
  }
  // face stripes
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx + W * 0.17, cy - H * 0.11); ctx.lineTo(cx + W * 0.15, cy - H * 0.01); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + W * 0.26, cy - H * 0.12); ctx.lineTo(cx + W * 0.28, cy - H * 0.02); ctx.stroke();
  // eyes
  for (const ex of [cx + W * 0.17, cx + W * 0.26]) {
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.07, 6, 0, Math.PI * 2); ctx.fillStyle = '#e8c000'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.07, 3, 0, Math.PI * 2); ctx.fillStyle = '#101010'; ctx.fill();
  }
  // nose + whiskers
  ctx.beginPath(); ctx.arc(cx + W * 0.33, cy - H * 0.02, 7, 0, Math.PI * 2); ctx.fillStyle = '#e07888'; ctx.fill();
  ctx.strokeStyle = '#ffffff60'; ctx.lineWidth = 2;
  for (const [wx, wy, dx] of [[cx + W * 0.34, cy + H * 0.01, 1], [cx + W * 0.34, cy + H * 0.04, 1], [cx + W * 0.32, cy + H * 0.01, -1], [cx + W * 0.32, cy + H * 0.04, -1]] as [number, number, number][]) {
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + W * 0.07 * dx, wy - H * 0.005); ctx.stroke();
  }
  // tail
  ctx.beginPath(); ctx.strokeStyle = '#c87030'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.moveTo(cx - W * 0.21, cy); ctx.bezierCurveTo(cx - W * 0.32, cy - H * 0.08, cx - W * 0.33, cy - H * 0.2, cx - W * 0.26, cy - H * 0.26); ctx.stroke();
  ctx.strokeStyle = '#703018'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx - W * 0.285, cy - H * 0.17); ctx.lineTo(cx - W * 0.26, cy - H * 0.26); ctx.stroke();
  // legs
  ctx.fillStyle = '#a86020';
  for (const lx of [cx - W * 0.12, cx - W * 0.04, cx + W * 0.04, cx + W * 0.12]) {
    ctx.beginPath(); ctx.roundRect(lx - W * 0.025, cy + H * 0.12, W * 0.05, H * 0.19, 6); ctx.fill();
  }
}

// ─── PARROT ───────────────────────────────────────────────────────────────────

function drawParrot(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#4aaa50', '#287830');
  // foliage bg
  ctx.fillStyle = 'rgba(20,80,20,0.4)';
  for (const [lx, ly, lr] of [[W*0.1,H*0.15,60],[W*0.9,H*0.2,55],[W*0.05,H*0.6,50],[W*0.95,H*0.55,45],[W*0.5,H*0.05,65]] as [number,number,number][]) {
    ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI*2); ctx.fill();
  }
  // branch
  ctx.strokeStyle = '#5a3c18'; ctx.lineWidth = W * 0.04; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.75); ctx.bezierCurveTo(W * 0.35, H * 0.65, W * 0.65, H * 0.7, W * 0.95, H * 0.6); ctx.stroke();

  const cx = W * 0.52, cy = H * 0.44;
  // tail feathers
  for (const [ta, tc] of [[-0.3,'#e05020'],[0,'#e0c000'],[0.3,'#20a040']] as [number,string][]) {
    ctx.beginPath(); ctx.strokeStyle = tc; ctx.lineWidth = 8;
    ctx.moveTo(cx - W * 0.01, cy + H * 0.12);
    ctx.bezierCurveTo(cx - W * 0.02, cy + H * 0.22, cx - W * 0.04 + W * 0.03 * ta, cy + H * 0.34, cx - W * 0.02 + W * 0.06 * ta, cy + H * 0.4);
    ctx.stroke();
  }
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.085, H * 0.13, 0, 0, Math.PI * 2); ctx.fillStyle = '#28a040'; ctx.fill();
  // wing
  ctx.beginPath(); ctx.ellipse(cx + W * 0.05, cy + H * 0.01, W * 0.075, H * 0.09, 0.4, 0, Math.PI * 2); ctx.fillStyle = '#209030'; ctx.fill();
  // wing highlight
  ctx.beginPath(); ctx.ellipse(cx + W * 0.06, cy, W * 0.04, H * 0.04, 0.4, 0, Math.PI * 2); ctx.fillStyle = '#60c060'; ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx, cy - H * 0.13, W * 0.065, 0, Math.PI * 2); ctx.fillStyle = '#28a040'; ctx.fill();
  // red forehead
  ctx.beginPath(); ctx.arc(cx - W * 0.01, cy - H * 0.18, W * 0.03, 0, Math.PI * 2); ctx.fillStyle = '#e02020'; ctx.fill();
  // eye ring
  ctx.beginPath(); ctx.arc(cx + W * 0.025, cy - H * 0.13, W * 0.022, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  eye(ctx, cx + W * 0.025, cy - H * 0.13, 7);
  // beak
  ctx.beginPath(); ctx.moveTo(cx + W * 0.06, cy - H * 0.135); ctx.bezierCurveTo(cx + W * 0.11, cy - H * 0.12, cx + W * 0.1, cy - H * 0.09, cx + W * 0.055, cy - H * 0.1);
  ctx.fillStyle = '#d04010'; ctx.fill();
  // feet
  ctx.strokeStyle = '#5a3c18'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx - W * 0.03, cy + H * 0.13); ctx.lineTo(cx - W * 0.03, H * 0.66); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + W * 0.03, cy + H * 0.13); ctx.lineTo(cx + W * 0.03, H * 0.66); ctx.stroke();
}

// ─── BLUEBIRD ─────────────────────────────────────────────────────────────────

function drawBluebird(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#6aacdc', '#2c68b0');
  // clouds
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for (const [cx2, cy2, r] of [[W*0.15,H*0.18,40],[W*0.8,H*0.12,50],[W*0.5,H*0.25,35],[W*0.35,H*0.08,30]] as [number,number,number][]) {
    ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx2+r*0.6, cy2+5, r*0.7, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx2-r*0.5, cy2+8, r*0.65, 0, Math.PI*2); ctx.fill();
  }
  // water
  gradBg(ctx, W, H * 0.3, '#1a5898', '#0e3060');
  ctx.fillStyle = '#1a5898'; ctx.fillRect(0, H * 0.72, W, H * 0.28);

  const cx = W * 0.5, cy = H * 0.42;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.73, W * 0.05, H * 0.012, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,50,100,0.3)'; ctx.fill();
  // tail
  for (const [ta, tc] of [[-0.25,'#1850b0'],[0,'#2060c8'],[0.25,'#3070d8']] as [number,string][]) {
    ctx.beginPath(); ctx.strokeStyle = tc; ctx.lineWidth = 7;
    ctx.moveTo(cx - W * 0.09, cy + H * 0.02);
    ctx.bezierCurveTo(cx - W * 0.14, cy + H * 0.06, cx - W * 0.18 + W * 0.02 * ta, cy + H * 0.14, cx - W * 0.16 + W * 0.04 * ta, cy + H * 0.18);
    ctx.stroke();
  }
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.09, H * 0.075, 0, 0, Math.PI * 2); ctx.fillStyle = '#2868c8'; ctx.fill();
  // belly
  ctx.beginPath(); ctx.ellipse(cx + W * 0.02, cy + H * 0.01, W * 0.045, H * 0.04, 0.2, 0, Math.PI * 2); ctx.fillStyle = '#e8b060'; ctx.fill();
  // left wing (spread)
  ctx.beginPath(); ctx.moveTo(cx, cy - H * 0.01);
  ctx.bezierCurveTo(cx - W * 0.12, cy - H * 0.1, cx - W * 0.22, cy - H * 0.06, cx - W * 0.2, cy + H * 0.04);
  ctx.bezierCurveTo(cx - W * 0.14, cy + H * 0.05, cx - W * 0.06, cy + H * 0.02, cx, cy + H * 0.03);
  ctx.fillStyle = '#1858b8'; ctx.fill();
  // right wing
  ctx.beginPath(); ctx.moveTo(cx, cy - H * 0.01);
  ctx.bezierCurveTo(cx + W * 0.12, cy - H * 0.1, cx + W * 0.22, cy - H * 0.06, cx + W * 0.2, cy + H * 0.04);
  ctx.bezierCurveTo(cx + W * 0.14, cy + H * 0.05, cx + W * 0.06, cy + H * 0.02, cx, cy + H * 0.03);
  ctx.fillStyle = '#1858b8'; ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx + W * 0.065, cy - H * 0.06, W * 0.048, 0, Math.PI * 2); ctx.fillStyle = '#2868c8'; ctx.fill();
  eye(ctx, cx + W * 0.085, cy - H * 0.07, 5);
  // beak
  ctx.beginPath(); ctx.moveTo(cx + W * 0.11, cy - H * 0.06); ctx.lineTo(cx + W * 0.16, cy - H * 0.057); ctx.lineTo(cx + W * 0.11, cy - H * 0.05);
  ctx.fillStyle = '#c07020'; ctx.fill();
}

// ─── FOX ──────────────────────────────────────────────────────────────────────

function drawFox(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#c87848', '#904820');
  ground(ctx, W, H, H * 0.76, '#6a3010');
  // falling leaves
  ctx.fillStyle = 'rgba(200,120,40,0.35)';
  for (const [lx, ly] of [[W*0.15,H*0.15],[W*0.8,H*0.1],[W*0.4,H*0.3],[W*0.7,H*0.4],[W*0.2,H*0.5]] as [number,number][]) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(0.4);
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 18, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }
  const cx = W * 0.5, cy = H * 0.5;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.77, W * 0.18, H * 0.025, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(50,15,0,0.3)'; ctx.fill();
  // tail
  ctx.beginPath(); ctx.strokeStyle = '#c07030'; ctx.lineWidth = W * 0.065; ctx.lineCap = 'round';
  ctx.moveTo(cx - W * 0.19, cy + H * 0.05);
  ctx.bezierCurveTo(cx - W * 0.36, cy - H * 0.02, cx - W * 0.38, cy - H * 0.2, cx - W * 0.28, cy - H * 0.28); ctx.stroke();
  // tail tip
  ctx.beginPath(); ctx.arc(cx - W * 0.28, cy - H * 0.29, W * 0.04, 0, Math.PI * 2); ctx.fillStyle = '#f0ede8'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.18, H * 0.14, -0.1, 0, Math.PI * 2); ctx.fillStyle = '#b86030'; ctx.fill();
  // chest
  ctx.beginPath(); ctx.ellipse(cx + W * 0.08, cy + H * 0.01, W * 0.07, H * 0.1, 0.2, 0, Math.PI * 2); ctx.fillStyle = '#f0ede8'; ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx + W * 0.2, cy - H * 0.1, W * 0.1, 0, Math.PI * 2); ctx.fillStyle = '#b86030'; ctx.fill();
  // muzzle
  ctx.beginPath(); ctx.ellipse(cx + W * 0.29, cy - H * 0.07, W * 0.06, H * 0.05, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0ede8'; ctx.fill();
  // ears
  for (const [ea, flip] of [[-W * 0.06, -1], [W * 0.04, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx + W * 0.2 + ea, cy - H * 0.18);
    ctx.lineTo(cx + W * 0.2 + ea + W * 0.02 * flip, cy - H * 0.28);
    ctx.lineTo(cx + W * 0.2 + ea + W * 0.07, cy - H * 0.18);
    ctx.fillStyle = '#b86030'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + W * 0.2 + ea + W * 0.01 * flip, cy - H * 0.19);
    ctx.lineTo(cx + W * 0.2 + ea + W * 0.02 * flip, cy - H * 0.25);
    ctx.lineTo(cx + W * 0.2 + ea + W * 0.055, cy - H * 0.19);
    ctx.fillStyle = '#e08070'; ctx.fill();
  }
  eye(ctx, cx + W * 0.22, cy - H * 0.12, 6);
  ctx.beginPath(); ctx.arc(cx + W * 0.32, cy - H * 0.06, 5, 0, Math.PI * 2); ctx.fillStyle = '#202020'; ctx.fill();
  // legs
  ctx.fillStyle = '#a05828';
  for (const lx of [cx - W * 0.1, cx - W * 0.02, cx + W * 0.06, cx + W * 0.14]) {
    ctx.beginPath(); ctx.roundRect(lx - W * 0.022, cy + H * 0.12, W * 0.045, H * 0.18, 6); ctx.fill();
  }
}

// ─── PENGUIN ─────────────────────────────────────────────────────────────────

function drawPenguin(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#3c5880', '#1e2c50');
  // stars
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 120; i++) {
    const sx = Math.random() * W, sy = Math.random() * H * 0.6;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }
  // ice/ground
  const ice = ctx.createLinearGradient(0, H * 0.74, 0, H);
  ice.addColorStop(0, '#a0c8e8'); ice.addColorStop(1, '#78a8cc');
  ctx.fillStyle = ice; ctx.fillRect(0, H * 0.74, W, H * 0.26);
  // ice shine
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, H * 0.74, W, 4);

  const cx = W * 0.5, cy = H * 0.48;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.75, W * 0.1, H * 0.02, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,30,70,0.4)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.1, H * 0.2, 0, 0, Math.PI * 2); ctx.fillStyle = '#181828'; ctx.fill();
  // belly
  ctx.beginPath(); ctx.ellipse(cx, cy + H * 0.02, W * 0.065, H * 0.15, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0f0f0'; ctx.fill();
  // wings
  for (const [wa, wf] of [[-1, -1], [1, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.ellipse(cx + W * 0.1 * wf, cy, W * 0.04, H * 0.15, wa * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#181828'; ctx.fill();
  }
  // head
  ctx.beginPath(); ctx.arc(cx, cy - H * 0.19, W * 0.075, 0, Math.PI * 2); ctx.fillStyle = '#181828'; ctx.fill();
  // face white
  ctx.beginPath(); ctx.ellipse(cx, cy - H * 0.185, W * 0.05, H * 0.055, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0f0f0'; ctx.fill();
  // eyes
  for (const ex of [cx - W * 0.025, cx + W * 0.025]) {
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.205, 5, 0, Math.PI * 2); ctx.fillStyle = '#101018'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex - 1.5, cy - H * 0.208, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }
  // beak
  ctx.beginPath(); ctx.moveTo(cx - W * 0.02, cy - H * 0.175); ctx.lineTo(cx + W * 0.02, cy - H * 0.175);
  ctx.lineTo(cx, cy - H * 0.15); ctx.fillStyle = '#e8b030'; ctx.fill();
  // feet
  ctx.fillStyle = '#e8b030';
  for (const fx of [cx - W * 0.04, cx + W * 0.04]) {
    ctx.beginPath(); ctx.ellipse(fx, H * 0.755, W * 0.04, H * 0.018, 0, 0, Math.PI * 2); ctx.fill();
  }
  // scarf
  ctx.beginPath(); ctx.strokeStyle = '#c03030'; ctx.lineWidth = 10;
  ctx.arc(cx, cy - H * 0.155, W * 0.075, 0, Math.PI * 1.8); ctx.stroke();
  ctx.beginPath(); ctx.fillStyle = '#c03030';
  ctx.roundRect(cx + W * 0.065, cy - H * 0.12, W * 0.022, H * 0.07, 3); ctx.fill();
}

// ─── PANDA ────────────────────────────────────────────────────────────────────

function drawPanda(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#a0a8a8', '#686e70');
  ground(ctx, W, H, H * 0.75, '#484e50');
  // bamboo bg
  ctx.strokeStyle = 'rgba(80,110,80,0.4)'; ctx.lineWidth = 18;
  for (const bx of [W * 0.1, W * 0.22, W * 0.82, W * 0.92]) {
    ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + 5, H); ctx.stroke();
  }
  const cx = W * 0.5, cy = H * 0.48;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.76, W * 0.14, H * 0.025, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(30,35,35,0.35)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.16, H * 0.21, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0f0f0'; ctx.fill();
  // black patches on body
  ctx.fillStyle = '#202020';
  ctx.beginPath(); ctx.ellipse(cx - W * 0.14, cy - H * 0.04, W * 0.06, H * 0.1, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + W * 0.14, cy - H * 0.04, W * 0.06, H * 0.1, -0.3, 0, Math.PI * 2); ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx, cy - H * 0.2, W * 0.12, 0, Math.PI * 2); ctx.fillStyle = '#f0f0f0'; ctx.fill();
  // ears
  for (const ex of [cx - W * 0.1, cx + W * 0.1]) {
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.305, W * 0.04, 0, Math.PI * 2); ctx.fillStyle = '#202020'; ctx.fill();
  }
  // eye patches
  for (const [epx, epa] of [[cx - W * 0.055, -0.3], [cx + W * 0.055, 0.3]] as [number, number][]) {
    ctx.beginPath(); ctx.ellipse(epx, cy - H * 0.2, W * 0.045, H * 0.045, epa, 0, Math.PI * 2);
    ctx.fillStyle = '#202020'; ctx.fill();
  }
  // eyes
  for (const ex of [cx - W * 0.055, cx + W * 0.055]) {
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.2, 7, 0, Math.PI * 2); ctx.fillStyle = '#101010'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex - 2, cy - H * 0.203, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }
  // nose + mouth
  ctx.beginPath(); ctx.arc(cx, cy - H * 0.175, 7, 0, Math.PI * 2); ctx.fillStyle = '#303030'; ctx.fill();
  ctx.beginPath(); ctx.strokeStyle = '#303030'; ctx.lineWidth = 3;
  ctx.moveTo(cx - W * 0.03, cy - H * 0.165); ctx.lineTo(cx, cy - H * 0.155); ctx.lineTo(cx + W * 0.03, cy - H * 0.165); ctx.stroke();
  // bamboo in paw
  ctx.strokeStyle = '#609040'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(cx + W * 0.12, cy - H * 0.06); ctx.lineTo(cx + W * 0.16, cy + H * 0.18); ctx.stroke();
  // legs
  ctx.fillStyle = '#202020';
  for (const lx of [cx - W * 0.1, cx - W * 0.02, cx + W * 0.02, cx + W * 0.1]) {
    ctx.beginPath(); ctx.roundRect(lx - W * 0.03, cy + H * 0.19, W * 0.06, H * 0.13, 8); ctx.fill();
  }
}

// ─── LION ─────────────────────────────────────────────────────────────────────

function drawLion(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#d8a838', '#9a6810');
  ground(ctx, W, H, H * 0.75, '#785010');
  // savanna grass
  ctx.strokeStyle = '#906020'; ctx.lineWidth = 3;
  for (let i = 0; i < 20; i++) {
    const gx = Math.random() * W;
    ctx.beginPath(); ctx.moveTo(gx, H * 0.75); ctx.lineTo(gx + (Math.random() - 0.5) * 15, H * 0.65); ctx.stroke();
  }
  const cx = W * 0.5, cy = H * 0.48;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.76, W * 0.18, H * 0.03, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(60,30,0,0.3)'; ctx.fill();
  // mane
  for (let i = 0; i < 16; i++) {
    const ma = (i / 16) * Math.PI * 2;
    const mr = W * 0.155;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(ma) * mr * 0.6, cy - H * 0.12 + Math.sin(ma) * mr * 0.7, W * 0.04, H * 0.05, ma, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#804010' : '#a05818'; ctx.fill();
  }
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.2, H * 0.15, 0, 0, Math.PI * 2); ctx.fillStyle = '#c89840'; ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx + W * 0.18, cy - H * 0.1, W * 0.13, 0, Math.PI * 2); ctx.fillStyle = '#d0a040'; ctx.fill();
  // face markings
  ctx.beginPath(); ctx.ellipse(cx + W * 0.22, cy - H * 0.06, W * 0.07, H * 0.06, 0, 0, Math.PI * 2); ctx.fillStyle = '#e0b850'; ctx.fill();
  // ears
  for (const ea of [-W * 0.11, W * 0.04]) {
    ctx.beginPath(); ctx.arc(cx + W * 0.18 + ea, cy - H * 0.21, W * 0.035, 0, Math.PI * 2); ctx.fillStyle = '#c89840'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx + W * 0.18 + ea, cy - H * 0.21, W * 0.02, 0, Math.PI * 2); ctx.fillStyle = '#e09080'; ctx.fill();
  }
  // eyes
  for (const ex of [cx + W * 0.13, cx + W * 0.23]) {
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.12, 7, 0, Math.PI * 2); ctx.fillStyle = '#d0a800'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex, cy - H * 0.12, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#101010'; ctx.fill();
  }
  // nose + mouth
  ctx.beginPath(); ctx.arc(cx + W * 0.26, cy - H * 0.06, 8, 0, Math.PI * 2); ctx.fillStyle = '#a06070'; ctx.fill();
  ctx.strokeStyle = '#a06070'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx + W * 0.22, cy - H * 0.05); ctx.lineTo(cx + W * 0.26, cy - H * 0.04); ctx.lineTo(cx + W * 0.3, cy - H * 0.05); ctx.stroke();
  // tail
  ctx.beginPath(); ctx.strokeStyle = '#c09030'; ctx.lineWidth = 9;
  ctx.moveTo(cx - W * 0.2, cy); ctx.bezierCurveTo(cx - W * 0.3, cy - H * 0.1, cx - W * 0.32, cy - H * 0.22, cx - W * 0.26, cy - H * 0.28); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx - W * 0.26, cy - H * 0.3, W * 0.03, 0, Math.PI * 2); ctx.fillStyle = '#804010'; ctx.fill();
  // legs
  ctx.fillStyle = '#b08830';
  for (const lx of [cx - W * 0.12, cx - W * 0.04, cx + W * 0.04, cx + W * 0.12]) {
    ctx.beginPath(); ctx.roundRect(lx - W * 0.028, cy + H * 0.13, W * 0.056, H * 0.18, 7); ctx.fill();
  }
}

// ─── DEER ─────────────────────────────────────────────────────────────────────

function drawDeer(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#c89060', '#7a5020');
  ground(ctx, W, H, H * 0.76, '#5a3810');
  const cx = W * 0.5, cy = H * 0.46;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.77, W * 0.12, H * 0.02, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40,20,0,0.3)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.13, H * 0.15, -0.15, 0, Math.PI * 2); ctx.fillStyle = '#a06840'; ctx.fill();
  // spots
  ctx.fillStyle = 'rgba(240,220,180,0.55)';
  for (const [sx, sy] of [[cx - W*0.05, cy - H*0.04],[cx + W*0.03, cy - H*0.07],[cx - W*0.02, cy + H*0.04],[cx + W*0.08, cy + H*0.02],[cx - W*0.1, cy + H*0.03]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(sx, sy, W * 0.018, 0, Math.PI * 2); ctx.fill();
  }
  // neck
  ctx.beginPath(); ctx.strokeStyle = '#a06840'; ctx.lineWidth = W * 0.065; ctx.lineCap = 'round';
  ctx.moveTo(cx + W * 0.1, cy - H * 0.1); ctx.lineTo(cx + W * 0.16, cy - H * 0.24); ctx.stroke();
  // head
  ctx.beginPath(); ctx.ellipse(cx + W * 0.18, cy - H * 0.27, W * 0.065, H * 0.075, 0.2, 0, Math.PI * 2); ctx.fillStyle = '#a06840'; ctx.fill();
  // muzzle
  ctx.beginPath(); ctx.ellipse(cx + W * 0.23, cy - H * 0.245, W * 0.04, H * 0.035, 0, 0, Math.PI * 2); ctx.fillStyle = '#c09070'; ctx.fill();
  // ears
  for (const [ea, epa] of [[-W * 0.08, -0.6], [W * 0.04, 0.6]] as [number, number][]) {
    ctx.beginPath(); ctx.ellipse(cx + W * 0.18 + ea, cy - H * 0.29, W * 0.03, H * 0.055, epa, 0, Math.PI * 2); ctx.fillStyle = '#a06840'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + W * 0.18 + ea, cy - H * 0.29, W * 0.018, H * 0.038, epa, 0, Math.PI * 2); ctx.fillStyle = '#e09080'; ctx.fill();
  }
  // antlers
  ctx.strokeStyle = '#6a3808'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const [ax, adir] of [[cx + W * 0.12, -1], [cx + W * 0.24, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(ax, cy - H * 0.33);
    ctx.lineTo(ax + W * 0.04 * adir, cy - H * 0.48);
    ctx.lineTo(ax + W * 0.08 * adir, cy - H * 0.43); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax + W * 0.04 * adir, cy - H * 0.42);
    ctx.lineTo(ax + W * 0.05 * adir, cy - H * 0.53); ctx.stroke();
  }
  eye(ctx, cx + W * 0.2, cy - H * 0.28, 5);
  // legs
  ctx.fillStyle = '#906038';
  for (const [lx, ly] of [[cx-W*0.09, cy+H*0.13],[cx-W*0.01,cy+H*0.13],[cx+W*0.07,cy+H*0.1],[cx+W*0.15,cy+H*0.1]] as [number,number][]) {
    ctx.beginPath(); ctx.roundRect(lx - W * 0.02, ly, W * 0.04, H * 0.21, 5); ctx.fill();
    // hoof
    ctx.fillStyle = '#403020'; ctx.beginPath(); ctx.roundRect(lx - W*0.022, ly + H*0.19, W*0.044, H*0.04, 4); ctx.fill();
    ctx.fillStyle = '#906038';
  }
  // tail
  ctx.beginPath(); ctx.arc(cx - W * 0.13, cy - H * 0.04, W * 0.025, 0, Math.PI * 2); ctx.fillStyle = '#f0ece0'; ctx.fill();
}

// ─── WOLF ─────────────────────────────────────────────────────────────────────

function drawWolf(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#7888a8', '#3c4a68');
  ground(ctx, W, H, H * 0.76, '#2a3448');
  // moon
  ctx.beginPath(); ctx.arc(W * 0.82, H * 0.12, 45, 0, Math.PI * 2); ctx.fillStyle = 'rgba(220,225,235,0.9)'; ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.88, H * 0.1, 40, 0, Math.PI * 2); ctx.fillStyle = '#5c6880'; ctx.fill();

  const cx = W * 0.45, cy = H * 0.5;
  // tail
  ctx.beginPath(); ctx.strokeStyle = '#8898b0'; ctx.lineWidth = W * 0.05; ctx.lineCap = 'round';
  ctx.moveTo(cx - W * 0.18, cy + H * 0.05);
  ctx.bezierCurveTo(cx - W * 0.3, cy - H * 0.08, cx - W * 0.26, cy - H * 0.22, cx - W * 0.14, cy - H * 0.28); ctx.stroke();
  // tail tip
  ctx.beginPath(); ctx.arc(cx - W * 0.13, cy - H * 0.3, W * 0.03, 0, Math.PI * 2); ctx.fillStyle = '#c8ccd8'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.19, H * 0.14, -0.1, 0, Math.PI * 2); ctx.fillStyle = '#8898b0'; ctx.fill();
  // neck
  ctx.beginPath(); ctx.strokeStyle = '#8898b0'; ctx.lineWidth = W * 0.07;
  ctx.moveTo(cx + W * 0.12, cy - H * 0.08); ctx.lineTo(cx + W * 0.2, cy - H * 0.22); ctx.stroke();
  // head
  ctx.beginPath(); ctx.ellipse(cx + W * 0.24, cy - H * 0.26, W * 0.1, H * 0.1, 0, 0, Math.PI * 2); ctx.fillStyle = '#8898b0'; ctx.fill();
  // snout
  ctx.beginPath(); ctx.ellipse(cx + W * 0.33, cy - H * 0.2, W * 0.07, H * 0.055, 0.3, 0, Math.PI * 2); ctx.fillStyle = '#9aaabb'; ctx.fill();
  // ears
  for (const [ea, ef] of [[-W * 0.09, -1], [W * 0.02, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx + W * 0.24 + ea, cy - H * 0.33);
    ctx.lineTo(cx + W * 0.24 + ea + W * 0.025 * ef, cy - H * 0.43);
    ctx.lineTo(cx + W * 0.24 + ea + W * 0.07, cy - H * 0.33);
    ctx.fillStyle = '#8898b0'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + W * 0.24 + ea + W * 0.01 * ef, cy - H * 0.34);
    ctx.lineTo(cx + W * 0.24 + ea + W * 0.025 * ef, cy - H * 0.4);
    ctx.lineTo(cx + W * 0.24 + ea + W * 0.055, cy - H * 0.34);
    ctx.fillStyle = '#d09090'; ctx.fill();
  }
  // howling open mouth
  ctx.beginPath(); ctx.ellipse(cx + W * 0.37, cy - H * 0.18, W * 0.03, H * 0.04, 0.4, 0, Math.PI * 2); ctx.fillStyle = '#202020'; ctx.fill();
  eye(ctx, cx + W * 0.26, cy - H * 0.28, 6);
  // nose
  ctx.beginPath(); ctx.arc(cx + W * 0.37, cy - H * 0.215, 6, 0, Math.PI * 2); ctx.fillStyle = '#202030'; ctx.fill();
  // legs
  ctx.fillStyle = '#7888a0';
  for (const lx of [cx - W * 0.11, cx - W * 0.03, cx + W * 0.05, cx + W * 0.13]) {
    ctx.beginPath(); ctx.roundRect(lx - W * 0.025, cy + H * 0.12, W * 0.05, H * 0.19, 6); ctx.fill();
  }
  // howl breath
  ctx.strokeStyle = 'rgba(200,210,230,0.18)'; ctx.lineWidth = 3;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.arc(cx + W * 0.4, cy - H * 0.17, W * 0.03 * i, Math.PI * 1.4, Math.PI * 0.1); ctx.stroke();
  }
}

// ─── PEACOCK ──────────────────────────────────────────────────────────────────

function drawPeacock(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#308898', '#1a5060');
  ground(ctx, W, H, H * 0.75, '#104048');

  // fan feathers
  const fx = W * 0.46, fy = H * 0.52;
  const fanColors = ['#1a8870', '#20a880', '#30b890', '#1a70b0', '#2090c8'];
  for (let i = 0; i < 18; i++) {
    const fa = -Math.PI * 0.9 + (i / 17) * Math.PI * 1.8;
    const fl = H * 0.42;
    ctx.beginPath(); ctx.strokeStyle = fanColors[i % fanColors.length]; ctx.lineWidth = 4;
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(fa) * fl * 0.5, fy + Math.sin(fa) * fl * 0.5);
    const ex = fx + Math.cos(fa) * fl, ey = fy + Math.sin(fa) * fl;
    ctx.lineTo(ex, ey); ctx.stroke();
    // eye spot
    ctx.beginPath(); ctx.arc(ex, ey, 12, 0, Math.PI * 2); ctx.fillStyle = '#1060a0'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fillStyle = '#20c080'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fillStyle = '#101010'; ctx.fill();
  }
  // body
  ctx.beginPath(); ctx.ellipse(fx, fy, W * 0.08, H * 0.12, 0, 0, Math.PI * 2); ctx.fillStyle = '#1878a0'; ctx.fill();
  // neck
  ctx.beginPath(); ctx.strokeStyle = '#1878a0'; ctx.lineWidth = W * 0.045;
  ctx.moveTo(fx, fy - H * 0.1); ctx.lineTo(fx + W * 0.04, fy - H * 0.26); ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(fx + W * 0.05, fy - H * 0.28, W * 0.048, 0, Math.PI * 2); ctx.fillStyle = '#1878a0'; ctx.fill();
  // crest
  ctx.strokeStyle = '#40c080'; ctx.lineWidth = 3;
  for (const [ca, cl] of [[-0.3, 0.06], [0, 0.07], [0.3, 0.06]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(fx + W * 0.05, fy - H * 0.32);
    ctx.lineTo(fx + W * 0.05 + Math.cos(ca - Math.PI / 2) * W * cl, fy - H * 0.32 + Math.sin(ca - Math.PI / 2) * H * cl * 0.8);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(fx + W * 0.05 + Math.cos(ca - Math.PI / 2) * W * cl, fy - H * 0.32 + Math.sin(ca - Math.PI / 2) * H * cl * 0.8, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#40c080'; ctx.fill();
  }
  eye(ctx, fx + W * 0.07, fy - H * 0.29, 5);
  // beak
  ctx.beginPath(); ctx.moveTo(fx + W * 0.095, fy - H * 0.28); ctx.lineTo(fx + W * 0.13, fy - H * 0.275); ctx.lineTo(fx + W * 0.095, fy - H * 0.265);
  ctx.fillStyle = '#e0c040'; ctx.fill();
  // legs
  ctx.strokeStyle = '#186050'; ctx.lineWidth = 5;
  for (const lx of [fx - W * 0.025, fx + W * 0.025]) {
    ctx.beginPath(); ctx.moveTo(lx, fy + H * 0.1); ctx.lineTo(lx, H * 0.75); ctx.stroke();
  }
}

// ─── POLAR BEAR ───────────────────────────────────────────────────────────────

function drawPolarBear(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#c8dcea', '#88a8c8');
  // ice
  const iceg = ctx.createLinearGradient(0, H * 0.72, 0, H);
  iceg.addColorStop(0, '#d8eaf8'); iceg.addColorStop(1, '#a8c8e0');
  ctx.fillStyle = iceg; ctx.fillRect(0, H * 0.72, W, H * 0.28);
  // ice cracks
  ctx.strokeStyle = 'rgba(100,150,200,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.8); ctx.lineTo(W * 0.4, H * 0.72); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W * 0.6, H * 0.75); ctx.lineTo(W * 0.9, H * 0.85); ctx.stroke();
  // aurora hints
  for (const [ac, ay] of [['rgba(100,255,200,0.12)', 0.15], ['rgba(100,180,255,0.1)', 0.25]] as [string, number][]) {
    const ag = ctx.createLinearGradient(0, H * ay - 40, 0, H * ay + 40);
    ag.addColorStop(0, 'transparent'); ag.addColorStop(0.5, ac); ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag; ctx.fillRect(0, H * ay - 40, W, 80);
  }
  const cx = W * 0.5, cy = H * 0.52;
  // shadow
  ctx.beginPath(); ctx.ellipse(cx, H * 0.73, W * 0.2, H * 0.03, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(50,90,140,0.2)'; ctx.fill();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.2, H * 0.19, 0, 0, Math.PI * 2); ctx.fillStyle = '#f4f4f2'; ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx + W * 0.18, cy - H * 0.15, W * 0.125, 0, Math.PI * 2); ctx.fillStyle = '#f0f0ee'; ctx.fill();
  // ears
  for (const ea of [cx + W * 0.1, cx + W * 0.26]) {
    ctx.beginPath(); ctx.arc(ea, cy - H * 0.26, W * 0.04, 0, Math.PI * 2); ctx.fillStyle = '#e8e8e6'; ctx.fill();
    ctx.beginPath(); ctx.arc(ea, cy - H * 0.26, W * 0.022, 0, Math.PI * 2); ctx.fillStyle = '#e0ccd8'; ctx.fill();
  }
  // snout
  ctx.beginPath(); ctx.ellipse(cx + W * 0.28, cy - H * 0.11, W * 0.065, H * 0.055, 0, 0, Math.PI * 2); ctx.fillStyle = '#e8e0e0'; ctx.fill();
  // nose
  ctx.beginPath(); ctx.arc(cx + W * 0.33, cy - H * 0.125, 8, 0, Math.PI * 2); ctx.fillStyle = '#2a2030'; ctx.fill();
  for (const ex of [cx + W * 0.15, cx + W * 0.22]) {
    eye(ctx, ex, cy - H * 0.17, 6);
  }
  // paws
  ctx.fillStyle = '#eceae8';
  for (const [px, py, pr1, pr2] of [
    [cx - W * 0.22, cy + H * 0.06, W * 0.075, H * 0.06],
    [cx + W * 0.22, cy + H * 0.06, W * 0.075, H * 0.06],
  ] as [number, number, number, number][]) {
    ctx.beginPath(); ctx.ellipse(px, py, pr1, pr2, 0, 0, Math.PI * 2); ctx.fill();
  }
  // front paws on ice
  ctx.fillStyle = '#f0f0ee';
  for (const px of [cx - W * 0.1, cx + W * 0.08]) {
    ctx.beginPath(); ctx.ellipse(px, H * 0.735, W * 0.065, H * 0.025, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// ─── RED PANDA ────────────────────────────────────────────────────────────────

function drawRedPanda(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#c05030', '#782818');
  // tree branch
  ctx.strokeStyle = '#4a2808'; ctx.lineWidth = W * 0.045;
  ctx.beginPath(); ctx.moveTo(0, H * 0.62); ctx.bezierCurveTo(W * 0.4, H * 0.55, W * 0.7, H * 0.6, W, H * 0.52); ctx.stroke();
  // leaves
  ctx.fillStyle = 'rgba(30,90,20,0.4)';
  for (const [lx, ly] of [[W*0.1,H*0.52],[W*0.25,H*0.48],[W*0.55,H*0.5],[W*0.8,H*0.44],[W*0.95,H*0.42]] as [number,number][]) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(-0.3);
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 35, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const cx = W * 0.48, cy = H * 0.43;
  // ringed tail
  const tailColors = ['#b84020', '#f0ece0'];
  for (let ti = 0; ti < 8; ti++) {
    const t = ti / 7;
    const tx = cx - W * 0.08 - W * 0.28 * t;
    const ty = cy + H * 0.1 + H * 0.08 * Math.sin(t * Math.PI * 2.5);
    const tr = W * 0.04 - W * 0.005 * ti;
    ctx.beginPath(); ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fillStyle = tailColors[ti % 2]; ctx.fill();
  }
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.1, H * 0.13, 0, 0, Math.PI * 2); ctx.fillStyle = '#b83820'; ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(cx + W * 0.03, cy - H * 0.14, W * 0.085, 0, Math.PI * 2); ctx.fillStyle = '#c04028'; ctx.fill();
  // face mask
  ctx.beginPath(); ctx.ellipse(cx + W * 0.03, cy - H * 0.13, W * 0.06, H * 0.055, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0ece0'; ctx.fill();
  // cheek patches
  for (const cpx of [cx - W * 0.03, cx + W * 0.09]) {
    ctx.beginPath(); ctx.arc(cpx, cy - H * 0.115, W * 0.025, 0, Math.PI * 2); ctx.fillStyle = '#f0ece0'; ctx.fill();
  }
  // tear markings
  ctx.strokeStyle = '#301008'; ctx.lineWidth = 3;
  for (const tx of [cx - W * 0.015, cx + W * 0.065]) {
    ctx.beginPath(); ctx.moveTo(tx, cy - H * 0.145); ctx.lineTo(tx, cy - H * 0.11); ctx.stroke();
  }
  // ears
  for (const [ea, flip] of [[-W * 0.07, -1], [W * 0.07, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.arc(cx + W * 0.03 + ea, cy - H * 0.22, W * 0.035, 0, Math.PI * 2); ctx.fillStyle = '#c04028'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx + W * 0.03 + ea, cy - H * 0.22, W * 0.018, 0, Math.PI * 2); ctx.fillStyle = '#f0ece0'; ctx.fill();
  }
  for (const ex of [cx - W * 0.015, cx + W * 0.065]) {
    eye(ctx, ex, cy - H * 0.145, 6);
  }
  // nose
  ctx.beginPath(); ctx.arc(cx + W * 0.025, cy - H * 0.105, 6, 0, Math.PI * 2); ctx.fillStyle = '#301010'; ctx.fill();
  // paws on branch
  ctx.fillStyle = '#b83820';
  for (const px of [cx - W * 0.07, cx + W * 0.07]) {
    ctx.beginPath(); ctx.ellipse(px, H * 0.615, W * 0.04, H * 0.025, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// ─── CHAMELEON ────────────────────────────────────────────────────────────────

function drawChameleon(ctx: CanvasRenderingContext2D, W: number, H: number) {
  gradBg(ctx, W, H, '#78c030', '#489010');
  // leaves
  ctx.fillStyle = 'rgba(30,100,10,0.45)';
  for (const [lx, ly, la] of [[W*0.08,H*0.2,0.3],[W*0.92,H*0.15,-0.4],[W*0.15,H*0.7,0.5],[W*0.85,H*0.65,-0.3],[W*0.5,H*0.1,0]] as [number,number,number][]) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(la);
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(20,80,5,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(0, 55); ctx.stroke();
    ctx.restore();
  }
  // branch
  ctx.strokeStyle = '#5a3808'; ctx.lineWidth = W * 0.035;
  ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.55); ctx.bezierCurveTo(W * 0.3, H * 0.48, W * 0.7, H * 0.52, W * 0.95, H * 0.45); ctx.stroke();

  const cx = W * 0.5, cy = H * 0.42;
  // curled tail
  ctx.beginPath(); ctx.strokeStyle = '#58a018'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.moveTo(cx - W * 0.06, cy + H * 0.1);
  ctx.bezierCurveTo(cx - W * 0.22, cy + H * 0.16, cx - W * 0.3, cy + H * 0.06, cx - W * 0.28, cy - H * 0.04);
  ctx.bezierCurveTo(cx - W * 0.26, cy - H * 0.1, cx - W * 0.2, cy - H * 0.1, cx - W * 0.16, cy - H * 0.06); ctx.stroke();
  // body
  ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.12, H * 0.1, 0, 0, Math.PI * 2); ctx.fillStyle = '#60b820'; ctx.fill();
  // body ridge
  ctx.strokeStyle = '#48a010'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx - W * 0.1, cy - H * 0.04);
  for (let i = 0; i < 6; i++) {
    const rx = cx - W * 0.1 + (i / 5) * W * 0.2;
    ctx.lineTo(rx, cy - H * 0.1 - H * 0.02 * Math.sin((i / 5) * Math.PI));
  }
  ctx.lineTo(cx + W * 0.1, cy - H * 0.04); ctx.stroke();
  // body stripes
  ctx.strokeStyle = 'rgba(40,120,0,0.4)'; ctx.lineWidth = 3;
  for (const sx of [cx - W * 0.06, cx - W * 0.01, cx + W * 0.04, cx + W * 0.09]) {
    ctx.beginPath(); ctx.moveTo(sx, cy - H * 0.09); ctx.lineTo(sx + W * 0.01, cy + H * 0.09); ctx.stroke();
  }
  // head
  ctx.beginPath(); ctx.ellipse(cx + W * 0.17, cy - H * 0.02, W * 0.09, H * 0.075, 0.2, 0, Math.PI * 2); ctx.fillStyle = '#60b820'; ctx.fill();
  // casque (head fin)
  ctx.beginPath(); ctx.moveTo(cx + W * 0.12, cy - H * 0.09);
  ctx.lineTo(cx + W * 0.15, cy - H * 0.18); ctx.lineTo(cx + W * 0.28, cy - H * 0.09); ctx.fillStyle = '#50a818'; ctx.fill();
  // turret eye
  ctx.beginPath(); ctx.arc(cx + W * 0.24, cy - H * 0.03, W * 0.03, 0, Math.PI * 2); ctx.fillStyle = '#f0f0f0'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + W * 0.24, cy - H * 0.03, W * 0.018, 0, Math.PI * 2); ctx.fillStyle = '#e8c000'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + W * 0.245, cy - H * 0.032, W * 0.01, 0, Math.PI * 2); ctx.fillStyle = '#101010'; ctx.fill();
  // tongue
  ctx.beginPath(); ctx.strokeStyle = '#e04060'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.moveTo(cx + W * 0.26, cy + H * 0.01); ctx.lineTo(cx + W * 0.36, cy + H * 0.03); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + W * 0.36, cy + H * 0.03, 6, 0, Math.PI * 2); ctx.fillStyle = '#e04060'; ctx.fill();
  // feet
  ctx.strokeStyle = '#408010'; ctx.lineWidth = 6;
  for (const [fx2, fy2] of [[cx - W*0.08, cy+H*0.08],[cx + W*0.05, cy+H*0.08]] as [number,number][]) {
    ctx.beginPath(); ctx.moveTo(fx2, fy2); ctx.lineTo(fx2, H * 0.55); ctx.stroke();
  }
}
