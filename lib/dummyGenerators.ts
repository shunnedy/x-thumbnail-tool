import { OUTPUT_SIZE } from './canvasUtils';

export type DummyType =
  | 'sunset' | 'ocean' | 'forest' | 'mountain' | 'desert'
  | 'flowers' | 'aurora' | 'city' | 'bamboo' | 'clouds';

export const ALL_DUMMY_TYPES: DummyType[] = [
  'sunset', 'ocean', 'forest', 'mountain', 'desert',
  'flowers', 'aurora', 'city', 'bamboo', 'clouds',
];

const cache = new Map<DummyType, HTMLCanvasElement>();

export function getDummy(type: DummyType): HTMLCanvasElement {
  if (cache.has(type)) return cache.get(type)!;
  const canvas = generateDummy(type);
  cache.set(type, canvas);
  return canvas;
}

/** 4 segments × 4 unique dummies each (no intra-segment duplicates) */
export function assignDummies(): DummyType[][] {
  const shuffled = [...ALL_DUMMY_TYPES].sort(() => Math.random() - 0.5);
  // 10 types → enough for 4 segments × 4 = 16 (wrap with 6 extra, avoid dupes per segment)
  const extended = [...shuffled, ...shuffled.slice(0, 6)];
  return [
    [extended[0], extended[1], extended[2],  extended[3]],
    [extended[4], extended[5], extended[6],  extended[7]],
    [extended[8], extended[9], extended[0],  extended[1]],
    [extended[2], extended[3], extended[4],  extended[5]],
  ];
}

// ─── generators ──────────────────────────────────────────────────────────

function generateDummy(type: DummyType): HTMLCanvasElement {
  const S = OUTPUT_SIZE;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d')!;
  switch (type) {
    case 'sunset':   drawSunset(ctx, S);   break;
    case 'ocean':    drawOcean(ctx, S);    break;
    case 'forest':   drawForest(ctx, S);   break;
    case 'mountain': drawMountain(ctx, S); break;
    case 'desert':   drawDesert(ctx, S);   break;
    case 'flowers':  drawFlowers(ctx, S);  break;
    case 'aurora':   drawAurora(ctx, S);   break;
    case 'city':     drawCity(ctx, S);     break;
    case 'bamboo':   drawBamboo(ctx, S);   break;
    case 'clouds':   drawClouds(ctx, S);   break;
  }
  return c;
}

// ─── scene implementations ────────────────────────────────────────────────

function drawSunset(ctx: CanvasRenderingContext2D, S: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, S * 0.72);
  sky.addColorStop(0,    '#1a0535');
  sky.addColorStop(0.35, '#8b1a1a');
  sky.addColorStop(0.65, '#d4580a');
  sky.addColorStop(1,    '#f0a500');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S * 0.72);

  // Sun glow
  const glow = ctx.createRadialGradient(S/2, S*0.72, 0, S/2, S*0.72, S*0.42);
  glow.addColorStop(0,   'rgba(255,230,80,0.95)');
  glow.addColorStop(0.25,'rgba(255,150,40,0.55)');
  glow.addColorStop(1,   'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S);

  // Sun disc
  ctx.beginPath(); ctx.arc(S/2, S*0.72, S*0.055, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,240,120,0.98)'; ctx.fill();

  // Ground
  const gnd = ctx.createLinearGradient(0, S*0.72, 0, S);
  gnd.addColorStop(0, '#1c0800'); gnd.addColorStop(1, '#080300');
  ctx.fillStyle = gnd; ctx.fillRect(0, S*0.72, S, S*0.28);

  // Horizon silhouette hills
  ctx.fillStyle = '#130500';
  ctx.beginPath(); ctx.moveTo(0, S*0.78);
  ctx.bezierCurveTo(S*0.15, S*0.65, S*0.32, S*0.73, S*0.5, S*0.68);
  ctx.bezierCurveTo(S*0.68, S*0.63, S*0.82, S*0.72, S, S*0.76);
  ctx.lineTo(S, S); ctx.lineTo(0, S); ctx.closePath(); ctx.fill();
}

