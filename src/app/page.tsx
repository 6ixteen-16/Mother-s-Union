"use client";

import { useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import AccordionSection from "@/components/AccordionSection";
import CommunityWorkPanel from "@/components/CommunityWorkPanel";
import CoreValues from "@/components/CoreValues";
import Odometer from "@/components/Odometer";
import { useOrgContent } from "@/hooks/useOrgContent";
import { useReveal } from "@/hooks/useReveal";
import { useRevealChildren } from "@/hooks/useRevealChildren";

/* Adds CSS-perspective mouse-tilt to any card with data-tilt */
function useTilt(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    // Only apply on true pointer devices to avoid sticky touch hovers
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduced) return;

    const cards = containerRef.current?.querySelectorAll<HTMLElement>("[data-tilt]");
    if (!cards) return;

    const handlers: Array<() => void> = [];

    cards.forEach((card) => {
      function move(e: MouseEvent) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 18}deg) translateY(-4px)`;
      }
      function leave() {
        card.style.transform = "";
      }
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      handlers.push(() => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
    });

    return () => handlers.forEach((fn) => fn());
  }, [containerRef]);
}

const STATS = [
  { value: "10k+", label: "Women supported" },
  { value: "4", label: "Community pillars" },
];

export default function Home() {
  const { content } = useOrgContent();
  const leftRef = useRevealChildren<HTMLDivElement>();
  const rightRef = useReveal<HTMLDivElement>();
  const statsRef = useRef<HTMLDivElement>(null);

  useTilt(statsRef as React.RefObject<HTMLElement>);

  // Trigger stat-card fly-in + border-light when scrolled into view
  useEffect(() => {
    const container = statsRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>(".stat-card");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
        else e.target.classList.remove("is-visible");
      }),
      { threshold: 0.2 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <main className="flex-1">
        <Hero />

        {/* ── Stats strip ─────────────────────────────────── */}
        <div className="border-y border-[var(--color-border)] bg-[var(--color-surface)] full-bleed-left">
          <div
            ref={statsRef}
            className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-6 sm:px-8"
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                data-tilt
                className={`stat-card stat-card-delay-${i + 1} flex flex-col items-center py-8 px-4 text-center ${
                  i === 0 ? "stat-card-cut-tl" : i === 1 ? "stat-card-cut-br" : ""
                }`}
              >
                <span className="font-serif text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
                  <Odometer value={s.value} delay={i * 150} />
                </span>
                <span className="mt-1 text-xs uppercase tracking-widest text-[var(--color-text-muted)] sm:text-sm">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── About / Vision / Mission ─────────────────────── */}
        <section
          id="about"
          className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <div
            ref={leftRef}
            className="flex flex-col gap-4"
          >
            <div className="reveal-left reveal-seq-1">
              <AccordionSection
                title="About Us"
                body={content.about}
                defaultOpen
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
              />
            </div>
            <div className="reveal-right reveal-seq-2">
              <AccordionSection 
                title="Vision" 
                body={content.vision}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              />
            </div>
            <div className="reveal-up reveal-seq-3">
              <AccordionSection 
                title="Mission" 
                body={content.mission}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
              />
            </div>
          </div>
        </section>

        {/* ── Core Values ───────────────────────────────────── */}
        <CoreValues />

        {/* ── Community Work ────────────────────────────────── */}
        <section
          id="community-work-section"
          className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20"
        >
          <div ref={rightRef} className="reveal">
            <CommunityWorkPanel />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
