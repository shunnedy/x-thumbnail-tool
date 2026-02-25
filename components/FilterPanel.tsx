'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { FilterConfig, SegmentId } from '@/lib/types';
import { DEFAULT_FILTER_CONFIG } from '@/lib/types';
import { isFilterActive } from '@/lib/filterUtils';

interface FilterPanelProps {
  filterMode: 'global' | 'per-segment';
  globalFilter: FilterConfig;
  segmentFilters: [FilterConfig, FilterConfig, FilterConfig, FilterConfig];
  onFilterModeChange: (mode: 'global' | 'per-segment') => void;
  onGlobalFilterChange: (partial: Partial<FilterConfig>) => void;
  onSegmentFilterChange: (id: SegmentId, partial: Partial<FilterConfig>) => void;
}

const SEGMENT_LABELS = ['左上', '右上', '左下', '右下'] as const;

export function FilterPanel({
  filterMode,
  globalFilter,
  segmentFilters,
  onFilterModeChange,
  onGlobalFilterChange,
  onSegmentFilterChange,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeSegment, setActiveSegment] = useState<SegmentId>(0);

  const anyActive =
    isFilterActive(globalFilter) || segmentFilters.some(isFilterActive);

  const handleResetGlobal = () => onGlobalFilterChange(DEFAULT_FILTER_CONFIG);
  const handleResetSegment = (id: SegmentId) =>
    onSegmentFilterChange(id, DEFAULT_FILTER_CONFIG);

  const currentConfig =
    filterMode === 'global' ? globalFilter : segmentFilters[activeSegment];
  const handleChange =
    filterMode === 'global'
      ? onGlobalFilterChange
      : (p: Partial<FilterConfig>) => onSegmentFilterChange(activeSegment, p);
  const handleReset =
    filterMode === 'global'
      ? handleResetGlobal
      : () => handleResetSegment(activeSegment);

  return (
    <div className="bg-[#1e2732] rounded-xl border border-[#38444d]">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#1d9bf0] flex-shrink-0" />
        <span className="text-[#e7e9ea] text-xs font-semibold flex-1">
          ビジュアルエフェクト
        </span>
        {anyActive && (
          <span className="text-[9px] bg-[#1d9bf0]/20 text-[#1d9bf0] px-1.5 py-0.5 rounded-full font-medium">
            ON
          </span>
        )}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-[#71767b]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[#71767b]" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#38444d] text-xs">
            <ModeBtn
              active={filterMode === 'global'}
              onClick={() => onFilterModeChange('global')}
            >
              一括
            </ModeBtn>
            <ModeBtn
              active={filterMode === 'per-segment'}
              onClick={() => onFilterModeChange('per-segment')}
            >
              個別
            </ModeBtn>
          </div>

          {/* Segment selector (per-segment mode only) */}
          {filterMode === 'per-segment' && (
            <div className="flex gap-1">
              {([0, 1, 2, 3] as SegmentId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveSegment(id)}
                  className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                    activeSegment === id
                      ? 'bg-[#1d9bf0] text-white'
                      : 'border border-[#38444d] text-[#71767b] hover:text-white hover:border-[#71767b]'
                  }`}
                >
                  {isFilterActive(segmentFilters[id]) && activeSegment !== id ? (
                    <span className="text-[#1d9bf0]">●</span>
                  ) : null}{' '}
                  {SEGMENT_LABELS[id]}
                </button>
              ))}
            </div>
          )}

          {/* Sliders */}
          <div className="space-y-2.5">
            <FilterSlider
              label="フィルムグレイン"
              hint="粒状ノイズ"
              value={currentConfig.grainIntensity}
              min={0} max={100}
              onChange={(v) => handleChange({ grainIntensity: v })}
              displayFn={(v) => `${v}`}
            />
            <FilterSlider
              label="色温度"
              hint="← クール / ウォーム →"
              value={currentConfig.colorTemp}
              min={-100} max={100}
              onChange={(v) => handleChange({ colorTemp: v })}
              displayFn={(v) => v === 0 ? 'Neutral' : v > 0 ? `+${v} Warm` : `${v} Cool`}
              bipolar
            />
            <FilterSlider
              label="彩度"
              hint="← グレー / ビビッド →"
              value={currentConfig.saturation}
              min={-100} max={100}
              onChange={(v) => handleChange({ saturation: v })}
              displayFn={(v) => v === 0 ? 'Normal' : v > 0 ? `+${v}` : `${v}`}
              bipolar
            />
            <FilterSlider
              label="エッジ補正"
              hint="境界のビネット"
              value={currentConfig.edgeSoftening}
              min={0} max={100}
              onChange={(v) => handleChange({ edgeSoftening: v })}
              displayFn={(v) => `${v}`}
            />
          </div>

          {/* Reset */}
          {isFilterActive(currentConfig) && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] text-[#71767b] border border-[#38444d] hover:text-white hover:border-[#71767b] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              {filterMode === 'global' ? '全体リセット' : `${SEGMENT_LABELS[activeSegment]}リセット`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

interface FilterSliderProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  displayFn: (v: number) => string;
  bipolar?: boolean;
}

function FilterSlider({ label, hint, value, min, max, onChange, displayFn, bipolar }: FilterSliderProps) {
  const isDefault = bipolar ? value === 0 : value === min;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className={`text-[11px] font-medium ${isDefault ? 'text-[#71767b]' : 'text-[#e7e9ea]'}`}>
          {label}
        </span>
        <span className={`text-[10px] tabular-nums ${isDefault ? 'text-[#38444d]' : 'text-[#1d9bf0]'}`}>
          {displayFn(value)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 accent-[#1d9bf0] cursor-pointer"
      />
      <p className="text-[9px] text-[#38444d] mt-0.5">{hint}</p>
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-center transition-colors ${
        active
          ? 'bg-[#1d9bf0] text-white font-semibold'
          : 'text-[#71767b] hover:text-[#e7e9ea] bg-transparent'
      }`}
    >
      {children}
    </button>
  );
}
