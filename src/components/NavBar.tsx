"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CommunityFolder } from "@/lib/types";
import Logo from "@/components/Logo";
import { FOLDER_ICONS } from "@/lib/icons";
import { useAllFolders } from "@/hooks/useGallery";

const NAV_LINKS = [
  { 
    href: "/", 
    label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    )
  },
  { 
    href: "/#about", 
    label: "About",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    )
  },
  { 
    href: "/blog", 
    label: "Blog",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    )
  },
  { 
    href: "/contact", 
    label: "Contact",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
    )
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { folders } = useAllFolders();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, opacity: 0 });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateIndicatorToActive = () => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector('.nav-item.active') as HTMLElement;
    if (activeEl) {
      setIndicator({
        top: activeEl.offsetTop,
        height: activeEl.offsetHeight,
        opacity: 1
      });
    } else {
      setIndicator(prev => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    updateIndicatorToActive();
  }, [pathname]);

  const handleHover = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    setIndicator({
      top: el.offsetTop,
      height: el.offsetHeight,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    updateIndicatorToActive();
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/90 shadow-sm backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="btn-press">
            <Logo variant="crest" className="h-10 w-10 mix-blend-multiply" />
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors hover:bg-gray-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ top: '64px' }}>
        <nav className="flex flex-col gap-2 p-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-4 rounded-xl p-4 text-lg font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
            >
              <span className="text-[var(--color-primary)]">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <p className="px-4 pb-2 text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Community Work
            </p>
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/gallery/${folder.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 rounded-xl p-4 text-[17px] text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
              >
                <span className="text-[var(--color-primary)] shrink-0" aria-hidden="true">
                  {FOLDER_ICONS[folder.id.toLowerCase()] || FOLDER_ICONS.default}
                </span>
                {folder.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar-nav group fixed left-6 top-1/2 z-50 hidden h-fit -translate-y-1/2 flex-col rounded-[2rem] border border-[var(--color-border)] bg-blue-50/70 py-4 shadow-[var(--shadow-xl)] backdrop-blur-xl transition-[width] duration-300 md:flex w-[var(--sidebar-w-collapsed)] hover:w-[var(--sidebar-w-expanded)]">
        <div className="flex h-24 shrink-0 items-center justify-center group-hover:justify-start group-hover:px-6">
          <Link href="/" className="logo-hover shrink-0 transition-transform hover:scale-105">
            <Logo variant="crest" className="h-10 w-10 mix-blend-multiply sm:h-12 sm:w-12" />
          </Link>
        </div>

        <nav 
          className="relative flex flex-1 flex-col gap-2 px-3 py-4" 
          ref={navRef}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gliding Indicator */}
          <div 
            className="absolute left-3 w-1 rounded-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
            style={{ 
              top: indicator.top, 
              height: indicator.height, 
              opacity: indicator.opacity,
              transform: indicator.opacity ? 'translateX(0)' : 'translateX(-10px)'
            }}
          />

          {NAV_LINKS.map((link) => {
            // Strip hash so "/#about" compares cleanly against pathname "/"
            const linkPath = link.href.split('#')[0] || '/';
            // Home: exact match only. Others: exact OR prefix (e.g. /blog matches /blog/[id])
            const isActive = linkPath === '/'
              ? pathname === '/'
              : pathname === linkPath || pathname.startsWith(linkPath + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={handleHover}
                className={`nav-item flex items-center gap-2 overflow-hidden rounded-xl p-3 transition-all duration-300 ${isActive ? 'active text-[var(--color-primary)]' : 'text-[var(--color-text)] hover:text-[var(--color-primary)]'}`}
              >
                <span className="flex w-[40px] shrink-0 items-center justify-center transition-transform duration-300 group-hover/item:scale-110">
                  {link.icon}
                </span>
                <span className="whitespace-nowrap font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Community Work Dropdown/Flyout */}
          <div className="relative mt-2" ref={dropdownRef}>
            <button
              onMouseEnter={handleHover}
              onClick={() => setDropdownOpen((o) => !o)}
              className={`nav-item flex w-full items-center gap-2 overflow-hidden rounded-xl p-3 transition-all duration-300 ${pathname.startsWith('/gallery') ? 'active text-[var(--color-primary)]' : 'text-[var(--color-text)] hover:text-[var(--color-primary)]'}`}
              aria-expanded={dropdownOpen}
            >
              <span className="flex w-[40px] shrink-0 items-center justify-center transition-transform duration-300 group-hover/item:scale-110">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
              <span className="flex flex-1 items-center justify-between whitespace-nowrap font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Community Work
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </span>
            </button>

            {/* Flyout Menu */}
            <div
              className={`absolute left-full top-0 ml-2 w-56 origin-left rounded-xl border border-[var(--color-border)] bg-white/95 shadow-[var(--shadow-xl)] backdrop-blur-xl transition-all duration-400 ease-[var(--ease-smooth)] ${
                dropdownOpen
                  ? "translate-x-0 rotate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-x-4 rotate-y-12 scale-95 opacity-0"
              }`}
              style={{ perspective: '800px' }}
            >
              <div className="p-2">
                {folders.length === 0 && (
                  <p className="p-3 text-sm text-[var(--color-text-muted)]">No folders published.</p>
                )}
                {folders.map((folder, i) => (
                  <Link
                    key={folder.id}
                    href={`/gallery/${folder.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-[var(--color-text)] transition-colors duration-200 hover:bg-blue-50/50 hover:text-[var(--color-primary)]"
                    style={{ transitionDelay: dropdownOpen ? `${i * 40}ms` : '0ms' }}
                  >
                    <span className="text-[var(--color-primary)] shrink-0" aria-hidden="true">
                      {FOLDER_ICONS[folder.id.toLowerCase()] || FOLDER_ICONS.default}
                    </span>
                    {folder.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
