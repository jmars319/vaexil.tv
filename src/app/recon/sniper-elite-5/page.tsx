import { EmptyState, Section, SectionHeading, SecondaryLink } from "@/components/ui";
import {
  getReconGameBySlug,
  listPublicReconMapsForGame,
} from "@/lib/repository";
import { Map as MapIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Sniper Elite 5 Recon",
  description: "Vaexil Recon map and guide shell for Sniper Elite 5.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperEliteReconPage() {
  const game = await getReconGameBySlug("sniper-elite-5");
  if (!game) {
    notFound();
  }

  const maps = await listPublicReconMapsForGame(game.id);

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Sniper Elite 5 Recon"
            description="Curated interactive guide layers for Sniper Elite 5. Mission maps stay hidden until their custom schematic maps and marker data are ready."
          />
          <SecondaryLink href="/recon">Recon overview</SecondaryLink>
        </div>
      </Section>

      <Section className="pt-4">
        {maps.length === 0 ? (
          <EmptyState
            title="No Sniper Elite 5 maps are public yet"
            description="Draft mission records exist for internal coordinate capture, but public mission map pages remain hidden until their Vaexil-authored map plates and markers are verified."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {maps.map((map) => (
              <Link
                key={map.id}
                href={`/recon/sniper-elite-5/${map.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
              >
                <MapIcon className="size-7 text-cyan-200" aria-hidden="true" />
                <h2 className="mt-6 text-xl font-semibold text-white">
                  {map.title}
                </h2>
                {map.subtitle ? (
                  <p className="mt-2 text-sm text-slate-500">
                    {map.subtitle}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {map.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section className="pt-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
          <ShieldCheck className="size-6 text-cyan-200" aria-hidden="true" />
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Recon does not use Sniper Elite Maps or Guides4Gamers assets,
            marker coordinates, or copied guide text. Published entries must be
            Vaexil-curated.
          </p>
        </div>
      </Section>
    </>
  );
}
