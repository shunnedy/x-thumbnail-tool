import { getDummy, type DummyType } from './dummyGenerators';
import { OUTPUT_W, OUTPUT_H } from './canvasUtils';

/**
 * Builds a 1280×3600 Penta-Stack canvas:
 *   Layer 1 (y=0)      → dummy top1
 *   Layer 2 (y=720)    → dummy top2
 *   Layer 3 (y=1440)   → main segment (blur + texture applied)
 *   Layer 4 (y=2160)   → dummy bottom1
 *   Layer 5 (y=2880)   → dummy bottom2
 *
 * X (Twitter) 4-image grid shows the center of each image.
 * Center of 3600px = y=1800 → Layer 3 occupies y=1440–2160 ✓
 * X 16:9 crop at center: height=1280*9/16=720, so shows y=1440–2160 = exactly Layer 3 ✓
 */
export function buildPentaStack(
  main: HTMLCanvasElement,
  dummies: DummyType[]  // [top1, top2, bottom1, bottom2]
): HTMLCanvasElement {
  const W = OUTPUT_W;
  const H = OUTPUT_H;

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H * 5;
  const ctx = out.getContext('2d')!;

  ctx.drawImage(getDummy(dummies[0]), 0,     0, W, H); // Layer 1
  ctx.drawImage(getDummy(dummies[1]), 0,     H, W, H); // Layer 2
  ctx.drawImage(main,                 0, H * 2, W, H); // Layer 3 (MAIN)
  ctx.drawImage(getDummy(dummies[2]), 0, H * 3, W, H); // Layer 4
  ctx.drawImage(getDummy(dummies[3]), 0, H * 4, W, H); // Layer 5

  return out;
}
