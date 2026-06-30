"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { AdminRole } from "@/lib/types";

interface RoleGuardProps {
  allow: AdminRole[];
  children: React.ReactNode;
}

/**
 * Wrap any protected admin page in this. It blocks rendering until auth
 * state resolves, then redirects away if the user is unauthenticated or
 * holds a role not present in `allow`. This is the single source of
 * truth for route protection — never rely on hiding UI elements alone.
 */
export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, role, needsPasswordReset, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/mu-uganda-portal-16x/login");
      return;
    }

    // If they need a password reset, force them to the reset page
    if (needsPasswordReset) {
      router.replace("/mu-uganda-portal-16x/reset-password");
      return;
    }

    if (!role || !allow.includes(role)) {
      // Revoked users have a valid session but no access — send to login.
      if (role === "revoked") {
        router.replace("/mu-uganda-portal-16x/login?reason=revoked");
        return;
      }

      // Authenticated but wrong tier — send them to their own dashboard.
      if (role === "admin") {
        router.replace("/mu-uganda-portal-16x/staff/dashboard");
      } else if (role === "super_admin") {
        router.replace("/mu-uganda-portal-16x/super/dashboard");
      } else {
        router.replace("/mu-uganda-portal-16x/login");
      }
    }
  }, [user, role, needsPasswordReset, loading, allow, router]);

  // If loading or unauthorized OR they need a password reset, show loading overlay 
  // until the router.replace kicks in to prevent flashing the protected content.
  if (loading || !user || !role || !allow.includes(role) || needsPasswordReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-text-muted)]">
            Checking access…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
