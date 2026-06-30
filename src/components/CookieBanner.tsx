"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "mu_buganda_cookie_consent";

export default function CookieBanner() {
  // Start hidden on both server and client to avoid hydration mismatch.
  // After mount, check localStorage and show if consent hasn't been given.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage blocked (private browsing etc.) — show the banner
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Storage blocked — still dismiss for this session
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--color-border)] bg-white/95 px-5 py-4 shadow-[var(--shadow-lg)] backdrop-blur-md animate-[slide-up_360ms_var(--ease-smooth)] sm:px-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-[var(--color-text-muted)]">
          This site uses basic, anonymous analytics cookies to understand
          how visitors use our pages. By continuing, you agree to this.
          See our{" "}
          <a href="/privacy" className="font-medium text-[var(--color-primary)] underline">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
        <button
          onClick={accept}
          className="btn-press shrink-0 rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Got it
        </button>
      </div>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
