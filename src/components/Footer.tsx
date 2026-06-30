"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import { useRef, useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

const SOCIAL_SLOTS = [
  {
    label: "Facebook",
    href: "/",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  },
  {
    label: "LinkedIn",
    href: "/",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="4" ry="4" /><path d="M8 11v5" /><path d="M8 8v.01" /><path d="M12 16v-5" /><path d="M16 16v-3a2 2 0 0 0-4 0" /></svg>
  },
  {
    label: "X",
    href: "https://x.com/mothersbuganda?s=11",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h7.002l4.261 5.636 4.731-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
  },
];



export default function Footer() {
  const year = new Date().getFullYear();
  const revealRef = useReveal<HTMLDivElement>();
  const footerRef = useRef<HTMLElement>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    // Reveal button when scrolled down
    const onScrollBtn = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScrollBtn, { passive: true });
    return () => window.removeEventListener("scroll", onScrollBtn);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Ambient light shift based on scroll
      gsap.to(".footer-cta-mesh", {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      if (!isMobile && !prefersReduced) {
        // CTA text depths
        gsap.set(".cta-title", { z: 60 });
        gsap.set(".cta-subtitle", { z: 30 });

        // Parallax depth movements
        gsap.to(".cta-title", {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(".cta-subtitle", {
          y: 20,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        // Columns staggered reveal parallax
        const cols = gsap.utils.toArray<HTMLElement>(".footer-glass-col");
        const depths = [40, 20, 10]; // Logo, Quick Links, Office

        cols.forEach((col, i) => {
          gsap.set(col, { z: depths[i] });
          gsap.fromTo(col,
            { y: depths[i] * 2 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: ".footer-glass",
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduced) return;

    const wrapper = e.currentTarget;
    const r = wrapper.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    const mesh = wrapper.querySelector('.footer-cta-mesh') as HTMLElement;
    if (mesh) {
      mesh.style.transform = `translate(${x * -5}%, ${y * -5}%) scale(1.1)`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const mesh = e.currentTarget.querySelector('.footer-cta-mesh') as HTMLElement;
    if (mesh) {
      mesh.style.transform = '';
    }
  };

  return (
    <footer
      ref={footerRef}
      className="footer-cta-wrapper relative mt-auto bg-blue-50/50 full-bleed-left"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="footer-cta-mesh transition-transform duration-500 ease-out" />

      {/* ── Pre-footer Banner ─────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-10 sm:py-24" style={{ transformStyle: 'preserve-3d' }}>
        <div className="cta-text-3d text-center" style={{ transformStyle: 'preserve-3d' }}>
          <p className="cta-title font-serif text-xl font-medium text-[var(--color-primary)] sm:text-3xl">
            United in faith, serving together
          </p>
          <p className="cta-subtitle mt-2 text-xs sm:text-sm text-[var(--color-text-muted)] sm:text-base">
            Mothers Union Buganda — active across the dioceses
          </p>
        </div>
      </div>

      {/* ── Footer links ─────────────────────────────────── */}
      <div className="footer-glass relative z-20 text-[var(--color-text)]">
        <div
          ref={revealRef}
          className="reveal relative mx-auto max-w-6xl px-5 py-10 sm:px-8"
        >
          <div className="grid items-start gap-5 sm:gap-6 sm:grid-cols-3" style={{ transformStyle: 'preserve-3d' }}>

            {/* Brand column */}
            <div className="footer-glass-col">
              <Logo variant="logo-only" className="w-[200px] h-auto -ml-3 mb-4" />
              <p className="max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
                Supporting women, children, and families across the Buganda
                dioceses through faith, advocacy, and practical outreach.
              </p>

              {/* Social buttons */}
              <div className="mt-6 flex gap-3" style={{ transformStyle: 'preserve-3d' }}>
                {SOCIAL_SLOTS.map((s) => (
                  <div key={s.label} className="social-pill-3d">
                    <a href={s.href} aria-label={s.label}>
                      <span className="flex items-center justify-center">{s.icon}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="footer-glass-col">
              <h3 className="mb-5 text-base font-bold uppercase tracking-widest text-[var(--color-primary)]">
                Quick links
              </h3>
              <ul className="flex flex-col gap-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-[var(--color-text)] transition-colors duration-200 hover:text-[var(--color-primary)]"
                    >
                      <span className="inline-block h-1 w-1 rounded-full bg-[var(--color-primary)] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-150" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Office */}
            <div className="footer-glass-col">
              <h3 className="mb-5 text-base font-bold uppercase tracking-widest text-[var(--color-primary)]">
                Mothers' Union Buganda Office
              </h3>
              <address className="not-italic text-sm leading-relaxed text-[var(--color-text-muted)]">
                Ssentema Road<br />
                Mengo
              </address>

              {/* Active indicator */}
              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{ background: "var(--color-success)", animationDuration: "1.8s" }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-success)" }}
                  />
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Active in the community
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[rgba(0,0,0,0.08)] pt-6 text-xs text-[var(--color-text-muted)] sm:flex-row">
            <p>© {year} Mothers Union Buganda. All rights reserved.</p>
            <p className="sm:pr-16 lg:pr-20">Built with care for the community.</p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        id="scroll-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-all duration-300 hover:bg-[var(--color-primary-dark)] hover:scale-105 ${showTopBtn
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-12 opacity-0"
          }`}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </footer>
  );
}
