"use client";

import { use } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { useBlogPost } from "@/hooks/useBlog";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-UG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const { post, coverUrl, loading, notFound } = useBlogPost(postId);

  return (
    <>
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Blog
          </Link>

          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton aspect-[16/9] w-full rounded-[var(--radius-md)]" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
            </div>
          ) : notFound || !post ? (
            <EmptyState
              icon="posts"
              title="Post not found"
              description="This post may have been unpublished or removed."
            />
          ) : (
            <article className="animate-[fade-up_420ms_var(--ease-smooth)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(post.createdAt)}
              </p>
              <h1 className="mt-2 font-serif text-3xl font-medium leading-tight text-[var(--color-text)] sm:text-4xl">
                {post.title}
              </h1>

              {coverUrl && (
                <img
                  src={coverUrl}
                  alt={post.title}
                  className="mt-6 aspect-[16/9] w-full rounded-[var(--radius-md)] object-cover"
                />
              )}

              <div className="mt-8 whitespace-pre-line text-[16px] leading-relaxed text-[var(--color-text)]">
                {post.bodyText}
              </div>
            </article>
          )}
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
