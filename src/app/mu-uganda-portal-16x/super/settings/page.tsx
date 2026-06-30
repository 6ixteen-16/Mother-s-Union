"use client";

import { useState } from "react";
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  collectionGroup,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleUpdateCredentials() {
    if (!currentPassword) {
      showToast("Enter your current password to confirm changes.", "error");
      return;
    }
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setUpdating(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      if (newEmail.trim()) {
        await updateEmail(user, newEmail.trim());
        await updateDoc(doc(db, "admins", user.uid), { email: newEmail.trim() });
      }
      if (newPassword.trim()) {
        await updatePassword(user, newPassword.trim());
      }

      showToast("Account updated successfully.");
      setCurrentPassword("");
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      console.error("Update credentials error:", err);
      showToast("Update failed. Check your current password and try again.", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const [folders, photos, posts, orgContent, messages] = await Promise.all([
        getDocs(collection(db, "folders")),
        getDocs(collectionGroup(db, "photos")),
        getDocs(collection(db, "blogPosts")),
        getDocs(collection(db, "orgContent")),
        getDocs(collection(db, "contactMessages")),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        folders: folders.docs.map((d) => ({ id: d.id, ...d.data() })),
        photos: photos.docs.map((d) => ({ id: d.id, ...d.data() })),
        blogPosts: posts.docs.map((d) => ({ id: d.id, ...d.data() })),
        orgContent: orgContent.docs.map((d) => ({ id: d.id, ...d.data() })),
        contactMessages: messages.docs.map((d) => ({ id: d.id, ...d.data() })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `mu-buganda-export-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("Export downloaded.");
    } catch {
      showToast("Export failed. Try again.", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Manage your account and back up site content.
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-medium text-[var(--color-text)]">
          Account Credentials
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Current Password (required to confirm any change)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              New Email (leave blank to keep current)
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <button
            onClick={handleUpdateCredentials}
            disabled={updating}
            className="btn-press self-start rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {updating ? "Updating…" : "Update Account"}
          </button>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <h2 className="mb-2 font-medium text-[var(--color-text)]">
          Export All Content
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          Download a full JSON snapshot of folders, photos, blog posts,
          site content, and contact messages. Keep this as a manual
          backup — Firebase&apos;s free tier does not back up data
          automatically.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-press rounded-[var(--radius-full)] border border-[var(--color-border)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60"
        >
          {exporting ? "Preparing export…" : "Export as JSON"}
        </button>
      </div>
    </div>
  );
}
