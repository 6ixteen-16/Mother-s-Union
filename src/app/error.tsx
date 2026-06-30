"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[var(--color-surface)] px-5 py-20">
      <div className="flex flex-col items-center text-center">
        <span className="font-serif text-6xl font-medium text-[var(--color-danger)]">
          !
        </span>
        <h1 className="mt-3 text-xl font-medium text-[var(--color-text)]">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="btn-press mt-6 rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
