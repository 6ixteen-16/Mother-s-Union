"use client";

import StatCard from "@/components/admin/StatCard";
import EmptyState from "@/components/EmptyState";
import { useDashboardStats } from "@/hooks/useDashboardStats";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SuperDashboardPage() {
  const { stats, activity, loading } = useDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Overview of all site content and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Folders" value={loading ? 0 : stats.totalFolders} />
        <StatCard label="Total Photos" value={loading ? 0 : stats.totalPhotos} />
        <StatCard
          label="Published"
          value={loading ? 0 : stats.publishedPhotos}
          accent="success"
        />
        <StatCard
          label="Drafts"
          value={loading ? 0 : stats.draftPhotos}
          accent="muted"
        />
        <StatCard label="Blog Posts" value={loading ? 0 : stats.totalPosts} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-medium text-[var(--color-text)]">
          Recent Activity
        </h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-[var(--radius-sm)]" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            icon="folders"
            title="No activity yet"
            description="Uploads and posts from any admin will appear here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {activity.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 animate-[fade-in_400ms_ease_backwards]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]"
                  aria-hidden="true"
                >
                  {item.type === "photo" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 16l4-4 4 4 6-6 2 2M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.type === "photo" ? "Photo uploaded" : "Blog post created"}{" "}
                    · {timeAgo(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