function drawOcean(ctx: CanvasRenderingContext2D, S: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, S*0.42);
  sky.addColorStop(0, '#2c6fad'); sky.addColorStop(1, '#a8d8ea');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S*0.42);

  // Water
  const sea = ctx.createLinearGradient(0, S*0.42, 0, S);
  sea.addColorStop(0, '#1a6699'); sea.addColorStop(1, '#0d3d5c');
  ctx.fillStyle = sea; ctx.fillRect(0, S*0.42, S, S*0.58);

  // Horizon shimmer
  const shim = ctx.createLinearGradient(0, S*0.41, 0, S*0.44);
  shim.addColorStop(0, 'rgba(255,255,255,0.5)'); shim.addColorStop(1, 'transparent');
  ctx.fillStyle = shim; ctx.fillRect(0, S*0.41, S, S*0.04);

  // Wave lines
  for (let i = 0; i < 14; i++) {
    const y = S*0.47 + i * S*0.038;
    const alpha = 0.08 + i*0.005;
    ctx.strokeStyle = `rgba(200,230,255,${alpha})`;
    ctx.lineWidth = 1 + i*0.12;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x < S; x += 60) {
      ctx.quadraticCurveTo(x+30, y - 4 - i*0.5, x+60, y);
    }
    ctx.stroke();
  }

  // Sun reflection
  const ref = ctx.createLinearGradient(S*0.4, S*0.42, S*0.6, S);
  ref.addColorStop(0, 'rgba(255,230,120,0.35)'); ref.addColorStop(1, 'transparent');
  ctx.fillStyle = ref; ctx.fillRect(S*0.4, S*0.42, S*0.2, S*0.58);
}

function drawForest(ctx: CanvasRenderingContext2D, S: number) {
  // Sky peek
  const sky = ctx.createLinearGradient(0, 0, 0, S*0.25);
  sky.addColorStop(0, '#2e5e3a'); sky.addColorStop(1, '#1a3d1f');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S*0.25);

  // Background (deep green)
  ctx.fillStyle = '#0e2114'; ctx.fillRect(0, S*0.2, S, S*0.8);

  // Far trees (lighter layer)
  ctx.fillStyle = '#1a4025';
  for (let i = 0; i < 12; i++) {
    const x = (i * S/10) + Math.sin(i*2.3)*20;
    const h = S*0.38 + Math.sin(i*1.7)*S*0.06;
    drawTree(ctx, x, S*0.55, S*0.04, h);
  }

  // Near trees (dark layer)
  ctx.fillStyle = '#0d1f0f';
  for (let i = 0; i < 9; i++) {
    const x = (i * S/7.5) - S*0.05;
    const h = S*0.55 + Math.sin(i*2.1)*S*0.08;
    drawTree(ctx, x, S, S*0.06, h);
  }

  // Ground (dark)
  const gnd = ctx.createLinearGradient(0, S*0.85, 0, S);
  gnd.addColorStop(0, '#0a1a0c'); gnd.addColorStop(1, '#040c05');
  ctx.fillStyle = gnd; ctx.fillRect(0, S*0.85, S, S*0.15);

  // Dappled light
  for (let i = 0; i < 25; i++) {
    const x = Math.random()*S, y = Math.random()*S*0.8;
    const gl = ctx.createRadialGradient(x,y,0, x,y, 30+Math.random()*40);
    gl.addColorStop(0, 'rgba(180,230,150,0.12)'); gl.addColorStop(1, 'transparent');
    ctx.fillStyle = gl; ctx.fillRect(0,0,S,S);
  }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x - w, baseY);
  ctx.lineTo(x, baseY - h);
  ctx.lineTo(x + w, baseY);
  ctx.closePath(); ctx.fill();
}

function drawMountain(ctx: CanvasRenderingContext2D, S: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, S*0.55);
  sky.addColorStop(0, '#1e3a5f'); sky.addColorStop(1, '#6fa8d8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S*0.55);

  // Far mountains
  const mountains = [
    { col: '#374a5c', peaks: [[0.05,0.6],[0.2,0.3],[0.38,0.5],[0.55,0.28],[0.7,0.44],[0.85,0.32],[1.0,0.58]] },
    { col: '#2c3d52', peaks: [[0,0.65],[0.12,0.38],[0.3,0.55],[0.48,0.35],[0.65,0.52],[0.8,0.4],[0.95,0.6],[1,0.62]] },
    { col: '#1e2d40', peaks: [[0,0.7],[0.15,0.45],[0.32,0.6],[0.5,0.42],[0.68,0.58],[0.83,0.48],[1,0.7]] },
  ];
  for (const m of mountains) {
    ctx.fillStyle = m.col;
    ctx.beginPath(); ctx.moveTo(0, S);
    ctx.lineTo(0, m.peaks[0][1]*S);
    for (let i = 1; i < m.peaks.length; i++) {
      const [x,y] = m.peaks[i];
      const [px, py] = m.peaks[i-1];
      ctx.quadraticCurveTo((px+x)/2*S, (py+y)/2*S - S*0.05, x*S, y*S);
    }
    ctx.lineTo(S, S); ctx.closePath(); ctx.fill();
  }

  // Snow caps
  ctx.fillStyle = 'rgba(240,245,255,0.85)';
  [[0.2,0.3],[0.55,0.28],[0.85,0.32]].forEach(([x,y]) => {
    ctx.beginPath();
    ctx.moveTo(x*S, y*S);
    ctx.lineTo((x-0.05)*S, (y+0.08)*S);
    ctx.lineTo((x+0.05)*S, (y+0.08)*S);
    ctx.closePath(); ctx.fill();
  });
}

