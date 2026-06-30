"use client";

import Link from "next/link";
import type { CommunityFolder } from "@/lib/types";
import { FOLDER_ICONS } from "@/lib/icons";

interface FolderCardProps {
  folder: CommunityFolder;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FolderCard({
  folder,
  onToggleVisibility,
  onEdit,
  onDelete,
}: FolderCardProps) {
  return (
    <div className="card-lift flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]"
          aria-hidden="true"
        >
          {FOLDER_ICONS[folder.id.toLowerCase()] || FOLDER_ICONS.default}
        </span>
        <div className="flex-1">
          <p className="font-medium text-[var(--color-text)]">
            {folder.name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {folder.photoCount} photos
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">
        {folder.description}
      </p>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <button
            type="button"
            role="switch"
            aria-checked={folder.isVisible}
            onClick={onToggleVisibility}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
              folder.isVisible
                ? "bg-[var(--color-primary)]"
                : "bg-[var(--color-border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                folder.isVisible ? "translate-x-4.5 left-0.5" : "left-0.5"
              }`}
            />
          </button>
          {folder.isVisible ? "Visible" : "Hidden"}
        </label>

        <div className="flex gap-3">
          <Link
            href={`/mu-uganda-portal-16x/super/community/${folder.id}`}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Manage Photos
          </Link>
          <button
            onClick={onEdit}
            className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs font-medium text-[var(--color-danger)] hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
