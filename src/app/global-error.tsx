"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#05070d] text-slate-100">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            Server error
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Something went wrong</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Vaexil could not complete this request. Try the page again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-200/60 px-5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
