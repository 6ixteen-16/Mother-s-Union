"use client";

import { useState } from "react";
import UploadZone, { type PendingImage } from "@/components/UploadZone";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { useFolderPhotos } from "@/hooks/useFolderPhotos";
import type { Photo } from "@/lib/types";

interface AdminPhotoManagerProps {
  folderId: string;
}

export default function AdminPhotoManager({
  folderId,
}: AdminPhotoManagerProps) {
  const {
    folder,
    photos,
    urlMap,
    loading,
    uploadPhotos,
    updateCaption,
    togglePublish,
    deletePhoto,
  } = useFolderPhotos(folderId);
  const { showToast } = useToast();

  const [pending, setPending] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");

  async function handleSavePublish() {
    if (pending.length === 0) return;
    if (pending.some((p) => !p.caption.trim())) {
      showToast("Every photo needs a caption before saving.", "error");
      return;
    }
    setUploading(true);
    try {
      await uploadPhotos(pending);
      showToast(`${pending.length} photo${pending.length > 1 ? "s" : ""} uploaded.`);
      setPending([]);
    } catch (err: any) {
      showToast(err?.message || "Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await deletePhoto(deleteTarget);
    showToast("Photo deleted.");
    setDeleteTarget(null);
  }

  function startEditCaption(photo: Photo) {
    setEditingCaption(photo.id);
    setCaptionDraft(photo.caption);
  }

  async function saveCaption(photoId: string) {
    await updateCaption(photoId, captionDraft);
    setEditingCaption(null);
    showToast("Caption updated.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-medium text-[var(--color-text)]">
          {loading ? "Loading folder…" : folder?.name}
        </h2>
        {folder?.description && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {folder.description}
          </p>
        )}
      </div>

      <UploadZone pending={pending} onChange={setPending} />

      {pending.length > 0 && (
        <button
          onClick={handleSavePublish}
          disabled={uploading}
          className="btn-press self-start rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {uploading
            ? "Uploading…"
            : `Save & Publish ${pending.length} Photo${pending.length > 1 ? "s" : ""}`}
        </button>
      )}

      <div className="border-t border-[var(--color-border)] pt-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          Existing Photos
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-44 rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            icon="photos"
            title="No photos in this folder yet"
            description="Upload some using the zone above."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="card-lift overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={urlMap[photo.id]}
                    alt={photo.caption}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute right-2 top-2 rounded-[var(--radius-full)] px-2 py-0.5 text-[11px] font-medium ${
                      photo.isPublished
                        ? "bg-[var(--color-success)] text-white"
                        : "bg-white/90 text-[var(--color-text-muted)]"
                    }`}
                  >
                    {photo.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="p-3">
                  {editingCaption === photo.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveCaption(photo.id)}
                          className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCaption(null)}
                          className="text-xs font-medium text-[var(--color-text-muted)] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="line-clamp-1 text-sm text-[var(--color-text)]">
                      {photo.caption}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-2">
                    <button
                      onClick={() => startEditCaption(photo)}
                      className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      Edit caption
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          togglePublish(photo.id, !photo.isPublished)
                        }
                        className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {photo.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(photo)}
                        className="text-xs font-medium text-[var(--color-danger)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this photo?"
        description="This permanently removes the photo from Storage and the gallery. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
