export const OUTPUT_SIZE = 1080;

/**
 * Slices the source image into 4 equal quadrants (TL, TR, BL, BR).
 * Takes the maximum square crop from center, then divides into 4.
 * Each output canvas is OUTPUT_SIZE × OUTPUT_SIZE.
 */
export function sliceImage(img: HTMLImageElement): HTMLCanvasElement[] {
  const W = img.naturalWidth;
  const H = img.naturalHeight;

  // Maximum square crop from center
  const S = Math.min(W, H);
  const cropX = (W - S) / 2;
  const cropY = (H - S) / 2;
  const half = S / 2;

  // [col, row] for each segment: 0=TL, 1=TR, 2=BL, 3=BR
  const quadrants: [number, number][] = [
    [0, 0], // TL
    [1, 0], // TR
    [0, 1], // BL
    [1, 1], // BR
  ];

  return quadrants.map(([col, row]) => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      img,
      cropX + col * half, cropY + row * half, // source xy
      half, half,                               // source size
      0, 0,                                     // dest xy
      OUTPUT_SIZE, OUTPUT_SIZE                  // dest size
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
