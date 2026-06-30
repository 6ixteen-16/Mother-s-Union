"use client";

import { useState } from "react";
import { useFolders } from "@/hooks/useFolders";
import FolderCard from "@/components/admin/FolderCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import type { CommunityFolder } from "@/lib/types";

interface FormState {
  id: string | null;
  name: string;
  description: string;
  isVisible: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  description: "",
  isVisible: true,
};

export default function CommunityManagementPage() {
  const {
    folders,
    loading,
    createFolder,
    updateFolder,
    hardDeleteFolder,
  } = useFolders();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityFolder | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(folder: CommunityFolder) {
    setForm({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      isVisible: folder.isVisible,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast("Folder name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await updateFolder(form.id, {
          name: form.name,
          description: form.description,
          isVisible: form.isVisible,
        });
        showToast("Folder updated.");
      } else {
        await createFolder({
          name: form.name,
          description: form.description,
          iconEmoji: "", // Legacy field
          isVisible: form.isVisible,
        });
        showToast("Folder created.");
      }
      setFormOpen(false);
    } catch {
      showToast("Something went wrong. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await hardDeleteFolder(deleteTarget.id);
    showToast("Folder permanently deleted.");
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
            Community Work
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage the folders shown in the public gallery.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-press rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + New Folder
        </button>
      </div>

      {/* Inline create/edit form */}
      <div
        className={`dropdown-panel rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white ${
          formOpen ? "open" : ""
        }`}
        style={{ maxHeight: formOpen ? "640px" : "0" }}
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="font-medium text-[var(--color-text)]">
            {form.id ? "Edit Folder" : "New Folder"}
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Folder Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. Schools"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              placeholder="Brief description shown on the gallery page"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) =>
                setForm((f) => ({ ...f, isVisible: e.target.checked }))
              }
              className="accent-[var(--color-primary)]"
            />
            Visible on public site
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-press rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Folder"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <EmptyState
          icon="folders"
          title="No folders yet"
          description="Create your first folder above."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onToggleVisibility={() =>
                updateFolder(folder.id, { isVisible: !folder.isVisible })
              }
              onEdit={() => openEdit(folder)}
              onDelete={() => setDeleteTarget(folder)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this folder?"
        description={`This will permanently delete "${deleteTarget?.name}" and all ${deleteTarget?.photoCount ?? 0} photos inside it. This action cannot be undone.`}
        confirmLabel="Delete Folder"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