function drawDesert(ctx: CanvasRenderingContext2D, S: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, S*0.45);
  sky.addColorStop(0, '#1a4a7a'); sky.addColorStop(0.6, '#5fa8d8'); sky.addColorStop(1, '#f2c27a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S*0.45);

  // Sun
  ctx.beginPath(); ctx.arc(S*0.72, S*0.18, S*0.05, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,245,180,0.97)'; ctx.fill();

  // Sand
  const sand = ctx.createLinearGradient(0, S*0.45, 0, S);
  sand.addColorStop(0, '#d4924a'); sand.addColorStop(0.5, '#c07830'); sand.addColorStop(1, '#8a5015');
  ctx.fillStyle = sand; ctx.fillRect(0, S*0.45, S, S*0.55);

  // Dunes
  ctx.fillStyle = '#b8662a';
  ctx.beginPath(); ctx.moveTo(0, S*0.62);
  ctx.bezierCurveTo(S*0.25, S*0.45, S*0.4, S*0.58, S*0.65, S*0.52);
  ctx.bezierCurveTo(S*0.8, S*0.47, S*0.9, S*0.55, S, S*0.6);
  ctx.lineTo(S,S); ctx.lineTo(0,S); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#9e5420';
  ctx.beginPath(); ctx.moveTo(0, S*0.8);
  ctx.bezierCurveTo(S*0.2, S*0.7, S*0.45, S*0.78, S*0.6, S*0.72);
  ctx.bezierCurveTo(S*0.75, S*0.67, S*0.9, S*0.76, S, S*0.8);
  ctx.lineTo(S,S); ctx.lineTo(0,S); ctx.closePath(); ctx.fill();

  // Heat shimmer at horizon
  const shim = ctx.createLinearGradient(0, S*0.43, 0, S*0.52);
  shim.addColorStop(0, 'transparent'); shim.addColorStop(0.5, 'rgba(255,200,100,0.2)'); shim.addColorStop(1, 'transparent');
  ctx.fillStyle = shim; ctx.fillRect(0, S*0.43, S, S*0.1);
}

