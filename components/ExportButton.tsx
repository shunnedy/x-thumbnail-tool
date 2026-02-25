'use client';

import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
  disabled: boolean;
}

export function ExportButton({ onExport, isExporting, disabled }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={disabled || isExporting}
      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200
        ${disabled || isExporting
          ? 'bg-[#38444d] text-[#71767b] cursor-not-allowed'
          : 'bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] active:scale-[0.98]'
        }`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          エクスポート中...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          5段スタック 1.png〜4.png を書き出し
        </>
      )}
    </button>
  );
}
