"use client";

import Link from "next/link";
import { useRevealChildren } from "@/hooks/useRevealChildren";
import { FOLDER_ICONS } from "@/lib/icons";
import { useAllFolders } from "@/hooks/useGallery";
import FolderCover from "./FolderCover";

export default function CommunityWorkPanel() {
  const containerRef = useRevealChildren<HTMLDivElement>();
  const { folders, loading } = useAllFolders();

  function handleTilt(e: React.MouseEvent<HTMLAnchorElement>) {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduced) return;

    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(500px) rotateX(${-y * 10}deg) rotateY(${x * 14}deg) translateY(-4px) scale(1.02)`;
  }

  function resetTilt(e: React.MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.style.transform = "";
  }

  return (
    <div ref={containerRef} id="community-work">
      <h2 className="mb-4 font-serif text-2xl font-medium text-[var(--color-text)] reveal-up">
        Community Work
      </h2>
      <p className="mb-5 text-sm leading-relaxed text-[var(--color-text-muted)] reveal-up" style={{ transitionDelay: "100ms" }}>
        Browse photos from our outreach across schools, churches, hospitals,
        and markets throughout the dioceses.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-[260px] rounded-[var(--radius-md)]" />
          ))
        ) : (
          folders.map((folder, i) => (
            <Link
              key={folder.id}
              href={`/gallery/${folder.id}`}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
              className="group reveal-3d flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-300 hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-lg)]"
              style={{ transitionDelay: `${i * 100}ms`, transformOrigin: "center" }}
            >
              {/* Cover Image Area */}
              <div className="relative h-44 w-full shrink-0 overflow-hidden bg-[var(--color-surface)]">
                <FolderCover folderId={folder.id} />
              </div>

              {/* Card Body */}
              <div className="flex w-full flex-1 flex-col justify-between p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg font-medium text-[var(--color-text)] flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">
                        {FOLDER_ICONS[folder.id.toLowerCase()] || FOLDER_ICONS.default}
                      </span>
                      {folder.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {folder.photoCount} {folder.photoCount === 1 ? "photo" : "photos"}
                    </p>
                  </div>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white"
                    aria-hidden="true"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
