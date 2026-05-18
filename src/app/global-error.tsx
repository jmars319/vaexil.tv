"use client";

import { StatusPage } from "@/components/status-page";
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
        <StatusPage kind="serverError">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-200/60 px-5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
          >
            Try again
          </button>
        </StatusPage>
      </body>
    </html>
  );
}
