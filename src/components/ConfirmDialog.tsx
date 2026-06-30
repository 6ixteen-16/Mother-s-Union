"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--color-text)]/40 px-4 backdrop-blur-sm animate-[fade-in_200ms_ease]"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-lg)] animate-[pop-in_280ms_var(--ease-spring)]"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-medium text-[var(--color-text)]"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn-press rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`btn-press rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white transition-colors ${
              danger
                ? "bg-[var(--color-danger)] hover:bg-red-700"
                : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
