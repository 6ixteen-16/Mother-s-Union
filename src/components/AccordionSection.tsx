"use client";

import { useState, useRef } from "react";

interface AccordionSectionProps {
  title: string;
  body: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export default function AccordionSection({
  title,
  body,
  defaultOpen = false,
  icon,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    // Disable tilt on touch devices OR if the card is open
    if (open) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduced) return;

    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(500px) rotateX(${-y * 6}deg) rotateY(${x * 10}deg)`;
  }

  function resetTilt() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
      className={`overflow-hidden rounded-[var(--radius-md)] border bg-white transition-[transform,box-shadow,border-color] duration-300 ${
        open
          ? "border-[var(--color-primary-light)] shadow-[var(--shadow-lg)]"
          : "border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
      }`}
      style={{ transformOrigin: "center" }}
    >
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (cardRef.current) cardRef.current.style.transform = ""; // Reset tilt on open
        }}
        aria-expanded={open}
        className="flex w-full items-center justify-between bg-[var(--color-primary)] px-5 py-3.5 text-left transition-colors duration-200 hover:bg-[var(--color-primary-dark)]"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span
              className={`flex items-center justify-center text-white transition-all duration-300 ${
                open ? "scale-110 opacity-100" : "scale-90 opacity-80"
              }`}
            >
              {icon}
            </span>
          )}
          <span className="font-serif text-lg font-medium text-white">
            {title}
          </span>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-white transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-400 ease-out bg-[var(--color-surface)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden min-h-0">
          <p className="px-5 py-5 text-[15px] leading-relaxed text-[var(--color-text)]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
