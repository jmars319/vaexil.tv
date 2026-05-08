"use client";

import { Section } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Section className="py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-rose-300/30 bg-rose-300/10 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-rose-100/80">
          {error.message || "The page could not be loaded."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950"
        >
          Try again
        </button>
      </div>
    </Section>
  );
}
