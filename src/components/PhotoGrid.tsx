"use client";

import { useState, useRef, useEffect } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "@/components/Lightbox";
import EmptyState from "@/components/EmptyState";
import { useRevealChildren } from "@/hooks/useRevealChildren";

interface PhotoGridProps {
  photos: Photo[];
  getUrl: (photo: Photo) => string;
  loading?: boolean;
}

/** Adds mouse-parallax tilt only on real pointer (hover) devices */
function useTilting(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    // Only activate on devices with a real cursor
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduced) return;

    const cards = containerRef.current?.querySelectorAll<HTMLElement>("[data-tilt]");
    if (!cards) return;
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      let rafId: number;

      function move(e: MouseEvent) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 14}deg) translateY(-6px) scale(1.02)`;
          card.style.boxShadow = `var(--shadow-lg), 0 20px 60px -16px rgb(0 68 204 / 0.20)`;
        });
      }
      function leave() {
        cancelAnimationFrame(rafId);
        card.style.transform = "";
        card.style.boxShadow = "";
      }

      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [enabled]);

  return containerRef;
}

export default function PhotoGrid({
  photos,
  getUrl,
  loading = false,
}: PhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const tiltRef = useTilting(!loading && photos.length > 0);
  const revealRef = useRevealChildren<HTMLDivElement>();

  // Merge both refs onto the same element
  function setGridRef(el: HTMLDivElement | null) {
    (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof revealRef === "function") {
      (revealRef as (value: HTMLDivElement | null) => void)(el);
    } else if (revealRef && "current" in revealRef) {
      (revealRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton aspect-[4/3] w-full rounded-[var(--radius-md)]"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        icon="photos"
        title="No photos published yet"
        description="Check back soon — new photos are added regularly."
      />
    );
  }

  return (
    <>
      <div
        ref={setGridRef}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            data-tilt
            onClick={() => setActiveIndex(i)}
            className="reveal group flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white text-left shadow-[var(--shadow-sm)]"
            style={{
              transitionDelay: `${Math.min(i * 60, 360)}ms`,
              transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s cubic-bezier(0.22,1,0.36,1)",
              transformOrigin: "center",
            }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-surface)]">
              <img
                src={getUrl(photo)}
                alt={photo.caption}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="w-full border-t border-[var(--color-border)] p-4">
              <p className="line-clamp-2 text-sm font-medium leading-relaxed text-[var(--color-text)]">
                {photo.caption}
              </p>
            </div>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={activeIndex}
          getUrl={getUrl}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
