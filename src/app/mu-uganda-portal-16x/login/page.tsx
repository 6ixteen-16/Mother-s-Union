"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revokedReason = searchParams.get("reason") === "revoked";
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user && role === "super_admin") router.replace("/mu-uganda-portal-16x/super/dashboard");
    else if (user && role === "admin") router.replace("/mu-uganda-portal-16x/staff/dashboard");
  }, [user, role, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const adminDocRef = doc(db, "admins", cred.user.uid);
      const snap = await getDoc(adminDocRef);
      if (!snap.exists()) {
        setError("This account is not authorized for admin access.");
        await auth.signOut();
        return;
      }
      const userRole = snap.data().role;
      if (userRole === "revoked") {
        setError("Your admin access has been revoked. Contact the super admin.");
        await auth.signOut();
        return;
      }
      await updateDoc(adminDocRef, { lastLogin: Date.now() });
    } catch (err: any) {
      if (err?.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a few minutes and try again.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network error. Check your connection and try again.");
      } else {
        setError("Invalid email or password.");
      }
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then click Forgot password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err: any) {
      if (err?.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network error. Check your connection and try again.");
      } else {
        setError("Could not send reset email. Check the address and try again.");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-5">
      <div className="w-full max-w-sm animate-[pop-in_400ms_var(--ease-spring)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col items-center text-center">
          <Logo variant="crest" className="h-16 w-16" />
          <h1 className="mt-5 text-xl font-medium text-[var(--color-text)]">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Sign in to manage site content
          </p>
        </div>

        {revokedReason && (
          <div className="mt-4 rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <strong>Access revoked.</strong> Your admin access has been removed. Contact the super admin to restore it.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18M10.6 10.6a3 3 0 104.2 4.2M9.9 4.2A9.9 9.9 0 0112 4c5 0 9 4 10.5 8-.5 1.4-1.3 2.7-2.3 3.9M6.3 6.3C4.4 7.6 2.9 9.6 1.5 12c1.5 4 5.5 8 10.5 8 1.2 0 2.3-.2 3.4-.6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M1.5 12C3 8 7 4 12 4s9 4 10.5 8c-1.5 4-5.5 8-10.5 8S3 16 1.5 12z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] animate-[shake_320ms]">
              {error}
            </p>
          )}

          {resetSent && (
            <p className="rounded-[var(--radius-sm)] bg-green-50 px-3 py-2 text-sm text-[var(--color-success)]">
              Password reset email sent. Check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-press mt-1 flex items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-center text-sm text-[var(--color-primary)] hover:underline"
          >
            Forgot password?
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}
