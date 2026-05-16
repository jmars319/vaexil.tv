import {
  EmptyState,
  PrimaryLink,
  Section,
  SectionHeading,
  SecondaryLink,
} from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/admin";
import {
  getReconGameBySlug,
  listPublicReconMapsForGame,
} from "@/lib/repository";
import { Map as MapIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "HITMAN Recon",
  description:
    "Vaexil Recon map and guide shell for HITMAN World of Assassination.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HitmanReconPage() {
  const game = await getReconGameBySlug("hitman");
  if (!game) {
    notFound();
  }

  const maps = await listPublicReconMapsForGame(game.id);
  const isAdmin = await isAdminAuthenticated();

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="HITMAN Recon"
            description="Curated interactive guide layers for HITMAN. Map pages stay hidden until their custom schematic maps and marker data are ready."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/guides/freelancer-free-items">
              Current guide
            </PrimaryLink>
            <SecondaryLink href="/recon">Recon overview</SecondaryLink>
            {isAdmin ? (
              <SecondaryLink href="/admin/recon">Recon admin</SecondaryLink>
            ) : null}
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        {maps.length === 0 ? (
          <EmptyState
            title="No HITMAN maps are public yet"
            description="Draft map records exist for internal coordinate capture, but public HITMAN map pages remain hidden until their Vaexil-authored map plates and markers are verified."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {maps.map((map) => (
              <Link
                key={map.id}
                href={`/recon/hitman/${map.slug}`}
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
            Recon does not use HITMAPS assets, API data, marker coordinates, or
            copied guide text. Published entries must be Vaexil-curated.
          </p>
        </div>
      </Section>
    </>
  );
}
