"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/lib/types";

interface LightboxProps {
  photos: Photo[];
  startIndex: number;
  getUrl: (photo: Photo) => string;
  onClose: () => void;
}

export default function Lightbox({
  photos,
  startIndex,
  getUrl,
  onClose,
}: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const photo = photos[index];

  const goNext = () => setIndex((i) => (i + 1) % photos.length);
  const goPrev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);

  useEffect(() => {
    setMounted(true);
    containerRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      // Basic focus trap
      if (e.key === "Tab") {
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 60) goPrev();
    if (delta < -60) goNext();
  }

  if (!photo || !mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${photo.caption}`}
      className="fixed inset-0 z-[95] flex flex-col bg-black/85 overflow-hidden"
      style={{ animation: "lb-fade 220ms ease-out" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 blur-[60px] scale-110 transition-all duration-500 bg-center bg-cover"
        style={{ backgroundImage: `url(${getUrl(photo)})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium text-white/80 drop-shadow-md">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close photo viewer"
          className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-md transition-colors hover:bg-black/40 hover:text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex flex-1 min-h-0 items-center justify-center px-4 sm:px-12 py-4">
        {photos.length > 1 && (
          <button
            onClick={goPrev}
            aria-label="Previous photo"
            className="btn-press absolute left-2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-md transition-colors hover:bg-black/40 hover:text-white sm:left-4"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <img
          key={photo.id}
          src={getUrl(photo)}
          alt={photo.caption}
          className="max-h-full max-w-full rounded-[var(--radius-md)] object-contain shadow-2xl ring-1 ring-white/10"
          style={{ animation: "lb-photo 280ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />

        {photos.length > 1 && (
          <button
            onClick={goNext}
            aria-label="Next photo"
            className="btn-press absolute right-2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-md transition-colors hover:bg-black/40 hover:text-white sm:right-4"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {photo.caption && (
        <div className="relative z-10 px-6 pb-8 pt-4">
          <p className="mx-auto max-w-3xl text-center text-sm font-medium leading-relaxed text-white drop-shadow-md">
            {photo.caption}
          </p>
        </div>
      )}

      <style>{`
        @keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lb-photo {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
