import type { FilterConfig } from '@/lib/types';
import { applyAnimalContext } from '@/lib/animalContextFilter';
import { applyColorGrade } from '@/lib/colorGrade';

export function isFilterActive(config: FilterConfig): boolean {
  return (
    config.grainIntensity !== 0 ||
    config.colorTemp !== 0 ||
    config.saturation !== 0 ||
    config.edgeSoftening !== 0 ||
    config.animalContextEnabled ||
    config.colorGradeEnabled
  );
}

/**
 * Apply aesthetic filters to a source canvas and return a new canvas.
 * The source canvas is not modified.
 * @param animalTargetColor - Dominant color averaged from assigned dummy photos;
 *   required for the Animal Context Filter (color harmony + fur texture).
 */
export function applyFilters(
  source: HTMLCanvasElement,
  config: FilterConfig,
  animalTargetColor?: { r: number; g: number; b: number }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0);

  const { grainIntensity, colorTemp, saturation, edgeSoftening } = config;

  // Pixel-level pass: grain + color temperature + saturation
  if (grainIntensity !== 0 || colorTemp !== 0 || saturation !== 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyPixelPass(imageData.data, grainIntensity, colorTemp, saturation);
    ctx.putImageData(imageData, 0, 0);
  }

  // Edge vignette (canvas gradient pass)
  if (edgeSoftening > 0) {
    drawEdgeVignette(ctx, canvas.width, canvas.height, edgeSoftening);
  }

  // Animal Context Filter (color harmony + fur texture overlay)
  if (config.animalContextEnabled && animalTargetColor) {
    applyAnimalContext(ctx, canvas.width, canvas.height, animalTargetColor, config.animalContextStrength);
  }

  // Color grade (tinted room lighting / flat filter)
  if (config.colorGradeEnabled) {
    applyColorGrade(ctx, canvas.width, canvas.height, config.colorGradeColor, config.colorGradeStrength, config.colorGradeMode);
  }

  return canvas;
}

function applyPixelPass(
  data: Uint8ClampedArray,
  grainIntensity: number,
  colorTemp: number,
  saturation: number
): void {
  // Grain amplitude: max ~55 luminance units at intensity=100
  const grainAmp = grainIntensity * 0.55;

  // Color temperature: warm(+) → R↑ B↓, cool(-) → B↑ R↓
  const tempR = colorTemp * 0.30;   // max ±30 to red channel
  const tempB = -colorTemp * 0.22;  // max ±22 to blue channel

  // Saturation factor: 0.0 = greyscale, 1.0 = original, 2.0 = double
  const satFactor = 1 + saturation / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Saturation — preserve perceived luma (ITU-R BT.601 weights)
    if (saturation !== 0) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      r = luma + (r - luma) * satFactor;
      g = luma + (g - luma) * satFactor;
      b = luma + (b - luma) * satFactor;
    }

    // Color temperature shift
    if (colorTemp !== 0) {
      r += tempR;
      b += tempB;
    }

    // Monochromatic film grain (same noise on all channels = neutral grain,
    // preserves hue while adding luminance texture)
    if (grainIntensity > 0) {
      const noise = (Math.random() * 2 - 1) * grainAmp;
      r += noise;
      g += noise;
      b += noise;
    }

    // Clamp without Math.min/max for performance
    data[i]     = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    // alpha channel [i+3] is left unchanged
  }
}

function drawEdgeVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number
): void {
  const edgeW = Math.round((strength / 100) * 100); // 0–100px
  const alpha = (strength / 100) * 0.40;            // 0–0.40 opacity

  // Each entry: [gradX0, gradY0, gradX1, gradY1, rectX, rectY, rectW, rectH]
  const sides: [number, number, number, number, number, number, number, number][] = [
    [0, 0, 0, edgeW,         0, 0,         w, edgeW],  // top
    [0, h - edgeW, 0, h,     0, h - edgeW, w, edgeW],  // bottom
    [0, 0, edgeW, 0,         0, 0,     edgeW, h],       // left
    [w - edgeW, 0, w, 0,     w - edgeW, 0, edgeW, h],  // right
  ];

  for (const [gx0, gy0, gx1, gy1, rx, ry, rw, rh] of sides) {
    const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(rx, ry, rw, rh);
  }
}
