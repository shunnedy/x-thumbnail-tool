import type { InnerCorner } from './types';

/**
 * Draws an L-shaped texture overlay at the inner corner of a canvas segment.
 *
 * Each of the 4 segments has ONE inner corner (where all 4 segments meet):
 *   Segment 0 (TL) → inner corner = bottom-right
 *   Segment 1 (TR) → inner corner = bottom-left
 *   Segment 2 (BL) → inner corner = top-right
 *   Segment 3 (BR) → inner corner = top-left
 *
 * The L-shape is a 6-point polygon covering two arms meeting at the corner.
 * armLen = how far from the corner each arm extends
 * armW   = thickness of each arm (= armLen * 0.45 for aesthetic proportion)
 */
export function drawLShape(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  corner: InnerCorner,
  armLen: number,
  textureCanvas: HTMLCanvasElement,
  opacity: number
): void {
  const a = armLen;
  const aW = Math.max(18, Math.round(armLen * 0.45));

  // Compute the 6 polygon vertices for the L-shape at each corner.
  // Polygon goes clockwise. The "outer corner" is the canvas corner.
  //
  // For bottom-right (W, H):
  //   P1 (W-a,  H-aW)  ← top-left of horizontal arm
  //   P2 (W-aW, H-aW)  ← inner notch
  //   P3 (W-aW, H-a)   ← top of vertical arm
  //   P4 (W,    H-a)   ← top-right of vertical arm
  //   P5 (W,    H)     ← outer corner
  //   P6 (W-a,  H)     ← bottom-left of horizontal arm

  let points: [number, number][];

  switch (corner) {
    case 'bottom-right':
      points = [
        [W - a,  H - aW],
        [W - aW, H - aW],
        [W - aW, H - a ],
        [W,      H - a ],
        [W,      H     ],
        [W - a,  H     ],
      ];
      break;

    case 'bottom-left':
      // Mirror of bottom-right (x → W - x becomes 0 + x from left)
      points = [
        [a,      H - aW],
        [aW,     H - aW],
        [aW,     H - a ],
        [0,      H - a ],
        [0,      H     ],
        [a,      H     ],
      ];
      break;

    case 'top-right':
      // Mirror of bottom-right (y → H - y becomes 0 + y from top)
      points = [
        [W - a,  aW    ],
        [W - aW, aW    ],
        [W - aW, a     ],
        [W,      a     ],
        [W,      0     ],
        [W - a,  0     ],
      ];
      break;

    case 'top-left':
      // Both x and y mirrored
      points = [
        [a,      aW    ],
        [aW,     aW    ],
        [aW,     a     ],
        [0,      a     ],
        [0,      0     ],
        [a,      0     ],
      ];
      break;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();

  const pattern = ctx.createPattern(textureCanvas, 'repeat');
  if (pattern) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = pattern;
    ctx.fill();
  }
  ctx.restore();
}
