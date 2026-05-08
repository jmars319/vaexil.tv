import { voteForSuggestion } from "@/app/actions";
import { EmptyState, PrimaryLink, Section, SectionHeading, StatusBadge } from "@/components/ui";
import { listSuggestions } from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import { ArrowUp, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Community Suggestions",
  description:
    "Pending Vaexil guide suggestions with lightweight community voting before admin review.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SuggestionsPage() {
  const suggestions = await listSuggestions();

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Community suggestions"
            description="Vote on additions or corrections that should be reviewed. Five votes marks a suggestion ready for review, but publishing still requires admin verification."
          />
          <PrimaryLink href="/suggest">Submit suggestion</PrimaryLink>
        </div>
      </Section>

      <Section className="pt-4">
        {suggestions.length === 0 ? (
          <EmptyState
            title="No community suggestions yet"
            description="Submitted suggestions will appear here as pending items. They will not become official guide entries until they are verified and published by an admin."
          />
        ) : (
          <div className="grid gap-4">
            {suggestions.map((suggestion) => {
              const status =
                suggestion.status === "pending" && suggestion.voteCount >= 5
                  ? "ready_for_review"
                  : suggestion.status;

              return (
                <article
                  key={suggestion.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={status} />
                        <span className="text-xs text-slate-500">
                          Submitted {formatDate(suggestion.createdAt)}
                        </span>
                      </div>
                      <h2 className="mt-4 text-xl font-semibold text-white">
                        {suggestion.itemName}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {suggestion.category} / {suggestion.mapName}
                      </p>
                    </div>
                    <form action={voteForSuggestion}>
                      <input
                        type="hidden"
                        name="suggestionId"
                        value={suggestion.id}
                      />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/40 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
                      >
                        <ArrowUp className="mr-2 size-4" aria-hidden="true" />
                        {suggestion.voteCount} votes
                      </button>
                    </form>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Location
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {suggestion.locationDescription}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {suggestion.notes}
                      </p>
                    </div>
                  </div>
                  {suggestion.sourceUrl ? (
                    <a
                      href={suggestion.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100"
                    >
                      Source
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
