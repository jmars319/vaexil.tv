import { EmptyState, PrimaryLink, Section, SectionHeading, SecondaryLink } from "@/components/ui";
import { listPublicReconMapsForGame, listReconGames } from "@/lib/repository";
import { Map as MapIcon, Radar, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Recon",
  description:
    "Vaexil-curated interactive maps, field notes, and guide layers for games covered on stream.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReconPage() {
  const games = await listReconGames();
  const mapCountEntries = await Promise.all(
    games.map(
      async (game): Promise<[string, number]> => [
        game.id,
        (await listPublicReconMapsForGame(game.id)).length,
      ],
    ),
  );
  const mapCounts = new Map(mapCountEntries);

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <SectionHeading
            title="Recon"
            description="Interactive maps, field notes, and guide layers for games covered on stream. Recon is curated static knowledge, not AI, prediction, or copied map data."
          />
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
            <ShieldCheck className="size-6 text-cyan-200" aria-hidden="true" />
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Map pages stay hidden until their Vaexil-authored schematic maps
              and marker data are ready for public use. The current Freelancer
              guide remains the stable reference.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/guides/freelancer-free-items">
                Current guide
              </PrimaryLink>
              <SecondaryLink href="/suggest">Suggest a correction</SecondaryLink>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/recon/${game.slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <Radar className="size-7 text-cyan-200" aria-hidden="true" />
              <h2 className="mt-6 text-2xl font-semibold text-white">
                {game.shortTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {game.description}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-slate-300">
                <MapIcon className="size-4 text-slate-500" aria-hidden="true" />
                {mapCounts.get(game.id) || 0} public maps
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-4">
        <EmptyState
          title="Public maps are still in production"
          description="Recon launches with the public section, data model, private asset workflow, and admin coordinate capture. Individual map pages appear only after their assets and markers are reviewed and published."
        />
      </Section>
    </>
  );
}
