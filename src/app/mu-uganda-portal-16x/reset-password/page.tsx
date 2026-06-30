"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const { user, role, needsPasswordReset, loading } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If auth is loaded and they don't need a reset, send them away.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/mu-uganda-portal-16x/login");
      return;
    }
    if (!needsPasswordReset) {
      if (role === "super_admin") {
        router.replace("/mu-uganda-portal-16x/super/dashboard");
      } else if (role === "admin") {
        router.replace("/mu-uganda-portal-16x/staff/dashboard");
      } else {
        router.replace("/mu-uganda-portal-16x/login");
      }
    }
  }, [user, role, needsPasswordReset, loading, router]);

  if (loading || !user || !needsPasswordReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Please wait…</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      // 1. Update password in Firebase Auth
      await updatePassword(auth.currentUser!, password);
      
      // 2. Clear the needsPasswordReset flag in Firestore
      await updateDoc(doc(db, "admins", user!.uid), {
        needsPasswordReset: false
      });

      // We don't need to manually redirect; updating the doc will trigger
      // onAuthStateChanged to re-read the doc, AuthContext will update,
      // and the useEffect above will redirect them automatically.
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setError("For security reasons, please sign out and sign in again before resetting your password.");
      } else {
        setError("Failed to update password. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-5">
      <div className="w-full max-w-sm animate-[pop-in_400ms_var(--ease-spring)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col items-center text-center">
          <Logo variant="crest" className="h-16 w-16" />
          <h1 className="mt-5 text-xl font-medium text-[var(--color-text)]">
            Set New Password
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Please choose a new secure password to continue.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 px-3 py-2.5 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              placeholder="Retype password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-press mt-2 w-full rounded-[var(--radius-full)] bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
          >
            {submitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
