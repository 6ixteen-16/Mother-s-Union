"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

import { useHeroImages } from "@/hooks/useHeroImages";

const DEFAULT_SLIDES = [
  { src: "/hero-3.jpeg", alt: "Mothers Union Buganda activities" },
  { src: "/hero-4.jpeg", alt: "Mothers Union Buganda gathering" },
];

export default function Hero() {
  const { images } = useHeroImages();
  const slides = images.length > 0
    ? images.map(img => ({ src: img.storagePath, alt: "Hero image" }))
    : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const bgInnerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasScrolledDown = useRef(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Slide change with crossfade guard ──────────────────────────────────
  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setCurrent(index);
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
    }, 1500); // matches CSS transition duration
  }, [transitioning]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo, slides.length]);

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo, slides.length]);

  // ── Auto-advance on scroll back to top ────────────────────────────────
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;

      if (y > 100) {
        hasScrolledDown.current = true;
      }

      if (y < 50 && hasScrolledDown.current) {
        // User scrolled back to top — advance slide after a short delay
        hasScrolledDown.current = false;
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = setTimeout(() => {
          setCurrent((c) => (c + 1) % slides.length);
        }, 400);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  // ── Scroll parallax ───────────────────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (bgRef.current) bgRef.current.style.transform = `translateY(${y * 0.4}px)`;
        if (midRef.current) midRef.current.style.transform = `translateY(${y * 0.25}px)`;
        if (fgRef.current) fgRef.current.style.transform = `translateY(${y * 0.15}px)`;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Mouse-parallax tilt on hero icon ─────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const icon = iconRef.current;
    if (!section || !icon) return;
    const noHover = window.matchMedia("(hover: none)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (noHover || prefersReduced) return;
    let rafId: number;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = section!.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
        icon!.style.transform = `rotateX(${-dy * 14}deg) rotateY(${dx * 18}deg) translateZ(0)`;
        if (bgInnerRef.current)
          bgInnerRef.current.style.transform = `translate(${-dx * 16}px, ${-dy * 16}px)`;
      });
    }
    function onLeave() {
      icon!.style.transform = "";
      if (bgInnerRef.current) bgInnerRef.current.style.transform = "";
    }
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ── Keyboard nav ──────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[88vh] items-center justify-center overflow-hidden full-bleed-left group"
      aria-label="Hero"
    >
      {/* ── Layer 1: Crossfade slide stack ─────────────────────────────── */}
      <div
        ref={bgRef}
        className="absolute inset-x-0 -top-16 bottom-0"
        style={{ willChange: "transform" }}
        aria-hidden="true"
      >
        <div
          ref={bgInnerRef}
          className="absolute inset-0"
          style={{ transition: "transform 0.1s linear" }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className="absolute inset-0 animate-[hero-bg-zoom_1.5s_ease-out_forwards]"
              style={{
                opacity: i === current ? 1 : 0,
                transition: "opacity 1500ms ease-in-out",
                zIndex: i === current ? 1 : 0,
              }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-[center_30%]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Layer 2: Foreground content panel ───────────────────────────── */}
      <div
        ref={fgRef}
        className="relative z-10 mx-auto flex w-[90%] max-w-3xl flex-col items-center justify-center rounded-[2rem] bg-black/30 p-8 text-center sm:p-12 md:p-16"
        style={{ willChange: "transform" }}
      >
        {/* Floating MU crest */}
        <div
          ref={iconRef}
          className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white p-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-[hero-float_6s_ease-in-out_infinite]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Image
            src="/mu-crest.png"
            alt="Mothers Union crest"
            width={52}
            height={52}
            className="h-14 w-14 object-contain"
            priority
          />
        </div>

        <h1 className="font-serif text-4xl font-medium leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
          Mothers Union Buganda
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:text-lg">
          Supporting women, children, and families across the Buganda dioceses
          through faith, advocacy, and community outreach.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="#community-work"
            className="btn-press rounded-[var(--radius-full)] bg-white px-7 py-3 text-sm font-semibold text-[var(--color-primary)] shadow-[var(--shadow-lg)] transition-all duration-200 hover:bg-[var(--color-surface)] hover:-translate-y-0.5"
          >
            Explore Community Work
          </a>
          <Link
            href="/contact"
            className="btn-press rounded-[var(--radius-full)] border border-white/50 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
          >
            Get in Touch
          </Link>
        </div>

        {/* Dot indicators */}
        <div className="mt-10 flex items-center justify-center gap-3" role="tablist" aria-label="Slide indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              style={{
                width: i === current ? "2.5rem" : "0.5rem",
                background: i === current ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scroll cue (Moved to bottom of screen) ────────────────────── */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70" aria-hidden="true">
        <div className="animate-bounce drop-shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-xs tracking-widest uppercase font-medium drop-shadow-md">Scroll</span>
      </div>

      {/* ── Prev / Next arrow buttons ─────────────────────────────────── */}
      <button
        onClick={goPrev}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 text-white/80 transition-all duration-200 hover:bg-black/40 hover:text-white sm:left-5 sm:h-12 sm:w-12 shadow-lg border border-white/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next image"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/20 text-white/80 transition-all duration-200 hover:bg-black/40 hover:text-white sm:right-5 sm:h-12 sm:w-12 shadow-lg border border-white/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}
