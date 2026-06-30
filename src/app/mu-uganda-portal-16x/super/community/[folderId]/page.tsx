"use client";

import { use } from "react";
import Link from "next/link";
import AdminPhotoManager from "@/components/admin/AdminPhotoManager";

export default function SuperFolderDetailPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = use(params);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/mu-uganda-portal-16x/super/community"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
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
        Back to Community Work
      </Link>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <AdminPhotoManager folderId={folderId} />
      </div>
    </div>
  );
}
