// ─── Presets ──────────────────────────────────────────────────────────────────

export const COLOR_GRADE_PRESETS = [
  {
    id: 'white',
    label: '白',
    hex: '#D0E8FF',
    hint: '儚い · 透明感',
    // Soft cool-white — simulates a bright studio softbox or window light
  },
  {
    id: 'pink',
    label: 'ピンク',
    hex: '#FF6B9D',
    hint: '甘い · ロマンチック',
    // Candy pink — boudoir / idol photography feel
  },
  {
    id: 'purple',
    label: '紫',
    hex: '#7C3AED',
    hint: '色っぽい · 神秘',
    // Deep violet — sensual / mysterious mood
  },
  {
    id: 'dark',
    label: 'ダーク',
    hex: '#0F172A',
    hint: 'クール · 影',
    // Dark slate-navy — low-key cinematic shadow
  },
] as const;

export type ColorGradePresetId = (typeof COLOR_GRADE_PRESETS)[number]['id'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// ─── Core effect ──────────────────────────────────────────────────────────────

/**
 * Apply tinted color grading to an existing canvas context (in-place).
 *
 * ### Lighting mode  (`'lighting'`)
 * Blend weight is proportional to pixel luminance — bright areas (skin
 * highlights, hair, fabric) absorb the target color, shadows stay neutral.
 * This replicates the physics of a colored studio/room light hitting surfaces.
 *
 * ### Filter mode  (`'filter'`)
 * Uniform flat overlay — every pixel blends toward the target color by the
 * same proportion.  Classic photo-filter or Instagram-style tint.
 *
 * @param strength  0–100; practical range 10–50 for natural results
 */
export function applyColorGrade(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hex: string,
  strength: number,       // 0–100
  mode: 'lighting' | 'filter'
): void {
  if (strength <= 0) return;

  const { r: tr, g: tg, b: tb } = hexToRgb(hex);
  const t = strength / 100;

  const imgData = ctx.getImageData(0, 0, w, h);
  const { data } = imgData;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    let blend: number;

    if (mode === 'lighting') {
      // Luminance-weighted: highlights absorb the most color (physics of light).
      // ITU-R BT.601 luma coefficients give perceptually correct brightness.
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      blend = luma * t;
    } else {
      // Uniform flat overlay (all pixels shift by the same ratio)
      blend = t * 0.75; // cap at 75% so the underlying image stays readable
    }

    data[i]     = r + (tr - r) * blend;
    data[i + 1] = g + (tg - g) * blend;
    data[i + 2] = b + (tb - b) * blend;
  }

  ctx.putImageData(imgData, 0, 0);
}
