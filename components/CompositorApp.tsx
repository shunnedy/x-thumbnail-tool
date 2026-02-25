'use client';

import { useReducer, useEffect, useRef, useState } from 'react';
import { Grid2X2, Shuffle } from 'lucide-react';

import { DropZone } from './DropZone';
import { SegmentCard } from './SegmentCard';
import { GridPreview } from './GridPreview';
import { ExportButton } from './ExportButton';

import { sliceImage, copyCanvas, OUTPUT_W, OUTPUT_H } from '@/lib/canvasUtils';
import { getTexture } from '@/lib/textureGenerators';
import { drawLShape } from '@/lib/lShapeMask';
import { bakeBlur } from '@/lib/blurBake';
import { exportAll } from '@/lib/exportUtils';
import { assignDummies } from '@/lib/dummyGenerators';
import { buildStack } from '@/lib/stackCompositor';

import type { AppState, AppAction, SegmentId } from '@/lib/types';
import { DEFAULT_CONFIG, SEGMENT_LABELS_JA, INNER_CORNERS } from '@/lib/types';

// ─────────────────────────────────────── state ──

const initialState: AppState = {
  sourceImage: null,
  cropOffset: 0.5,
  zoom: 1,
  stackLayers: 5,
  rawSegments: [],
  processedSegments: [],
  stackedSegments: [],
  dummyAssignments: [],
  mosaics: [[], [], [], []],
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
        mosaics: [[], [], [], []],
      };
    case 'SET_CROP_OFFSET':
      return { ...state, cropOffset: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_STACK_LAYERS':
      return { ...state, stackLayers: action.payload };
    case 'SET_RAW_SEGMENTS':
      return { ...state, rawSegments: action.payload };
    case 'SET_PROCESSED_SEGMENTS':
      return { ...state, processedSegments: action.payload, isProcessing: false };
    case 'SET_STACKED_SEGMENTS':
      return { ...state, stackedSegments: action.payload };
    case 'SET_DUMMY_ASSIGNMENTS':
      return { ...state, dummyAssignments: action.payload };
    case 'ADD_MOSAIC': {
      const next = [...state.mosaics] as AppState['mosaics'];
      next[action.payload.id] = [...next[action.payload.id], action.payload.block];
      return { ...state, mosaics: next };
    }
    case 'REMOVE_MOSAIC': {
      const next = [...state.mosaics] as AppState['mosaics'];
      next[action.payload.id] = next[action.payload.id].filter(b => b.id !== action.payload.blockId);
      return { ...state, mosaics: next };
    }
    case 'CLEAR_MOSAICS': {
      const next = [...state.mosaics] as AppState['mosaics'];
      next[action.payload] = [];
      return { ...state, mosaics: next };
    }
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
        drawLShape(ctx, OUTPUT_W, OUTPUT_H, corner, cfg.textureArmPx, tex, cfg.textureOpacity);
      }

      return bakeBlur(work, cfg.blurPx);
    })
  );
}

// ─────────────────────────────────────── component ──

