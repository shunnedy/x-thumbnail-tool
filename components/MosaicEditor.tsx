'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { MosaicBlock, SegmentId } from '@/lib/types';
import { SEGMENT_LABELS_JA } from '@/lib/types';
import { OUTPUT_W, OUTPUT_H } from '@/lib/canvasUtils';

interface MosaicEditorProps {
  segmentId: SegmentId;
  segmentCanvas: HTMLCanvasElement;
  mosaics: MosaicBlock[];
  onAdd: (block: MosaicBlock) => void;
  onRemove: (blockId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const DEFAULT_BLOCK_PCT = 12; // 12% of width

export function MosaicEditor({
  segmentId,
  segmentCanvas,
  mosaics,
  onAdd,
  onRemove,
  onClear,
  onClose,
}: MosaicEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [blockPct, setBlockPct] = useState(DEFAULT_BLOCK_PCT);

  // Use refs to access latest values inside event handlers without re-registering
  const mosaicsRef = useRef(mosaics);
  const hoveredIdRef = useRef<string | null>(null);
  mosaicsRef.current = mosaics;
  hoveredIdRef.current = hoveredId;

  // Re-render canvas whenever mosaics or hoveredId change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const CW = canvas.width;
    const CH = canvas.height;

    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(segmentCanvas, 0, 0, CW, CH);

    for (const block of mosaics) {
      const bx = block.x * CW;
      const by = block.y * CH;
      const bw = block.w * CW;
      const bh = block.h * CH;

      ctx.save();
      if (hoveredId === block.id) {
        // Delete hover: red overlay with × cross
        ctx.fillStyle = 'rgba(220, 50, 50, 0.75)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        const m = Math.min(bw, bh) * 0.25;
        ctx.beginPath();
        ctx.moveTo(bx + m, by + m);
        ctx.lineTo(bx + bw - m, by + bh - m);
        ctx.moveTo(bx + bw - m, by + m);
        ctx.lineTo(bx + m, by + bh - m);
        ctx.stroke();
      } else {
        // White glowing mosaic block
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(180, 210, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      }
      ctx.restore();
    }
  }, [segmentCanvas, mosaics, hoveredId]);

  // Convert mouse event to normalized 0-1 coordinates
  const getCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  // Find which mosaic block (if any) contains the given normalized position
  const findBlock = useCallback((nx: number, ny: number): string | null => {
    for (let i = mosaicsRef.current.length - 1; i >= 0; i--) {
      const b = mosaicsRef.current[i];
      if (nx >= b.x && nx <= b.x + b.w && ny >= b.y && ny <= b.y + b.h) {
        return b.id;
      }
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e);
    const hId = findBlock(x, y);
    setHoveredId(hId);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hId ? 'pointer' : 'crosshair';
    }
  }, [getCanvasPos, findBlock]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e);
    const hId = findBlock(x, y);
    if (hId) {
      onRemove(hId);
      setHoveredId(null);
    } else {
      // Block size: blockPct% of width, visually square in pixel terms
      const bw = blockPct / 100;
      const bh = bw * (OUTPUT_W / OUTPUT_H); // maintain pixel-square shape
      const bx = Math.max(0, Math.min(1 - bw, x - bw / 2));
      const by = Math.max(0, Math.min(1 - bh, y - bh / 2));
      onAdd({
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x: bx,
        y: by,
        w: bw,
        h: bh,
      });
    }
  }, [getCanvasPos, findBlock, blockPct, onAdd, onRemove]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#15202b] border border-[#38444d] rounded-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#38444d]">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">モザイク編集</span>
            <span className="text-[#71767b] text-xs bg-[#253341] px-2 py-0.5 rounded">
              {SEGMENT_LABELS_JA[segmentId]}
            </span>
            {mosaics.length > 0 && (
              <span className="text-[#1d9bf0] text-xs">{mosaics.length}個</span>
            )}
          </div>
          <button onClick={onClose} className="text-[#71767b] hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-4 pb-2">
          <p className="text-[#71767b] text-xs mb-2">
            クリック → モザイク追加　／　モザイク上でクリック → 削除（赤くなったら削除）
          </p>
          <div className="rounded-xl overflow-hidden border border-[#38444d]">
            <canvas
              ref={canvasRef}
              width={OUTPUT_W}
              height={OUTPUT_H}
              className="w-full block"
              style={{ cursor: 'crosshair', display: 'block' }}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              onMouseLeave={() => setHoveredId(null)}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-4 space-y-3">
          {/* Block size slider */}
          <div>
            <div className="flex justify-between text-[11px] text-[#71767b] mb-1">
              <span>モザイクサイズ</span>
              <span className="text-[#e7e9ea]">{blockPct}%</span>
            </div>
            <input
              type="range"
              min={5} max={40} step={1}
              value={blockPct}
              onChange={(e) => setBlockPct(Number(e.target.value))}
              className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClear}
              disabled={mosaics.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#38444d] text-[#71767b] hover:text-white hover:border-[#71767b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3.5 w-3.5" />
              全消去
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] transition-colors"
            >
              完了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
