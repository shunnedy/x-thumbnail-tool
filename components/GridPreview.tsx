'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3, Share, Loader2, Twitter, Layers } from 'lucide-react';

interface GridPreviewProps {
  processedSegments: HTMLCanvasElement[];
  stackedSegments: HTMLCanvasElement[];
  isProcessing: boolean;
}

export function GridPreview({ processedSegments, stackedSegments, isProcessing }: GridPreviewProps) {
  const [tab, setTab] = useState<'x' | 'stack'>('x');
  const [xUrls, setXUrls] = useState<string[]>(['', '', '', '']);
  const [stackUrls, setStackUrls] = useState<string[]>(['', '', '', '']);

  const hasProcessed = processedSegments.length >= 4;
  const hasStacked = stackedSegments.length >= 4;

  // X-preview: 16:9 thumbnails from processedSegments (1280×720 → 480×270)
  useEffect(() => {
    if (!hasProcessed) return;
    const urls = processedSegments.map((canvas) => {
      const p = document.createElement('canvas');
      p.width = 480; p.height = 270;
      p.getContext('2d')!.drawImage(canvas, 0, 0, 480, 270);
      return p.toDataURL('image/jpeg', 0.88);
    });
    setXUrls(urls);
  }, [processedSegments, hasProcessed]);

  // Stack preview: scaled-down 5-layer images (1280×3600 → 160×450)
  useEffect(() => {
    if (!hasStacked) return;
    const W = 160, H = 450;
    const urls = stackedSegments.map((stack) => {
      const p = document.createElement('canvas');
      p.width = W; p.height = H;
      p.getContext('2d')!.drawImage(stack, 0, 0, W, H);
      return p.toDataURL('image/jpeg', 0.82);
    });
    setStackUrls(urls);
  }, [stackedSegments, hasStacked]);

  return (
    <div className="w-full max-w-[620px]">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#71767b] text-xs font-semibold uppercase tracking-widest">Preview</span>
        <div className="flex-1 h-px bg-[#38444d]" />
        {isProcessing && (
          <div className="flex items-center gap-1.5 text-[#1d9bf0]">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">処理中</span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 bg-[#15202b] rounded-xl p-1 border border-[#38444d]">
        <TabBtn active={tab === 'x'} onClick={() => setTab('x')}>
          <Twitter className="h-3.5 w-3.5" />
          Xタイムライン
        </TabBtn>
        <TabBtn active={tab === 'stack'} onClick={() => setTab('stack')}>
          <Layers className="h-3.5 w-3.5" />
          5段スタック確認
        </TabBtn>
      </div>

      {tab === 'x' ? (
        <XTimelineView imageUrls={xUrls} hasImages={hasProcessed} />
      ) : (
        <StackView stackUrls={stackUrls} hasImages={hasStacked} />
      )}
    </div>
  );
}

// ─── X Timeline View ─────────────────────────────────────────────────────

function XTimelineView({ imageUrls, hasImages }: { imageUrls: string[]; hasImages: boolean }) {
  return (
    <div>
      <div className="bg-[#15202b] rounded-2xl border border-[#38444d]">
        <div className="p-4">
          {/* User row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38444d] to-[#253341] flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-white font-bold text-sm">あなたの名前</span>
                <span className="text-[#71767b] text-sm">@yourhandle · 1h</span>
              </div>
              <p className="text-[#e7e9ea] text-sm mt-0.5">4枚グリッドで1枚の絵 ✨</p>
            </div>
          </div>

          {/*
            X 4-image grid: 16:9 overall container
            Left column:  photo[0]=TL (top), photo[2]=BL (bottom)
            Right column: photo[1]=TR (top), photo[3]=BR (bottom)
          */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ position: 'relative', paddingBottom: '56.25%', background: '#38444d' }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                gap: '2px',
              }}
            >
              {/* Left column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[0, 2].map((i) => (
                  <div key={i} style={{ flex: 1, overflow: 'hidden', background: '#253341' }}>
                    {hasImages && imageUrls[i] ? (
                      <img
                        src={imageUrls[i]}
                        alt={`Segment ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-[#38444d] text-2xl font-bold">{i === 0 ? 1 : 3}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[1, 3].map((i) => (
                  <div key={i} style={{ flex: 1, overflow: 'hidden', background: '#253341' }}>
                    {hasImages && imageUrls[i] ? (
                      <img
                        src={imageUrls[i]}
                        alt={`Segment ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-[#38444d] text-2xl font-bold">{i === 1 ? 2 : 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="flex items-center mt-3 text-[#71767b]" style={{ gap: '20px' }}>
            <EngageBtn icon={<MessageCircle className="h-[18px] w-[18px]" />} count="12" hover="hover:text-[#1d9bf0]" />
            <EngageBtn icon={<Repeat2 className="h-[18px] w-[18px]" />} count="34" hover="hover:text-green-400" />
            <EngageBtn icon={<Heart className="h-[18px] w-[18px]" />} count="256" hover="hover:text-pink-500" />
            <EngageBtn icon={<BarChart3 className="h-[18px] w-[18px]" />} count="1.2K" hover="hover:text-[#1d9bf0]" />
            <button className="ml-auto text-[#71767b] hover:text-[#1d9bf0] transition-colors">
              <Share className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {!hasImages && (
        <p className="text-center text-[#71767b] text-sm mt-6">
          画像をアップロードするとプレビューが表示されます
        </p>
      )}

      {hasImages && (
        <div className="mt-4 bg-[#1e2732] rounded-xl border border-[#38444d] p-3">
          <p className="text-[#71767b] text-xs font-semibold uppercase tracking-widest mb-2">投稿順</p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="text-center">
                <div className="w-full aspect-square bg-[#253341] rounded-lg flex items-center justify-center text-[#1d9bf0] font-bold text-sm">{n}</div>
                <span className="text-[#71767b] text-[10px] mt-1 block">{['左上','右上','左下','右下'][n-1]}</span>
              </div>
            ))}
          </div>
          <p className="text-[#71767b] text-[11px] mt-2">
            X では 1→4 の順に添付し一括投稿してください
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Stack View ───────────────────────────────────────────────────────────

function StackView({ stackUrls, hasImages }: { stackUrls: string[]; hasImages: boolean }) {
  return (
    <div>
      {/* Info banner */}
      <div className="bg-[#1e2732] rounded-xl border border-[#38444d] p-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1d9bf0] mt-1 flex-shrink-0" />
          <p className="text-[#71767b] text-xs leading-relaxed">
            <span className="text-[#e7e9ea] font-medium">5段スタック構成:</span>{' '}
            上下各2枚のダミー画像を結合。Xのタイムラインでは各画像の中央
            <span className="text-[#1d9bf0] font-medium">（青枠部分 = 3段目）</span>のみが表示され、上下ダミーは隠れます。
          </p>
        </div>
      </div>

      {/* 4 stacks side by side */}
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="text-center text-[#71767b] text-[10px] mb-1.5 font-medium">
              ファイル {i + 1}
            </div>
            {/* paddingBottom = (720×5/1280)×100 = 281.25% */}
            <div className="relative w-full" style={{ paddingBottom: '281.25%' }}>
              <div className="absolute inset-0 rounded-lg overflow-hidden bg-[#253341]">
                {hasImages && stackUrls[i] ? (
                  <>
                    <img src={stackUrls[i]} alt={`Stack ${i + 1}`} className="w-full h-full object-cover block" />

                    {/* Darken Layer 1-2 (top 40%) */}
                    <div className="absolute top-0 left-0 right-0 bg-black/55" style={{ height: '40%' }} />

                    {/* Blue border on Layer 3 (40%–60%) */}
                    <div
                      className="absolute left-0 right-0 border-2 border-[#1d9bf0] pointer-events-none"
                      style={{ top: '40%', height: '20%' }}
                    />

                    {/* Darken Layer 4-5 (bottom 40%) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/55" style={{ height: '40%' }} />

                    {/* MAIN label */}
                    <div
                      className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
                      style={{ top: '40%', height: '20%' }}
                    >
                      <span className="text-white text-[9px] font-bold bg-[#1d9bf0]/70 px-1.5 py-0.5 rounded">
                        MAIN
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#38444d] text-lg font-bold">{i + 1}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Layer labels */}
            {hasImages && (
              <div className="mt-1.5 space-y-0.5 text-[9px] text-[#38444d] text-center">
                <div>① ダミー</div>
                <div>② ダミー</div>
                <div className="text-[#1d9bf0] font-semibold">③ メイン</div>
                <div>④ ダミー</div>
                <div>⑤ ダミー</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!hasImages && (
        <p className="text-center text-[#71767b] text-sm mt-6">
          画像をアップロードするとスタックプレビューが表示されます
        </p>
      )}

      {/* Dimension info */}
      {hasImages && (
        <div className="mt-4 bg-[#1e2732] rounded-xl border border-[#38444d] p-3 text-center">
          <p className="text-[#71767b] text-xs">
            書き出し解像度: <span className="text-[#e7e9ea] font-medium">1280 × 3600 px</span>
            {' '}(16:45 アスペクト比)
          </p>
        </div>
      )}
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────

function TabBtn({
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
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#1d9bf0] text-white'
          : 'text-[#71767b] hover:text-[#e7e9ea]'
      }`}
    >
      {children}
    </button>
  );
}

function EngageBtn({ icon, count, hover }: { icon: React.ReactNode; count: string; hover: string }) {
  return (
    <button className={`flex items-center gap-1 transition-colors ${hover}`}>
      {icon}
      <span className="text-xs">{count}</span>
    </button>
  );
}
