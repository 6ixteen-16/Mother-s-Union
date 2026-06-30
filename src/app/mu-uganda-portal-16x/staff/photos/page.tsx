"use client";

import { useState } from "react";
import { useFolders } from "@/hooks/useFolders";
import { useAuth } from "@/context/AuthContext";
import AdminPhotoManager from "@/components/admin/AdminPhotoManager";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function StaffPhotosPage() {
  const { user } = useAuth();
  const { folders, loading, createFolder, hardDeleteFolder } = useFolders();
  const { showToast } = useToast();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setSaving(true);
    try {
      const newFolderId = await createFolder({
        name: newFolderName,
        description: newFolderDesc,
        iconEmoji: "",
        isVisible: true,
      });
      showToast("Folder created successfully.");
      setIsCreating(false);
      setNewFolderName("");
      setNewFolderDesc("");
      setSelectedFolderId(newFolderId);
    } catch (err: any) {
      showToast(err?.message || "Failed to create folder.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFolder() {
    if (!selectedFolderId) return;
    setDeleting(true);
    try {
      await hardDeleteFolder(selectedFolderId);
      showToast("Folder deleted successfully.");
      setSelectedFolderId("");
    } catch (err: any) {
      showToast(err?.message || "Failed to delete folder.", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
            Upload Photos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Choose a folder, then drag in your photos.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="btn-press rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          {isCreating ? "Cancel" : "+ New Folder"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateFolder} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
          <h2 className="mb-4 font-medium text-[var(--color-text)]">Create New Folder</h2>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Folder Name
            </label>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. Schools"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Description
            </label>
            <input
              type="text"
              value={newFolderDesc}
              onChange={(e) => setNewFolderDesc(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              placeholder="Brief description"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-press rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create Folder"}
          </button>
        </form>
      )}

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          Select Folder
        </label>
        {loading ? (
          <div className="skeleton h-11 rounded-[var(--radius-sm)]" />
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Select a folder…</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {selectedFolderId && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-danger)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {selectedFolderId && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
          <AdminPhotoManager folderId={selectedFolderId} />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this folder?"
        description={`This will permanently delete "${selectedFolder?.name}" and all ${selectedFolder?.photoCount ?? 0} photos inside it. This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete Folder"}
        onConfirm={handleDeleteFolder}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
