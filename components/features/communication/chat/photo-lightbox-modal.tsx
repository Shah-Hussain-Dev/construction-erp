'use client';

import React from 'react';
import { X, CaretLeft, CaretRight, DownloadSimple } from '@phosphor-icons/react';

interface PhotoLightboxModalProps {
  photos: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (idx: number) => void;
}

export function PhotoLightboxModal({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
}: PhotoLightboxModalProps) {
  if (!isOpen || !photos.length) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handlePrev = () => {
    onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    onSelectIndex((currentIndex + 1) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
        <div className="text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
          Site Photo {currentIndex + 1} of {photos.length} • Block A Foundation
        </div>
        <div className="flex items-center gap-2">
          <a
            href={currentPhoto}
            download={`site_photo_${currentIndex + 1}.jpg`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/20 text-white transition flex items-center justify-center"
            title="Download image"
          >
            <DownloadSimple size={20} />
          </a>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/20 text-white transition flex items-center justify-center"
            title="Close"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
        <img
          src={currentPhoto}
          alt={`Site photo ${currentIndex + 1}`}
          className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
        />

        {/* Prev / Next controls */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-[-20px] md:left-[-50px] p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition"
              aria-label="Previous photo"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-[-20px] md:right-[-50px] p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition"
              aria-label="Next photo"
            >
              <CaretRight size={24} weight="bold" />
            </button>
          </>
        )}
      </div>

      {/* Bottom thumbnails */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/20">
          {photos.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                idx === currentIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
