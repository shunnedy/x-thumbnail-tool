'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { FilterConfig, SegmentId } from '@/lib/types';
import { DEFAULT_FILTER_CONFIG } from '@/lib/types';
import { isFilterActive } from '@/lib/filterUtils';
import { COLOR_GRADE_PRESETS } from '@/lib/colorGrade';

interface FilterPanelProps {
  filterMode: 'global' | 'per-segment';
  globalFilter: FilterConfig;
  segmentFilters: [FilterConfig, FilterConfig, FilterConfig, FilterConfig];
  onFilterModeChange: (mode: 'global' | 'per-segment') => void;
  onGlobalFilterChange: (partial: Partial<FilterConfig>) => void;
  onSegmentFilterChange: (id: SegmentId, partial: Partial<FilterConfig>) => void;
  /** Average dominant color from assigned dummy photos, per segment. */
  animalTargetColors?: [
    { r: number; g: number; b: number },
    { r: number; g: number; b: number },
    { r: number; g: number; b: number },
    { r: number; g: number; b: number },
  ];
}

const SEGMENT_LABELS = ['左上', '右上', '左下', '右下'] as const;

export function FilterPanel({
  filterMode,
  globalFilter,
  segmentFilters,
  onFilterModeChange,
  onGlobalFilterChange,
  onSegmentFilterChange,
  animalTargetColors,
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

          {/* ── Color Grade (tinted lighting) ── */}
          <div className="border-t border-[#38444d] pt-3">
            <ColorGradeSection config={currentConfig} onChange={handleChange} />
          </div>

          {/* ── Animal Texture Match ── */}
          <div className="border-t border-[#38444d] pt-3">
            <AnimalContextSection
              config={currentConfig}
              onChange={handleChange}
              targetColors={animalTargetColors}
              filterMode={filterMode}
              activeSegment={activeSegment}
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

// ─── Color Grade Section ──────────────────────────────────────────────────

interface ColorGradeSectionProps {
  config: FilterConfig;
  onChange: (partial: Partial<FilterConfig>) => void;
}

function ColorGradeSection({ config, onChange }: ColorGradeSectionProps) {
  const enabled = config.colorGradeEnabled;

  return (
    <div className="space-y-2.5">
      {/* Header row with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#e7e9ea]">
            カラーグレーディング
          </span>
          {enabled && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: config.colorGradeColor + '33',
                color: config.colorGradeColor,
              }}
            >
              ON
            </span>
          )}
        </div>
        {/* Toggle */}
        <button
          onClick={() => onChange({ colorGradeEnabled: !enabled })}
          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0`}
          style={{ background: enabled ? config.colorGradeColor : '#38444d' }}
          aria-label="Color grade toggle"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Blend mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#38444d] text-[10px]">
            <ModeBtn
              active={config.colorGradeMode === 'lighting'}
              onClick={() => onChange({ colorGradeMode: 'lighting' })}
            >
              照明モード
            </ModeBtn>
            <ModeBtn
              active={config.colorGradeMode === 'filter'}
              onClick={() => onChange({ colorGradeMode: 'filter' })}
            >
              フィルターモード
            </ModeBtn>
          </div>

          {/* Mode description */}
          <p className="text-[9px] text-[#71767b] leading-relaxed">
            {config.colorGradeMode === 'lighting'
              ? '明るい部分に色が乗る。ポートレートにカラー照明が当たった自然な仕上がり。'
              : '全体に均一にフィルターがかかる。SNS映えするカラートーン。'}
          </p>

          {/* Preset swatches */}
          <div className="flex gap-1.5">
            {COLOR_GRADE_PRESETS.map((p) => {
              const active = config.colorGradeColor.toUpperCase() === p.hex.toUpperCase();
              return (
                <button
                  key={p.id}
                  onClick={() => onChange({ colorGradeColor: p.hex })}
                  title={p.hint}
                  className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all border ${
                    active
                      ? 'border-white/40 bg-white/5'
                      : 'border-[#38444d] hover:border-[#71767b]'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-white/20"
                    style={{ background: p.hex }}
                  />
                  <span className={`text-[9px] font-medium ${active ? 'text-white' : 'text-[#71767b]'}`}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom color row */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#71767b] flex-shrink-0">カスタム</span>
            <label className="relative cursor-pointer flex-shrink-0">
              <div
                className="w-7 h-7 rounded-lg border-2 border-[#38444d] hover:border-[#71767b] transition-colors"
                style={{ background: config.colorGradeColor }}
              />
              <input
                type="color"
                value={config.colorGradeColor}
                onChange={(e) => onChange({ colorGradeColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-[10px] text-[#38444d] font-mono">
              {config.colorGradeColor.toUpperCase()}
            </span>
          </div>

          {/* Strength slider */}
          <FilterSlider
            label="強さ"
            hint="自然な印象: 10〜40 · ドラマチック: 50〜80"
            value={config.colorGradeStrength}
            min={0} max={100}
            onChange={(v) => onChange({ colorGradeStrength: v })}
            displayFn={(v) => `${v}`}
          />
        </>
      )}
    </div>
  );
}

// ─── Animal Context Section ────────────────────────────────────────────────

interface AnimalContextSectionProps {
  config: FilterConfig;
  onChange: (partial: Partial<FilterConfig>) => void;
  targetColors?: FilterPanelProps['animalTargetColors'];
  filterMode: 'global' | 'per-segment';
  activeSegment: SegmentId;
}

function AnimalContextSection({
  config,
  onChange,
  targetColors,
  filterMode,
  activeSegment,
}: AnimalContextSectionProps) {
  const enabled = config.animalContextEnabled;

  // Color swatches: global → show all 4; per-segment → show active one
  const swatches =
    filterMode === 'global'
      ? targetColors
      : targetColors
        ? [targetColors[activeSegment]]
        : undefined;

  return (
    <div className="space-y-2">
      {/* Header row with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#e7e9ea]">
            Animal Texture Match
          </span>
          {enabled && (
            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
              ON
            </span>
          )}
        </div>
        {/* Toggle switch */}
        <button
          onClick={() => onChange({ animalContextEnabled: !enabled })}
          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
            enabled ? 'bg-amber-500' : 'bg-[#38444d]'
          }`}
          aria-label="Animal Texture Match toggle"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-[9px] text-[#71767b] leading-relaxed">
        動物パレットの色調と毛並み質感をメイン画像に微量合成し、コラージュ全体の統一感を高めます。
      </p>

      {/* Color palette preview */}
      {swatches && (
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#38444d]">動物パレット</span>
          <div className="flex gap-1">
            {swatches.map((c, i) => (
              <div
                key={i}
                title={`r:${c.r} g:${c.g} b:${c.b}`}
                className="w-3 h-3 rounded-full border border-[#38444d]/60 flex-shrink-0"
                style={{ background: `rgb(${c.r},${c.g},${c.b})` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strength slider — only when enabled */}
      {enabled && (
        <FilterSlider
          label="強さ"
          hint="色調同調 0–1.5% · 毛並みテクスチャ 0–2%"
          value={config.animalContextStrength}
          min={0} max={100}
          onChange={(v) => onChange({ animalContextStrength: v })}
          displayFn={(v) => `${v}`}
        />
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
