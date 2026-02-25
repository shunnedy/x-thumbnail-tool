export const OUTPUT_W = 1280;
export const OUTPUT_H = 720;

/**
 * Slices the source image into 4 equal quadrants (TL, TR, BL, BR).
 *
 * Model:
 *   1. Compute the largest 16:9 "base" crop that fits inside the source image.
 *   2. Apply zoom: viewport = base / zoom  (zoom=2 → viewport is half the base area).
 *   3. Pan the viewport within the source image using panX/panY (0=min, 0.5=center, 1=max).
 *      - Available X range: imageW − viewW  (positive when image is wider than viewport)
 *      - Available Y range: imageH − viewH  (positive when image is taller than viewport)
 *   4. Slice viewport into 4 equal quadrants, each rendered to OUTPUT_W × OUTPUT_H.
 *
 * This means:
 *   - A wider-than-16:9 image at zoom=1 allows only X panning (Y range = 0).
 *   - A taller-than-16:9 image at zoom=1 allows only Y panning (X range = 0).
 *   - Any image at zoom>1 allows panning in both X and Y.
 */
export function sliceImage(img: HTMLImageElement, panX = 0.5, panY = 0.5, zoom = 1.0): HTMLCanvasElement[] {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const targetRatio = 16 / 9;
  const srcRatio = W / H;

  // Largest 16:9 base crop that fits inside the source image
  let baseW: number, baseH: number;
  if (srcRatio > targetRatio) {
    baseH = H;
    baseW = H * targetRatio;
  } else {
    baseW = W;
    baseH = W / targetRatio;
  }

  // Viewport (zoom shrinks the sampled area)
  const viewW = baseW / zoom;
  const viewH = baseH / zoom;

  // Pan within the source image (clamp implicit via panX/panY ∈ [0,1])
  const availX = W - viewW;
  const availY = H - viewH;
  const viewX = availX * panX;
  const viewY = availY * panY;
  const halfW = viewW / 2;
  const halfH = viewH / 2;

  // [col, row] for each segment: 0=TL, 1=TR, 2=BL, 3=BR
  const quadrants: [number, number][] = [
    [0, 0], // TL
    [1, 0], // TR
    [0, 1], // BL
    [1, 1], // BR
  ];

  return quadrants.map(([col, row]) => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      img,
      viewX + col * halfW, viewY + row * halfH, // source xy
      halfW, halfH,                               // source size
      0, 0,                                       // dest xy
      OUTPUT_W, OUTPUT_H                          // dest size
    );
    return canvas;
  });
}

export function copyCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const dst = document.createElement('canvas');
  dst.width = src.width;
  dst.height = src.height;
  dst.getContext('2d')!.drawImage(src, 0, 0);
  return dst;
}
