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

export interface AppState {
  sourceImage: HTMLImageElement | null;
  rawSegments: HTMLCanvasElement[];
  processedSegments: HTMLCanvasElement[];   // 1080×1080 (texture + blur)
  stackedSegments: HTMLCanvasElement[];     // 1080×5400 (5-layer penta-stack)
  dummyAssignments: DummyType[][];          // [4 segments][4 dummies each]
  configs: [SegmentConfig, SegmentConfig, SegmentConfig, SegmentConfig];
  isProcessing: boolean;
  isExporting: boolean;
}

export type AppAction =
  | { type: 'SET_SOURCE'; payload: HTMLImageElement }
  | { type: 'SET_RAW_SEGMENTS'; payload: HTMLCanvasElement[] }
  | { type: 'SET_PROCESSED_SEGMENTS'; payload: HTMLCanvasElement[] }
  | { type: 'SET_STACKED_SEGMENTS'; payload: HTMLCanvasElement[] }
  | { type: 'SET_DUMMY_ASSIGNMENTS'; payload: DummyType[][] }
  | { type: 'UPDATE_CONFIG'; payload: { id: SegmentId; config: Partial<SegmentConfig> } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'RESET' };
