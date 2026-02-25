'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (img: HTMLImageElement, objectUrl: string) => void;
  thumbnailUrl: string;
  onReset: () => void;
}

export function DropZone({ onFileSelected, thumbnailUrl, onReset }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => onFileSelected(img, url);
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    },
    [onFileSelected]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !thumbnailUrl && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
        ${thumbnailUrl ? 'cursor-default border-[#38444d]' : 'cursor-pointer'}
        ${isDragging ? 'border-[#1d9bf0] bg-[#1d9bf0]/8' : 'border-[#38444d] hover:border-[#71767b]'}`}
    >
      {thumbnailUrl ? (
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt="Source"
            className="w-full max-h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="flex items-center gap-1.5 bg-[#1d9bf0] text-white text-sm px-3 py-1.5 rounded-full font-medium hover:bg-[#1a8cd8]"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              変更
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="flex items-center gap-1.5 bg-white/20 text-white text-sm px-3 py-1.5 rounded-full font-medium hover:bg-white/30"
            >
              <X className="h-3.5 w-3.5" />
              クリア
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <Upload className="mx-auto h-8 w-8 text-[#71767b] mb-3" />
          <p className="text-[#e7e9ea] text-sm font-medium">
            画像をドロップ
          </p>
          <p className="text-[#71767b] text-xs mt-1">
            またはクリックして選択
          </p>
          <p className="text-[#38444d] text-xs mt-3">
            JPG · PNG · WebP · GIF
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