export default function CompositorApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [globalBlur, setGlobalBlur] = useState(0);
  const prevUrlRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  // Derived: which direction needs cropping (null = already 16:9)
  const cropDirection = state.sourceImage ? (() => {
    const ratio = state.sourceImage.naturalWidth / state.sourceImage.naturalHeight;
    if (Math.abs(ratio - 16 / 9) < 0.005) return null;
    return ratio > 16 / 9 ? 'horizontal' : 'vertical';
  })() : null;

  const handleImageLoad = (img: HTMLImageElement, url: string) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = url;
    setThumbnailUrl(url);
    dispatch({ type: 'SET_DUMMY_ASSIGNMENTS', payload: assignDummies() });
    dispatch({ type: 'SET_SOURCE', payload: img });
    dispatch({ type: 'SET_CROP_OFFSET', payload: 0.5 });
  };

  const handleReset = () => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = '';
    setThumbnailUrl('');
    setGlobalBlur(0);
    dispatch({ type: 'RESET' });
  };

  const handleReshuffle = () => {
    dispatch({ type: 'SET_DUMMY_ASSIGNMENTS', payload: assignDummies() });
  };

  const handleGlobalBlur = (v: number) => {
    setGlobalBlur(v);
    ([0, 1, 2, 3] as SegmentId[]).forEach(id => {
      dispatch({ type: 'UPDATE_CONFIG', payload: { id, config: { blurPx: v } } });
    });
  };

  // Slice source image into 4 raw segments (re-runs when cropOffset or zoom changes)
  useEffect(() => {
    if (!state.sourceImage) return;
    const segments = sliceImage(state.sourceImage, state.cropOffset, state.zoom);
    dispatch({ type: 'SET_RAW_SEGMENTS', payload: segments });
  }, [state.sourceImage, state.cropOffset, state.zoom]);

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

  // Build N-layer stacks when processed segments, dummies, mosaics, or layer count change
  useEffect(() => {
    if (state.processedSegments.length < 4 || state.dummyAssignments.length < 4) return;
    const stacked = state.processedSegments.map((canvas, i) =>
      buildStack(canvas as HTMLCanvasElement, state.dummyAssignments[i], state.mosaics[i], state.stackLayers)
    );
    dispatch({ type: 'SET_STACKED_SEGMENTS', payload: stacked });
  }, [state.processedSegments, state.dummyAssignments, state.mosaics, state.stackLayers]);

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
          {(['Tri','Penta','Hepta','Nona'] as const)[([3,5,7,9] as const).indexOf(state.stackLayers)]}-Stack
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

              {/* Crop offset — only when image needs cropping */}
              {hasImage && cropDirection && (
                <div className="mt-2 bg-[#1e2732] rounded-xl border border-[#38444d] p-3">
                  <div className="flex justify-between text-[11px] text-[#71767b] mb-1">
                    <span>
                      {cropDirection === 'horizontal' ? '← 左右のトリミング位置 →' : '↑ 上下のトリミング位置 ↓'}
                    </span>
                    <span className="text-[#e7e9ea]">
                      {cropDirection === 'horizontal'
                        ? ['左', '中央', '右'][Math.round(state.cropOffset * 2)]
                        : ['上', '中央', '下'][Math.round(state.cropOffset * 2)]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0} max={100} step={1}
                    value={Math.round(state.cropOffset * 100)}
                    onChange={(e) =>
                      dispatch({ type: 'SET_CROP_OFFSET', payload: Number(e.target.value) / 100 })
                    }
                    className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
                  />
                </div>
              )}

              {/* Zoom — always shown when image is loaded */}
              {hasImage && (
                <div className="mt-2 bg-[#1e2732] rounded-xl border border-[#38444d] p-3">
                  <div className="flex justify-between text-[11px] text-[#71767b] mb-1">
                    <span>ズーム倍率</span>
                    <span className="text-[#e7e9ea]">{state.zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={100} max={400} step={10}
                    value={Math.round(state.zoom * 100)}
                    onChange={(e) =>
                      dispatch({ type: 'SET_ZOOM', payload: Number(e.target.value) / 100 })
                    }
                    className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Segment cards */}
            {hasImage && (
              <div>
                <SectionLabel>セグメント設定</SectionLabel>

                {/* Global blur */}
                <div className="mb-2 bg-[#1e2732] rounded-xl border border-[#38444d] p-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#1d9bf0] font-semibold">全体まとめてブラー</span>
                    <span className="text-[#e7e9ea]">{globalBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0} max={20} step={1}
                    value={globalBlur}
                    onChange={(e) => handleGlobalBlur(Number(e.target.value))}
                    className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
                  />
                  <p className="text-[#38444d] text-[10px] mt-1">全セグメントのブラー値を一括設定</p>
                </div>

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

            {/* Dummy reshuffle + layer count */}
            {hasImage && (
              <div>
                <SectionLabel>ダミー画像</SectionLabel>

                {/* Layer count selector */}
                <div className="mb-2 bg-[#1e2732] rounded-xl border border-[#38444d] p-3">
                  <p className="text-[#71767b] text-[11px] mb-2">スタック層数（奇数のみ有効）</p>
                  <div className="flex gap-1">
                    {([3, 5, 7, 9] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => dispatch({ type: 'SET_STACK_LAYERS', payload: n })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          state.stackLayers === n
                            ? 'bg-[#1d9bf0] text-white'
                            : 'border border-[#38444d] text-[#71767b] hover:text-white hover:border-[#71767b]'
                        }`}
                      >
                        {n}層
                      </button>
                    ))}
                  </div>
                  <p className="text-[#38444d] text-[10px] mt-1.5">
                    総高さ {state.stackLayers * 720}px · 上下{(state.stackLayers - 1) / 2}枚ずつ
                  </p>
                </div>

                <button
                  onClick={handleReshuffle}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border border-[#38444d] text-[#71767b] hover:text-white hover:border-[#71767b] transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  ダミーをランダム再生成
                </button>
                <p className="text-[#38444d] text-[11px] mt-1.5 text-center">
                  各セグメントのダミー{state.stackLayers - 1}枚を差し替えます
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
            mosaics={state.mosaics}
            onAddMosaic={(id, block) => dispatch({ type: 'ADD_MOSAIC', payload: { id, block } })}
            onRemoveMosaic={(id, blockId) => dispatch({ type: 'REMOVE_MOSAIC', payload: { id, blockId } })}
            onClearMosaics={(id) => dispatch({ type: 'CLEAR_MOSAICS', payload: id })}
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
