"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUPER_LINKS = [
  { href: "/mu-uganda-portal-16x/super/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/mu-uganda-portal-16x/super/community", label: "Community Work", icon: "folder" },
  { href: "/mu-uganda-portal-16x/super/content", label: "Edit Content", icon: "edit" },
  { href: "/mu-uganda-portal-16x/super/hero", label: "Hero Images", icon: "image" },
  { href: "/mu-uganda-portal-16x/super/staff", label: "Staff", icon: "users" },
  { href: "/mu-uganda-portal-16x/super/settings", label: "Settings", icon: "settings" },
];

const ICONS: Record<string, React.ReactNode> = {
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  grid: (
    <path
      d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  folder: (
    <path
      d="M3 7v12a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-8l-2-3H5a2 2 0 00-2 2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  edit: (
    <path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  users: (
    <path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  settings: (
    <path
      d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 flex-col gap-1 border-r border-[var(--color-border)] bg-white py-4 lg:w-56">
      {SUPER_LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`mx-2 flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              active
                ? "bg-[var(--color-surface)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
              aria-hidden="true"
            >
              {ICONS[link.icon]}
            </svg>
            <span className="hidden lg:inline">{link.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
