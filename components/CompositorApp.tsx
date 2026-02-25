'use client';

import { useReducer, useEffect, useRef, useState } from 'react';
import { Grid2X2, Shuffle } from 'lucide-react';

import { DropZone } from './DropZone';
import { SegmentCard } from './SegmentCard';
import { GridPreview } from './GridPreview';
import { ExportButton } from './ExportButton';

import { sliceImage, copyCanvas, OUTPUT_SIZE } from '@/lib/canvasUtils';
import { getTexture } from '@/lib/textureGenerators';
import { drawLShape } from '@/lib/lShapeMask';
import { bakeBlur } from '@/lib/blurBake';
import { exportAll } from '@/lib/exportUtils';
import { assignDummies } from '@/lib/dummyGenerators';
import { buildPentaStack } from '@/lib/stackCompositor';

import type { AppState, AppAction, SegmentId } from '@/lib/types';
import { DEFAULT_CONFIG, SEGMENT_LABELS_JA, INNER_CORNERS } from '@/lib/types';

// ─────────────────────────────────────── state ──

const initialState: AppState = {
  sourceImage: null,
  rawSegments: [],
  processedSegments: [],
  stackedSegments: [],
  dummyAssignments: [],
  configs: [DEFAULT_CONFIG, DEFAULT_CONFIG, DEFAULT_CONFIG, DEFAULT_CONFIG],
  isProcessing: false,
  isExporting: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SOURCE':
      return {
        ...state,
        sourceImage: action.payload,
        rawSegments: [],
        processedSegments: [],
        stackedSegments: [],
      };
    case 'SET_RAW_SEGMENTS':
      return { ...state, rawSegments: action.payload };
    case 'SET_PROCESSED_SEGMENTS':
      return { ...state, processedSegments: action.payload, isProcessing: false };
    case 'SET_STACKED_SEGMENTS':
      return { ...state, stackedSegments: action.payload };
    case 'SET_DUMMY_ASSIGNMENTS':
      return { ...state, dummyAssignments: action.payload };
    case 'UPDATE_CONFIG': {
      const next = [...state.configs] as AppState['configs'];
      next[action.payload.id] = { ...next[action.payload.id], ...action.payload.config };
      return { ...state, configs: next };
    }
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─────────────────────────────────────── processing ──

async function processAll(
  raws: HTMLCanvasElement[],
  configs: AppState['configs']
): Promise<HTMLCanvasElement[]> {
  return Promise.all(
    raws.map(async (raw, i) => {
      const cfg = configs[i as SegmentId];
      const corner = INNER_CORNERS[i as SegmentId];

      const work = copyCanvas(raw);
      const ctx = work.getContext('2d')!;

      if (cfg.textureType !== 'none') {
        const tex = getTexture(cfg.textureType);
        drawLShape(ctx, OUTPUT_SIZE, OUTPUT_SIZE, corner, cfg.textureArmPx, tex, cfg.textureOpacity);
      }

      return bakeBlur(work, cfg.blurPx);
    })
  );
}

// ─────────────────────────────────────── component ──

export default function CompositorApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const prevUrlRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  const handleImageLoad = (img: HTMLImageElement, url: string) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = url;
    setThumbnailUrl(url);
    dispatch({ type: 'SET_DUMMY_ASSIGNMENTS', payload: assignDummies() });
    dispatch({ type: 'SET_SOURCE', payload: img });
  };

  const handleReset = () => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = '';
    setThumbnailUrl('');
    dispatch({ type: 'RESET' });
  };

  const handleReshuffle = () => {
    dispatch({ type: 'SET_DUMMY_ASSIGNMENTS', payload: assignDummies() });
  };

  // Slice source image into 4 raw segments
  useEffect(() => {
    if (!state.sourceImage) return;
    const segments = sliceImage(state.sourceImage);
    dispatch({ type: 'SET_RAW_SEGMENTS', payload: segments });
  }, [state.sourceImage]);

  // Re-process segments (debounced 150ms) on raw change or config change
  useEffect(() => {
    if (state.rawSegments.length === 0) return;
    dispatch({ type: 'SET_PROCESSING', payload: true });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const processed = await processAll(
          state.rawSegments as HTMLCanvasElement[],
          state.configs
        );
        dispatch({ type: 'SET_PROCESSED_SEGMENTS', payload: processed });
      } catch (err) {
        console.error('Processing error:', err);
        dispatch({ type: 'SET_PROCESSING', payload: false });
      }
    }, 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.rawSegments, state.configs]);

  // Build 5-layer stacks when processed segments or dummies change
  useEffect(() => {
    if (state.processedSegments.length < 4 || state.dummyAssignments.length < 4) return;
    const stacked = state.processedSegments.map((canvas, i) =>
      buildPentaStack(canvas as HTMLCanvasElement, state.dummyAssignments[i])
    );
    dispatch({ type: 'SET_STACKED_SEGMENTS', payload: stacked });
  }, [state.processedSegments, state.dummyAssignments]);

  const handleExport = async () => {
    if (state.stackedSegments.length < 4) return;
    dispatch({ type: 'SET_EXPORTING', payload: true });
    await exportAll(state.stackedSegments as HTMLCanvasElement[]);
    dispatch({ type: 'SET_EXPORTING', payload: false });
  };

  const hasResult = state.stackedSegments.length >= 4;
  const hasImage = state.rawSegments.length > 0;

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-[#38444d] bg-black/90 backdrop-blur-sm flex-shrink-0 z-10">
        <Grid2X2 className="h-5 w-5 text-[#1d9bf0]" />
        <h1 className="text-white font-bold text-base">Grid Compositor</h1>
        <span className="text-[#71767b] text-sm">for X / Twitter</span>
        <span className="ml-2 text-[10px] bg-[#1d9bf0]/20 text-[#1d9bf0] px-2 py-0.5 rounded-full font-medium">
          Penta-Stack
        </span>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-[380px] flex-shrink-0 overflow-y-auto border-r border-[#38444d] bg-black">
          <div className="p-4 space-y-3">
            {/* Upload */}
            <div>
              <SectionLabel>画像アップロード</SectionLabel>
              <DropZone
                onFileSelected={handleImageLoad}
                thumbnailUrl={thumbnailUrl}
                onReset={handleReset}
              />
            </div>

            {/* Segment cards */}
            {hasImage && (
              <div>
                <SectionLabel>セグメント設定</SectionLabel>
                <div className="space-y-2">
                  {([0, 1, 2, 3] as SegmentId[]).map((id) => (
                    <SegmentCard
                      key={id}
                      id={id}
                      labelJa={SEGMENT_LABELS_JA[id]}
                      config={state.configs[id]}
                      processedCanvas={state.processedSegments[id] ?? null}
                      onChange={(partial) =>
                        dispatch({ type: 'UPDATE_CONFIG', payload: { id, config: partial } })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dummy reshuffle */}
            {hasImage && (
              <div>
                <SectionLabel>ダミー画像</SectionLabel>
                <button
                  onClick={handleReshuffle}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border border-[#38444d] text-[#71767b] hover:text-white hover:border-[#71767b] transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  ダミーをランダム再生成
                </button>
                <p className="text-[#38444d] text-[11px] mt-1.5 text-center">
                  上下2枚ずつ、計4枚のダミー画像を差し替えます
                </p>
              </div>
            )}

            {/* Export */}
            {hasImage && (
              <div className="pt-1">
                <ExportButton
                  onExport={handleExport}
                  isExporting={state.isExporting}
                  disabled={!hasResult || state.isProcessing}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 overflow-y-auto bg-black flex justify-center p-6 pt-8">
          <GridPreview
            processedSegments={state.processedSegments as HTMLCanvasElement[]}
            stackedSegments={state.stackedSegments as HTMLCanvasElement[]}
            isProcessing={state.isProcessing}
          />
        </main>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#71767b] text-[11px] font-semibold uppercase tracking-widest mb-2">
      {children}
    </p>
  );
}
