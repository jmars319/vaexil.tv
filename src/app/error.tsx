"use client";

import { StatusPage } from "@/components/status-page";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusPage kind="serverError">
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-200/60 px-5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
      >
        Try again
      </button>
    </StatusPage>
  );
}
