"use client";

import { use } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import PhotoGrid from "@/components/PhotoGrid";
import EmptyState from "@/components/EmptyState";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { FOLDER_ICONS } from "@/lib/icons";
import { useGallery, useAllFolders } from "@/hooks/useGallery";

export default function GalleryPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = use(params);
  const { folder, photos, urlMap, loading, notFound } = useGallery(folderId);
  const { folders: allFolders } = useAllFolders();

  return (
    <>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-primary)]">
              Community Work
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[var(--color-text)]">
              {loading ? "…" : folder?.name ?? "Not found"}
            </span>
          </nav>

          {notFound ? (
            <EmptyState
              icon="folders"
              title="This folder isn't available"
              description="It may have been unpublished or doesn't exist."
            />
          ) : (
            <>
              {/* Header */}
              <div className="mb-8 flex items-start gap-4 animate-[fade-up_400ms_var(--ease-smooth)]">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]"
                  aria-hidden="true"
                >
                  {loading ? "" : (FOLDER_ICONS[folder?.id.toLowerCase() ?? ""] || FOLDER_ICONS.default)}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-serif text-3xl font-medium text-[var(--color-text)]">
                      {loading ? "Loading…" : folder?.name}
                    </h1>
                    {!loading && (
                      <span className="rounded-[var(--radius-full)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                        {folder?.photoCount ?? 0}{" "}
                        {(folder?.photoCount ?? 0) === 1 ? "photo" : "photos"}
                      </span>
                    )}
                  </div>
                  {!loading && folder?.description && (
                    <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                      {folder.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Photo grid */}
              <PhotoGrid
                photos={photos}
                getUrl={(p) => urlMap[p.id] || ""}
                loading={loading}
              />
            </>
          )}

          {/* Folder switcher tab bar */}
          {allFolders.length > 1 && (
            <div className="mt-12 border-t border-[var(--color-border)] pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                More community work
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allFolders.map((f) => (
                  <Link
                    key={f.id}
                    href={`/gallery/${f.id}`}
                    className={`btn-press flex shrink-0 items-center gap-2 rounded-[var(--radius-full)] border px-4 py-2 text-sm transition-colors duration-200 ${
                      f.id === folderId
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    <span aria-hidden="true" className="shrink-0 text-current opacity-80" style={{ width: 16, height: 16 }}>
                      {FOLDER_ICONS[f.id.toLowerCase()] || FOLDER_ICONS.default}
                    </span>
                    {f.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
