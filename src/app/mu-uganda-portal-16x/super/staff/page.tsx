"use client";

import { useState } from "react";
import { useStaffManagement } from "@/hooks/useStaffManagement";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import type { AdminUser } from "@/lib/types";

function generateTempPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export default function StaffManagementPage() {
  const { staff, loading, addStaffMember, revokeStaffMember, unrevokeStaffMember } =
    useStaffManagement();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState(generateTempPassword());
  const [creating, setCreating] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null);
  const [unrevokeTarget, setUnrevokeTarget] = useState<AdminUser | null>(null);
  const [justCreated, setJustCreated] = useState<{ email: string; password: string } | null>(null);

  async function handleCreate() {
    if (!email.trim() || !email.includes("@")) {
      showToast("Enter a valid email address.", "error");
      return;
    }
    setCreating(true);
    try {
      await addStaffMember(email.trim(), tempPassword);
      setJustCreated({ email: email.trim(), password: tempPassword });
      showToast("Admin account created.");
      setEmail("");
      setTempPassword(generateTempPassword());
      setFormOpen(false);
    } catch {
      showToast("Could not create account. The email may already be in use.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevokeConfirm() {
    if (!revokeTarget) return;
    await revokeStaffMember(revokeTarget.id);
    showToast("Admin access revoked.");
    setRevokeTarget(null);
  }

  async function handleUnrevokeConfirm() {
    if (!unrevokeTarget) return;
    await unrevokeStaffMember(unrevokeTarget.id);
    showToast("Admin access restored.");
    setUnrevokeTarget(null);
  }

  const superAdmins = staff.filter((s) => s.role === "super_admin");
  const regularAdmins = staff.filter((s) => s.role === "admin");
  const revokedAdmins = staff.filter((s) => s.role === "revoked");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--color-text)]">
            Staff
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage who can access the admin dashboard.
          </p>
        </div>
        <button
          onClick={() => setFormOpen((o) => !o)}
          className="btn-press rounded-[var(--radius-full)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          + Add Admin
        </button>
      </div>

      {justCreated && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-green-50 p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">
            Account created — share these credentials securely:
          </p>
          <p className="mt-2 font-mono text-sm text-[var(--color-text)]">
            Email: {justCreated.email}
            <br />
            Temporary password: {justCreated.password}
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            This password will not be shown again. The new admin should
            change it after their first login.
          </p>
          <button
            onClick={() => setJustCreated(null)}
            className="mt-2 text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        className={`dropdown-panel rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white ${
          formOpen ? "open" : ""
        }`}
        style={{ maxHeight: formOpen ? "400px" : "0" }}
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="font-medium text-[var(--color-text)]">
            New Admin Account
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            This account will only be able to upload/delete photos and
            create/edit blog posts. It cannot manage folders, edit site
            content, or access settings.
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              placeholder="admin2@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Temporary Password
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={tempPassword}
                className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 font-mono text-sm"
              />
              <button
                onClick={() => setTempPassword(generateTempPassword())}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-press rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Account"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-medium text-[var(--color-text)]">
          Super Admin
        </h2>
        {loading ? (
          <div className="skeleton h-12 rounded-[var(--radius-sm)]" />
        ) : (
          superAdmins.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-4 py-3"
            >
              <span className="text-sm text-[var(--color-text)]">{s.email}</span>
              <span className="rounded-[var(--radius-full)] bg-amber-400 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-amber-950">
                Super Admin
              </span>
            </div>
          ))
        )}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-medium text-[var(--color-text)]">
          Admins ({regularAdmins.length})
        </h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-[var(--radius-sm)]" />
            ))}
          </div>
        ) : regularAdmins.length === 0 ? (
          <EmptyState
            icon="folders"
            title="No regular admins yet"
            description="Add up to two admins who can upload photos and write blog posts."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {regularAdmins.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-[var(--color-text)]">{s.email}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Added by {s.createdBy}
                  </p>
                </div>
                <button
                  onClick={() => setRevokeTarget(s)}
                  className="text-xs font-medium text-[var(--color-danger)] hover:underline"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {revokedAdmins.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 sm:p-6 opacity-80 hover:opacity-100 transition-opacity">
          <h2 className="mb-4 font-medium text-[var(--color-text)]">
            Revoked Admins ({revokedAdmins.length})
          </h2>
          <div className="flex flex-col gap-2">
            {revokedAdmins.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] line-through">{s.email}</p>
                </div>
                <button
                  onClick={() => setUnrevokeTarget(s)}
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  Unrevoke Access
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        title="Revoke admin access?"
        description={`${revokeTarget?.email} will immediately lose access to the admin dashboard. You can restore their access later using the "Unrevoke" option.`}
        confirmLabel="Revoke Access"
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        open={!!unrevokeTarget}
        title="Restore admin access?"
        description={`This will restore dashboard access for ${unrevokeTarget?.email}. They will be able to log in using their original password.`}
        confirmLabel="Restore Access"
        onConfirm={handleUnrevokeConfirm}
        onCancel={() => setUnrevokeTarget(null)}
      />
    </div>
  );
}
