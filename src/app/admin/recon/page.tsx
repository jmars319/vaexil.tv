import { Section, SectionHeading, StatusBadge } from "@/components/ui";
import type { ReconSourceCrossCheck } from "@/data/recon/source-cross-checks";
import { isAdminAuthenticated } from "@/lib/admin";
import { listReconSourceCrossChecks } from "@/lib/recon-review-metadata";
import {
  listAdminReconMaps,
  listReconMarkerSuggestions,
} from "@/lib/repository";
import type { ReconMap } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Crosshair, Map as MapIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Recon Admin",
  description: "Protected Recon draft map and coordinate capture tooling.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ReconMapGroup = {
  id: string;
  anchor: string;
  title: string;
  shortTitle: string;
  maps: ReconMap[];
};

function anchorForGame(gameId: string) {
  return `game-${gameId.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

function groupMapsByGame(maps: ReconMap[]) {
  const groups: ReconMapGroup[] = [];
  const groupsByGame = new Map<string, ReconMapGroup>();

  for (const map of maps) {
    let group = groupsByGame.get(map.gameId);
    if (!group) {
      group = {
        id: map.gameId,
        anchor: anchorForGame(map.gameId),
        title: map.gameTitle,
        shortTitle: map.gameShortTitle,
        maps: [],
      };
      groups.push(group);
      groupsByGame.set(map.gameId, group);
    }

    group.maps.push(map);
  }

  return groups;
}

function sourceCheckLabel(
  mapId: string,
  checksByMapId: Map<string, ReconSourceCrossCheck>,
) {
  const check = checksByMapId.get(mapId);

  if (!check) return "No source cross-check";

  return check.status.replaceAll("_", " ");
}

function visualReviewLabel(
  mapId: string,
  checksByMapId: Map<string, ReconSourceCrossCheck>,
) {
  const check = checksByMapId.get(mapId);

  if (!check) return "No visual review";

  return check.visualReview.status.replaceAll("_", " ");
}

export default async function ReconAdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [maps, suggestions, sourceCrossChecks] = await Promise.all([
    listAdminReconMaps(),
    listReconMarkerSuggestions(),
    listReconSourceCrossChecks(),
  ]);
  const mapGroups = groupMapsByGame(maps);
  const sourceChecksByMapId = new Map(
    sourceCrossChecks.map((check) => [check.mapId, check]),
  );

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Recon admin"
            description="Private map records, protected draft asset preview, and normalized coordinate capture. Nothing here publishes marker data automatically."
          />
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.12] px-5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            Admin queue
          </Link>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
          <ShieldCheck className="size-6 text-cyan-200" aria-hidden="true" />
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Draft map assets are served through authenticated admin routes and
            must remain out of public static paths until reviewed and published.
          </p>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="flex flex-wrap gap-2">
          {mapGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.anchor}`}
              className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              {group.shortTitle} / {group.maps.length}
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-8">
          {mapGroups.map((group) => {
            const privateCount = group.maps.filter(
              (map) => map.imageAsset?.visibility === "private",
            ).length;
            const reviewedCount = group.maps.filter(
              (map) =>
                sourceChecksByMapId.get(map.id)?.status === "position_cross_checked",
            ).length;
            const visualComparedCount = group.maps.filter((map) =>
              ["visual_sources_compared", "partial_visual_sources_compared"].includes(
                sourceChecksByMapId.get(map.id)?.visualReview.status || "",
              ),
            ).length;

            return (
              <section
                key={group.id}
                id={group.anchor}
                className="scroll-mt-28"
                aria-labelledby={`${group.anchor}-heading`}
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      {group.shortTitle}
                    </p>
                    <h2
                      id={`${group.anchor}-heading`}
                      className="mt-2 text-2xl font-semibold text-white"
                    >
                      {group.title}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {group.maps.length} maps / {privateCount} private assets /{" "}
                    {visualComparedCount} visual-reviewed / {reviewedCount} position-reviewed
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {group.maps.map((map) => (
                    <Link
                      key={map.id}
                      href={`/admin/recon/maps/${map.slug}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <MapIcon className="size-7 text-cyan-200" aria-hidden="true" />
                        <StatusBadge status={map.status} />
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-white">
                        {map.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {map.subtitle || "Overview"}
                      </p>
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        {map.imageAsset?.visibility === "private"
                          ? "Private draft asset"
                          : "No private draft asset"}
                      </p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        Source check: {sourceCheckLabel(map.id, sourceChecksByMapId)}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-cyan-200/80">
                        Visual: {visualReviewLabel(map.id, sourceChecksByMapId)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Section>

      <Section className="pt-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Crosshair className="size-6 text-cyan-200" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">
              Recent Recon captures
            </h2>
          </div>
          {suggestions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
              No Recon marker captures have been saved yet.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {suggestions.map((suggestion) => (
                <article
                  key={suggestion.id}
                  className="rounded-xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">
                        {suggestion.label}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {suggestion.gameTitle} / {suggestion.mapTitle} /{" "}
                        {formatDate(suggestion.createdAt)}
                      </p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-cyan-200/80">
                        {suggestion.suggestionType === "marker_correction"
                          ? "Marker correction"
                          : "New marker"}
                        {suggestion.targetMarkerId
                          ? ` / ${suggestion.targetMarkerId}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={suggestion.status} />
                  </div>
                  <p className="mt-3 font-mono text-sm text-slate-300">
                    x {suggestion.x.toFixed(2)} / y{" "}
                    {suggestion.y.toFixed(2)}
                  </p>
                  {suggestion.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {suggestion.description}
                    </p>
                  ) : null}
                  {suggestion.submitterNote ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {suggestion.submitterNote}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
