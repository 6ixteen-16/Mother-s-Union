"use client";

import { useState } from "react";
import { useMyBlogPosts } from "@/hooks/useMyBlogPosts";
import { useToast } from "@/components/Toast";
import SimpleTextEditor from "@/components/admin/SimpleTextEditor";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import type { BlogPost } from "@/lib/types";

interface FormState {
  id: string | null;
  title: string;
  bodyText: string;
  coverFile: File | null;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  bodyText: "",
  coverFile: null,
  isPublished: true,
};

export default function StaffBlogPage() {
  const { posts, coverUrls, loading, createPost, updatePost, deletePost } =
    useMyBlogPosts();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setSaving(false);
    setFormOpen(true);
  }

  function openEdit(post: BlogPost) {
    setForm({
      id: post.id,
      title: post.title,
      bodyText: post.bodyText,
      coverFile: null,
      isPublished: post.isPublished,
    });
    setSaving(false);
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.bodyText.trim()) {
      showToast("Title and body text are both required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await updatePost(form.id, {
          title: form.title,
          bodyText: form.bodyText,
          isPublished: form.isPublished,
          coverFile: form.coverFile,
        });
        showToast("Post updated.");
      } else {
        await createPost({
          title: form.title,
          bodyText: form.bodyText,
          coverFile: form.coverFile,
          isPublished: form.isPublished,
        });
        showToast("Post published.");
      }
      setFormOpen(false);
    } catch (err: any) {
      showToast(err?.message || "Something went wrong. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await deletePost(deleteTarget);
    showToast("Post deleted.");
    setDeleteTarget(null);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
            Blog Posts
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Write updates and stories for the public blog.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-press rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + New Post
        </button>
      </div>

      <div
        className={`dropdown-panel rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white ${
          formOpen ? "open" : ""
        }`}
        style={{ maxHeight: formOpen ? "900px" : "0" }}
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="font-medium text-[var(--color-text)]">
            {form.id ? "Edit Post" : "New Post"}
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Cover Image {form.id && "(leave blank to keep current)"}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setForm((f) => ({ ...f, coverFile: e.target.files?.[0] || null }))
              }
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Body
            </label>
            <SimpleTextEditor
              value={form.bodyText}
              onChange={(v) => setForm((f) => ({ ...f, bodyText: v }))}
              placeholder="Write your post here…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPublished: e.target.checked }))
              }
              className="accent-[var(--color-primary)]"
            />
            Publish immediately
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
              {saving ? "Saving…" : "Save Post"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          Your Posts
        </h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="posts"
            title="No posts yet"
            description="Create your first post above."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface)]">
                  {coverUrls[post.id] && (
                    <img
                      src={coverUrls[post.id]}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--color-text)]">
                    {post.title}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-[var(--radius-full)] px-2 py-0.5 text-[11px] font-medium ${
                      post.isPublished
                        ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                        : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEdit(post)}
                    className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(post)}
                    className="text-xs font-medium text-[var(--color-danger)] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this post?"
        description="This permanently removes the post and its cover image. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
