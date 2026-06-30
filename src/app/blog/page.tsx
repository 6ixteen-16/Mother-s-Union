"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { useBlogList } from "@/hooks/useBlog";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-UG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogListPage() {
  const { posts, coverUrls, loading } = useBlogList();

  return (
    <>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h1 className="font-serif text-4xl font-medium text-[var(--color-text)]">
            Blog
          </h1>
          <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
            Stories, updates, and reflections from across the Buganda
            dioceses.
          </p>

          <div className="mt-10">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="skeleton aspect-[16/10] w-full rounded-[var(--radius-md)]" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon="posts"
                title="No posts yet"
                description="Check back soon for stories and updates."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="card-lift group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white animate-[fade-up_460ms_var(--ease-smooth)_backwards]"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--color-surface)]">
                      {coverUrls[post.id] ? (
                        <img
                          src={coverUrls[post.id]}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M4 16l4-4 4 4 6-6 2 2M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {formatDate(post.createdAt)}
                      </p>
                      <h2 className="mt-1 font-serif text-lg font-medium text-[var(--color-text)] line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                        {post.bodyText}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