function drawFlowers(ctx: CanvasRenderingContext2D, S: number) {
  // Grass background
  const bg = ctx.createLinearGradient(0, 0, 0, S);
  bg.addColorStop(0, '#4a8a3c'); bg.addColorStop(1, '#2a5520');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);

  // Grass texture
  for (let i = 0; i < 600; i++) {
    const x = Math.random()*S, y = Math.random()*S;
    const h = 8+Math.random()*18;
    ctx.strokeStyle = `rgba(${60+Math.random()*40},${100+Math.random()*50},30,0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x+(Math.random()-0.5)*10, y-h/2, x+(Math.random()-0.5)*8, y-h);
    ctx.stroke();
  }

  // Flowers
  const colors = ['#ff6b6b','#ffd93d','#ff9ff3','#a29bfe','#fd79a8','#fdcb6e','#e17055','#74b9ff'];
  for (let i = 0; i < 80; i++) {
    const x = Math.random()*S, y = S*0.1 + Math.random()*S*0.85;
    const r = 6+Math.random()*16;
    const col = colors[Math.floor(Math.random()*colors.length)];

    // Stem
    ctx.strokeStyle = '#3a6e2a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y+r); ctx.lineTo(x, y+r+12+Math.random()*20); ctx.stroke();

    // Petals
    for (let p = 0; p < 6; p++) {
      const angle = (p/6)*Math.PI*2;
      ctx.beginPath();
      ctx.ellipse(x+Math.cos(angle)*r*0.7, y+Math.sin(angle)*r*0.7, r*0.55, r*0.35, angle, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
    }
    // Center
    ctx.beginPath(); ctx.arc(x, y, r*0.38, 0, Math.PI*2);
    ctx.fillStyle = '#fff9c4'; ctx.fill();
  }
}

function drawAurora(ctx: CanvasRenderingContext2D, S: number) {
  // Night sky
  const sky = ctx.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#020810'); sky.addColorStop(0.7, '#041520'); sky.addColorStop(1, '#030e18');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);

  // Stars
  for (let i = 0; i < 400; i++) {
    const x = Math.random()*S, y = Math.random()*S*0.85;
    const r = Math.random()*1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${0.3+Math.random()*0.7})`; ctx.fill();
  }

  // Aurora bands
  const bands = [
    { col1: '#00ff7f', col2: '#00cc5a', y: 0.15, spread: 0.3 },
    { col1: '#00e5ff', col2: '#007bff', y: 0.25, spread: 0.22 },
    { col1: '#9c27b0', col2: '#673ab7', y: 0.35, spread: 0.18 },
  ];
  for (const b of bands) {
    // wavy band
    for (let x = 0; x <= S; x += 4) {
      const wave = Math.sin(x/S*Math.PI*3 + 1.2)*S*0.06;
      const wave2 = Math.cos(x/S*Math.PI*2.5)*S*0.04;
      const cy = b.y*S + wave + wave2;
      const grad = ctx.createLinearGradient(x, cy-S*b.spread, x, cy+S*b.spread);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, b.col1 + '55');
      grad.addColorStop(0.5, b.col2 + '88');
      grad.addColorStop(0.6, b.col1 + '55');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(x, cy-S*b.spread, 4, S*b.spread*2);
    }
  }

  // Ground (dark terrain)
  ctx.fillStyle = '#010508';
  ctx.beginPath(); ctx.moveTo(0, S*0.88);
  ctx.bezierCurveTo(S*0.2, S*0.82, S*0.5, S*0.9, S*0.7, S*0.84);
  ctx.bezierCurveTo(S*0.85, S*0.79, S*0.95, S*0.86, S, S*0.88);
  ctx.lineTo(S,S); ctx.lineTo(0,S); ctx.closePath(); ctx.fill();
}

