import Link from "next/link";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <div className="flex flex-col items-center text-center">
          <span className="font-serif text-7xl font-medium text-[var(--color-primary)]">
            404
          </span>
          <h1 className="mt-3 text-xl font-medium text-[var(--color-text)]">
            Page not found
          </h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
          <Link
            href="/"
            className="btn-press mt-6 rounded-[var(--radius-full)] bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
