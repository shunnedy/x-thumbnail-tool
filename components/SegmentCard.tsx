'use client';

import { useEffect, useRef } from 'react';
import type { SegmentId, SegmentConfig, TextureType } from '@/lib/types';
import { INNER_CORNER_LABELS_JA } from '@/lib/types';

interface SegmentCardProps {
  id: SegmentId;
  labelJa: string;
  config: SegmentConfig;
  processedCanvas: HTMLCanvasElement | null;
  onChange: (partial: Partial<SegmentConfig>) => void;
}

const TEXTURE_OPTIONS: { value: TextureType; label: string }[] = [
  { value: 'none', label: 'なし' },
  { value: 'nature', label: '自然' },
  { value: 'abstract', label: '抽象' },
];

export function SegmentCard({ id, labelJa, config, processedCanvas, onChange }: SegmentCardProps) {
  const thumbRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!thumbRef.current || !processedCanvas) return;
    const ctx = thumbRef.current.getContext('2d');
    if (ctx) ctx.drawImage(processedCanvas, 0, 0, 128, 72);
  }, [processedCanvas]);

  return (
    <div className="bg-[#1e2732] rounded-xl border border-[#38444d] p-3">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="flex-shrink-0 text-center">
          <canvas
            ref={thumbRef}
            width={128}
            height={72}
            className="rounded-lg bg-[#253341] block"
          />
          <span className="text-[10px] text-[#71767b] mt-1 block">
            {id + 1}
          </span>
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-white text-sm font-semibold">{labelJa}</span>
            <span className="text-[#71767b] text-[10px] bg-[#253341] px-2 py-0.5 rounded">
              内角: {INNER_CORNER_LABELS_JA[id]}
            </span>
          </div>

          {/* Blur */}
          <div className="mb-2.5">
            <div className="flex justify-between text-[11px] text-[#71767b] mb-1">
              <span>ぼかし</span>
              <span className="text-[#e7e9ea]">{config.blurPx}px</span>
            </div>
            <input
              type="range"
              min={0} max={20} step={1}
              value={config.blurPx}
              onChange={(e) => onChange({ blurPx: Number(e.target.value) })}
              className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
            />
          </div>

          {/* Texture type */}
          <div className="mb-2">
            <div className="text-[11px] text-[#71767b] mb-1">テクスチャ</div>
            <div className="flex gap-1">
              {TEXTURE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ textureType: opt.value })}
                  className={`flex-1 py-1 text-xs rounded transition-colors ${
                    config.textureType === opt.value
                      ? 'bg-[#1d9bf0] text-white font-medium'
                      : 'bg-[#253341] text-[#71767b] hover:text-[#e7e9ea]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity and arm size (only when texture enabled) */}
          {config.textureType !== 'none' && (
            <>
              <div className="mb-2">
                <div className="flex justify-between text-[11px] text-[#71767b] mb-1">
                  <span>不透明度</span>
                  <span className="text-[#e7e9ea]">{Math.round(config.textureOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={100} step={5}
                  value={Math.round(config.textureOpacity * 100)}
                  onChange={(e) => onChange({ textureOpacity: Number(e.target.value) / 100 })}
                  className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-[#71767b] mb-1">
                  <span>L字サイズ</span>
                  <span className="text-[#e7e9ea]">{config.textureArmPx}px</span>
                </div>
                <input
                  type="range"
                  min={40} max={240} step={10}
                  value={config.textureArmPx}
                  onChange={(e) => onChange({ textureArmPx: Number(e.target.value) })}
                  className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
