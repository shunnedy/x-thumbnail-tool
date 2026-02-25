/**
 * Bakes Gaussian blur into a new canvas using ctx.filter.
 *
 * To prevent the dark-edge artifact (where blur samples transparent pixels
 * outside canvas bounds), we:
 * 1. Create a padded canvas (3× blurRadius padding on all sides)
 * 2. Tile the source image in a 3×3 grid around center → seamless padding
 * 3. Apply blur filter to the padded canvas
 * 4. Crop the center region back to original size
 */
export function bakeBlur(
  source: HTMLCanvasElement,
  blurPx: number
): HTMLCanvasElement {
  if (blurPx <= 0) return source;

  const W = source.width;
  const H = source.height;
  const pad = Math.ceil(blurPx * 3);

  // Build padded canvas with tiled source to avoid edge darkening
  const padded = document.createElement('canvas');
  padded.width = W + pad * 2;
  padded.height = H + pad * 2;
  const pCtx = padded.getContext('2d')!;

  // Draw 3×3 tiled source
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      pCtx.drawImage(source, pad + dx * W, pad + dy * H);
    }
  }

  // Apply blur to padded canvas
  const blurred = document.createElement('canvas');
  blurred.width = padded.width;
  blurred.height = padded.height;
  const bCtx = blurred.getContext('2d')!;
  bCtx.filter = `blur(${blurPx}px)`;
  bCtx.drawImage(padded, 0, 0);
  bCtx.filter = 'none';

  // Crop center back to original dimensions
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  out.getContext('2d')!.drawImage(blurred, pad, pad, W, H, 0, 0, W, H);

  return out;
}
