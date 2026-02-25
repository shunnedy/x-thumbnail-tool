export const OUTPUT_W = 1280;
export const OUTPUT_H = 720;

/**
 * Slices the source image into 4 equal quadrants (TL, TR, BL, BR).
 * Takes a 16:9 crop using the given offset (0=top/left, 0.5=center, 1=bottom/right).
 * Each output canvas is OUTPUT_W × OUTPUT_H (1280×720).
 */
export function sliceImage(img: HTMLImageElement, cropOffset = 0.5): HTMLCanvasElement[] {
  const W = img.naturalWidth;
  const H = img.naturalHeight;

  // Crop to 16:9 using the provided offset
  const targetRatio = 16 / 9;
  const srcRatio = W / H;

  let cropW: number, cropH: number;
  let cropX: number, cropY: number;
  if (srcRatio > targetRatio) {
    // Wider than 16:9 → crop sides; offset controls left↔right
    cropH = H;
    cropW = H * targetRatio;
    cropX = (W - cropW) * cropOffset;
    cropY = 0;
  } else {
    // Taller than 16:9 → crop top/bottom; offset controls top↔bottom
    cropW = W;
    cropH = W / targetRatio;
    cropX = 0;
    cropY = (H - cropH) * cropOffset;
  }
  const halfW = cropW / 2;
  const halfH = cropH / 2;

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
      cropX + col * halfW, cropY + row * halfH, // source xy
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
