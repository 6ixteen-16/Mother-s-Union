"use client";

import { useEffect, useRef } from "react";

const VALUES = [
  {
    number: "01",
    title: "Faith & Christian Commitment",
    body: "The Association is rooted in the Anglican Christian faith. Every activity, project, and relationship is guided by the teachings of Christ, prayer, worship, and the service of God.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Marriage & Family",
    body: "Mothers' Union upholds Christ's teaching on the sanctity of marriage and the importance of stable family life, working actively to promote, protect, and strengthen marriages and families.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Service & Volunteerism",
    body: "The Association is voluntary and non-profit making. Members are called to serve communities selflessly, helping those whose families have met with adversity.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Unity & Fellowship",
    body: "The Association fosters unity, love, and sisterhood among all members across all six Buganda diocesess, and maintains fellowship with Mothers' Union members beyond Buganda.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Integrity & Accountability",
    body: "All funds and resources are managed with transparency. Financial transactions require joint signatures of the President, Treasurer, and Secretary.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    number: "06",
    title: "Children & Youth Development",
    body: "Committed to nurturing the next generation — teaching Christian values, running Sunday schools, providing youth counselling, and operating educational institutions from infant level upward.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    number: "07",
    title: "Empowerment & Sustainability",
    body: "The Association initiates development projects that improve members' living standards and enable the organisation to sustain itself financially and operationally.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    number: "08",
    title: "Prayer & Worship",
    body: "A worldwide fellowship united in prayer, worship, and service forms the spiritual backbone of the Association's life and work.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
];

import { useOrgContent } from "@/hooks/useOrgContent";

export default function CoreValues() {
  const { content, loading } = useOrgContent();
  const gridRef = useRef<HTMLDivElement>(null);

  let valuesArray = VALUES;
  if (!loading && content.coreValues) {
    try {
      const parsed = JSON.parse(content.coreValues);
      if (Array.isArray(parsed)) {
        valuesArray = VALUES.map((v, i) => ({
          ...v,
          title: parsed[i]?.title || v.title,
          body: parsed[i]?.body || v.body,
        }));
      }
    } catch (e) {
      console.error("Failed to parse core values", e);
    }
  }

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".core-value-card"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          const idx = parseInt(card.dataset.idx ?? "0", 10);

          if (entry.isIntersecting) {
            // — ENTER: animate in
            const delay = prefersReduced ? 0 : idx * 150;
            card.style.willChange = "transform, opacity";
            setTimeout(() => {
              card.classList.add("is-built");
              setTimeout(() => { card.style.willChange = ""; }, 800);
            }, delay);
          } else {
            // — EXIT: reset so next scroll-in replays animation
            card.classList.remove("is-built");
            card.style.willChange = "";
          }
        });
      },
      { threshold: 0.25 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      aria-labelledby="core-values-heading"
    >
      {/* Section header */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Our Foundation
        </p>
        <h2
          id="core-values-heading"
          className="font-serif text-3xl font-medium text-[var(--color-text)] sm:text-4xl"
        >
          Core Values
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-[var(--color-primary-light)]" />
      </div>

      {/* 3D Values grid */}
      <div
        ref={gridRef}
        className="core-values-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {valuesArray.map((v, i) => (
          <div
            key={v.number}
            className="core-value-card"
            data-idx={i}
          >
            {/* 3D scene — all faces live here */}
            <div className="cvcard-scene">
              {/* BACK FACE — brand colour solid slab */}
              <div className="cvcard-back" aria-hidden="true" />

              {/* EDGE FACES — 8px depth geometry */}
              <div className="cvcard-edge cvcard-edge-t" aria-hidden="true" />
              <div className="cvcard-edge cvcard-edge-b" aria-hidden="true" />
              <div className="cvcard-edge cvcard-edge-l" aria-hidden="true" />
              <div className="cvcard-edge cvcard-edge-r" aria-hidden="true" />

              {/* FRONT FACE — actual card content */}
              <div className="cvcard-front group p-6">
                {/* Ghost number watermark */}
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-3 select-none font-serif text-6xl font-bold leading-none text-[var(--color-primary)] opacity-[0.06]"
                >
                  {v.number}
                </span>

                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-blue-50 text-[var(--color-primary)] transition-colors duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  {v.icon}
                </div>

                {/* Text */}
                <h3 className="mb-2 font-serif text-[1.05rem] font-semibold leading-snug text-[var(--color-text)]">
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {v.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
