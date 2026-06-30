"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminTopBar({ label }: { label: string }) {
  const { user, role } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/mu-uganda-portal-16x/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-primary)] px-5 sm:px-6">
      <span className="font-serif text-lg font-medium text-white">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-white/85 sm:inline">
          {user?.email}
        </span>
        <span
          className={`rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            role === "super_admin"
              ? "bg-amber-400 text-amber-950"
              : "bg-white/20 text-white"
          }`}
        >
          {role === "super_admin" ? "Super Admin" : "Admin"}
        </span>
        <button
          onClick={handleLogout}
          className="btn-press rounded-[var(--radius-sm)] bg-white/15 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
