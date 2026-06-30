"use client";

import Link from "next/link";
import { useMyActivity } from "@/hooks/useMyActivity";
import EmptyState from "@/components/EmptyState";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function StaffDashboardPage() {
  const { activity, loading } = useMyActivity();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 sm:gap-8">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/mu-uganda-portal-16x/staff/photos"
          className="card-lift flex flex-col items-center gap-2 sm:gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-8 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 16l4-4 4 4 6-6 2 2M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-medium text-[var(--color-text)]">
            Upload Photos
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            Add new photos to a community folder
          </span>
        </Link>

        <Link
          href="/mu-uganda-portal-16x/staff/blog"
          className="card-lift flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-medium text-[var(--color-text)]">
            Write a Blog Post
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            Share an update or story
          </span>
        </Link>
        <Link
          href="/mu-uganda-portal-16x/staff/hero"
          className="card-lift flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-medium text-[var(--color-text)]">
            Manage Hero Images
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            Update the homepage slideshow
          </span>
        </Link>
        <Link
          href="/mu-uganda-portal-16x/staff/content"
          className="card-lift flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-medium text-[var(--color-text)]">
            Edit Content
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            Update site vision and values
          </span>
        </Link>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          Your Recent Activity
        </h2>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-[var(--radius-sm)]" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            icon="photos"
            title="Nothing uploaded yet"
            description="Your photos and posts will show up here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">
                  {item.label}
                </span>
                <span className="ml-3 shrink-0 text-xs text-[var(--color-text-muted)]">
                  {item.type === "photo" ? "Photo" : "Post"} ·{" "}
                  {timeAgo(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