function drawCity(ctx: CanvasRenderingContext2D, S: number) {
  // Night sky with city glow
  const sky = ctx.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#050505'); sky.addColorStop(0.6, '#0a0c12'); sky.addColorStop(1, '#1a1520');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);

  // City glow on horizon
  const glow = ctx.createRadialGradient(S/2, S*0.72, 0, S/2, S*0.72, S*0.55);
  glow.addColorStop(0, 'rgba(255,140,0,0.18)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S);

  // Stars
  for (let i = 0; i < 200; i++) {
    const x = Math.random()*S, y = Math.random()*S*0.6;
    ctx.beginPath(); ctx.arc(x, y, Math.random()*1.2, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${0.2+Math.random()*0.5})`; ctx.fill();
  }

  // Buildings silhouettes
  const buildingConfigs = [
    {x:0,w:55,h:0.35},{x:55,w:40,h:0.5},{x:90,w:65,h:0.42},{x:150,w:30,h:0.6},
    {x:178,w:50,h:0.38},{x:224,w:80,h:0.55},{x:300,w:45,h:0.45},{x:342,w:70,h:0.65},
    {x:408,w:35,h:0.4},{x:440,w:90,h:0.58},{x:526,w:55,h:0.35},{x:577,w:40,h:0.48},
    {x:614,w:75,h:0.52},{x:685,w:50,h:0.44},{x:732,w:65,h:0.7},{x:793,w:45,h:0.38},
    {x:835,w:80,h:0.56},{x:912,w:35,h:0.42},{x:944,w:60,h:0.62},{x:1000,w:80,h:0.4},
  ].map(b => ({...b, h: b.h * S}));

  ctx.fillStyle = '#080808';
  for (const b of buildingConfigs) {
    ctx.fillRect(b.x, S - b.h, b.w, b.h);
    // Windows
    for (let wy = S - b.h + 8; wy < S - 12; wy += 18) {
      for (let wx = b.x + 5; wx < b.x + b.w - 8; wx += 12) {
        if (Math.random() > 0.45) {
          ctx.fillStyle = Math.random() > 0.7 ? 'rgba(255,230,150,0.9)' : 'rgba(200,220,255,0.75)';
          ctx.fillRect(wx, wy, 7, 10);
          ctx.fillStyle = '#080808';
        }
      }
    }
  }
}

function drawBamboo(ctx: CanvasRenderingContext2D, S: number) {
  // Background
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, '#c8ddb5'); bg.addColorStop(1, '#a5c48a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);

  // Light rays
  for (let i = 0; i < 5; i++) {
    const x = (i+0.5) * S/5;
    const ray = ctx.createLinearGradient(x-30, 0, x+30, S);
    ray.addColorStop(0, 'rgba(255,255,220,0.18)'); ray.addColorStop(1, 'transparent');
    ctx.fillStyle = ray; ctx.fillRect(0, 0, S, S);
  }

  // Bamboo stalks
  const stalks = Array.from({length: 14}, (_, i) => ({
    x: i * S/12 + Math.sin(i*1.4)*15,
    w: 20+Math.random()*18,
    hue: 90+Math.random()*30,
    light: 25+Math.random()*15,
  }));

  for (const stalk of stalks) {
    // Main stalk
    const sg = ctx.createLinearGradient(stalk.x, 0, stalk.x+stalk.w, 0);
    sg.addColorStop(0, `hsl(${stalk.hue}, 60%, ${stalk.light}%)`);
    sg.addColorStop(0.4, `hsl(${stalk.hue}, 55%, ${stalk.light+12}%)`);
    sg.addColorStop(1, `hsl(${stalk.hue}, 58%, ${stalk.light-4}%)`);
    ctx.fillStyle = sg; ctx.fillRect(stalk.x, 0, stalk.w, S);

    // Nodes
    for (let y = 80; y < S; y += 90+Math.random()*40) {
      ctx.fillStyle = `hsl(${stalk.hue}, 50%, ${stalk.light-8}%)`;
      ctx.fillRect(stalk.x-2, y-3, stalk.w+4, 6);
    }
  }

  // Leaves
  ctx.strokeStyle = 'rgba(60,100,20,0.55)'; ctx.lineWidth = 2;
  for (let i = 0; i < 50; i++) {
    const x = Math.random()*S, y = Math.random()*S;
    const len = 40+Math.random()*60;
    const angle = (Math.random()-0.5)*Math.PI*0.7;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len);
    ctx.stroke();
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, S: number) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#4a90d9'); sky.addColorStop(0.6, '#8ec3f0'); sky.addColorStop(1, '#c8e6f8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);

  // Sun
  const sunGrad = ctx.createRadialGradient(S*0.15, S*0.12, 0, S*0.15, S*0.12, S*0.1);
  sunGrad.addColorStop(0, 'rgba(255,255,200,1)'); sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, S, S);

  // Clouds
  const cloudDefs = [
    {x:0.15, y:0.12, scale:1.4},
    {x:0.52, y:0.08, scale:1.1},
    {x:0.78, y:0.18, scale:0.9},
    {x:0.32, y:0.28, scale:1.2},
    {x:0.65, y:0.35, scale:1.0},
    {x:0.05, y:0.42, scale:0.8},
    {x:0.88, y:0.5,  scale:1.1},
  ];
  for (const cd of cloudDefs) {
    drawCloud(ctx, cd.x*S, cd.y*S, cd.scale);
  }

  // Light haze at bottom
  const haze = ctx.createLinearGradient(0, S*0.7, 0, S);
  haze.addColorStop(0, 'transparent'); haze.addColorStop(1, 'rgba(255,255,255,0.35)');
  ctx.fillStyle = haze; ctx.fillRect(0, S*0.7, S, S*0.3);
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  const blobs = [
    {dx:0, dy:0, r:55},{dx:-50, dy:20, r:45},{dx:50, dy:20, r:48},
    {dx:-25, dy:38, r:50},{dx:28, dy:35, r:52},{dx:0, dy:48, r:42},
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (const b of blobs) {
    ctx.beginPath();
    ctx.arc(cx + b.dx*scale, cy + b.dy*scale, b.r*scale, 0, Math.PI*2);
    ctx.fill();
  }
  // Soft shadow
  const sh = ctx.createRadialGradient(cx, cy+55*scale, 0, cx, cy+55*scale, 70*scale);
  sh.addColorStop(0, 'rgba(160,190,220,0.3)'); sh.addColorStop(1, 'transparent');
  ctx.fillStyle = sh; ctx.fillRect(cx-80*scale, cy, 160*scale, 80*scale);
}
