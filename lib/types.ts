import type { DummyType } from './dummyGenerators';

export type { DummyType };

export type SegmentId = 0 | 1 | 2 | 3;
export type TextureType = 'none' | 'nature' | 'abstract';
export type InnerCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export const SEGMENT_LABELS = ['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'] as const;
export const SEGMENT_LABELS_JA = ['左上', '右上', '左下', '右下'] as const;
export const INNER_CORNER_LABELS_JA = ['右下角', '左下角', '右上角', '左上角'] as const;

export const INNER_CORNERS: Record<SegmentId, InnerCorner> = {
  0: 'bottom-right',
  1: 'bottom-left',
  2: 'top-right',
  3: 'top-left',
};

export interface SegmentConfig {
  blurPx: number;          // 0–20
  textureType: TextureType;
  textureOpacity: number;  // 0.0–1.0
  textureArmPx: number;    // L-arm length in px (40–200)
}

export const DEFAULT_CONFIG: SegmentConfig = {
  blurPx: 0,
  textureType: 'nature',
  textureOpacity: 0.75,
  textureArmPx: 100,
};

export interface MosaicBlock {
  id: string;    // unique id for key/removal
  x: number;     // normalized 0-1
  y: number;
  w: number;
  h: number;
}

export interface AppState {
  sourceImage: HTMLImageElement | null;
  cropOffset: number;                       // 0=top/left, 0.5=center, 1=bottom/right
  zoom: number;                             // 1.0=normal, 2.0=2x zoom-in (centered)
  stackLayers: 3 | 5 | 7 | 9;              // odd-only: X crops center → main is always visible
  rawSegments: HTMLCanvasElement[];
  processedSegments: HTMLCanvasElement[];   // 1280×720 (texture + blur, NO mosaics)
  stackedSegments: HTMLCanvasElement[];     // 1280×3600 (5-layer penta-stack, mosaics baked)
  dummyAssignments: DummyType[][];          // [4 segments][4 dummies each]
  mosaics: [MosaicBlock[], MosaicBlock[], MosaicBlock[], MosaicBlock[]];
  configs: [SegmentConfig, SegmentConfig, SegmentConfig, SegmentConfig];
  isProcessing: boolean;
  isExporting: boolean;
}

export type AppAction =
  | { type: 'SET_SOURCE'; payload: HTMLImageElement }
  | { type: 'SET_CROP_OFFSET'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_STACK_LAYERS'; payload: 3 | 5 | 7 | 9 }
  | { type: 'SET_RAW_SEGMENTS'; payload: HTMLCanvasElement[] }
  | { type: 'SET_PROCESSED_SEGMENTS'; payload: HTMLCanvasElement[] }
  | { type: 'SET_STACKED_SEGMENTS'; payload: HTMLCanvasElement[] }
  | { type: 'SET_DUMMY_ASSIGNMENTS'; payload: DummyType[][] }
  | { type: 'ADD_MOSAIC'; payload: { id: SegmentId; block: MosaicBlock } }
  | { type: 'REMOVE_MOSAIC'; payload: { id: SegmentId; blockId: string } }
  | { type: 'CLEAR_MOSAICS'; payload: SegmentId }
  | { type: 'UPDATE_CONFIG'; payload: { id: SegmentId; config: Partial<SegmentConfig> } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'RESET' };
