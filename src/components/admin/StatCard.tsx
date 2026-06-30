"use client";

import { useEffect, useState } from "react";

interface StatCardProps {
  label: string;
  value: number;
  accent?: "primary" | "success" | "muted";
}

export default function StatCard({
  label,
  value,
  accent = "primary",
}: StatCardProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 700;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  const colorMap = {
    primary: "text-[var(--color-primary)]",
    success: "text-[var(--color-success)]",
    muted: "text-[var(--color-text-muted)]",
  };

  return (
    <div className="card-lift rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className={`mt-2 font-serif text-3xl font-medium ${colorMap[accent]}`}>
        {display}
      </p>
    </div>
  );
}
