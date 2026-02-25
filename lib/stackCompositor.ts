import { getDummy, type DummyType } from './dummyGenerators';
import { OUTPUT_W, OUTPUT_H, copyCanvas } from './canvasUtils';
import type { MosaicBlock } from './types';

/**
 * Builds a 1280×(720*layers) stack canvas for any odd layer count (3, 5, 7, 9, …).
 *
 * Layout (example with 5 layers):
 *   above[0] (y=0)    → dummy
 *   above[1] (y=720)  → dummy
 *   MAIN     (y=1440) → main segment (mosaics baked)
 *   below[0] (y=2160) → dummy
 *   below[1] (y=2880) → dummy
 *
 * X shows the center 16:9 crop → always hits the MAIN layer for any odd N.
 *
 * dummies layout: [above0, above1, above2, above3, below0, below1, below2, below3]
 * Uses first (layers-1)/2 from each half.
 */
export function buildStack(
  main: HTMLCanvasElement,
  dummies: DummyType[],
  mosaics: MosaicBlock[] = [],
  layers = 5
): HTMLCanvasElement {
  const W = OUTPUT_W;
  const H = OUTPUT_H;
  const half = (layers - 1) / 2; // dummies on each side

  // Apply mosaics to a copy of main (keep processedSegments clean)
  let mainCanvas = main;
  if (mosaics.length > 0) {
    mainCanvas = copyCanvas(main);
    const ctx = mainCanvas.getContext('2d')!;
    for (const block of mosaics) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(block.x * W, block.y * H, block.w * W, block.h * H);
      ctx.restore();
    }
  }

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H * layers;
  const ctx = out.getContext('2d')!;

  // Above dummies: indices 0..half-1
  for (let i = 0; i < half; i++) {
    ctx.drawImage(getDummy(dummies[i]), 0, H * i, W, H);
  }
  // Main layer at center
  ctx.drawImage(mainCanvas, 0, H * half, W, H);
  // Below dummies: indices 4..4+half-1
  for (let i = 0; i < half; i++) {
    ctx.drawImage(getDummy(dummies[4 + i]), 0, H * (half + 1 + i), W, H);
  }

  return out;
}

/** @deprecated use buildStack */
export const buildPentaStack = (
  main: HTMLCanvasElement,
  dummies: DummyType[],
  mosaics: MosaicBlock[] = []
) => buildStack(main, dummies, mosaics, 5);
