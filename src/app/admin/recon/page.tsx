import { Section, SectionHeading, StatusBadge } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/admin";
import {
  listAdminReconMaps,
  listReconMarkerSuggestions,
} from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import { Crosshair, Map, ShieldCheck } from "lucide-react";
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

export default async function ReconAdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [maps, suggestions] = await Promise.all([
    listAdminReconMaps(),
    listReconMarkerSuggestions(),
  ]);

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
        <div className="grid gap-4 lg:grid-cols-3">
          {maps.map((map) => (
            <Link
              key={map.id}
              href={`/admin/recon/maps/${map.slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <Map className="size-7 text-cyan-200" aria-hidden="true" />
                <StatusBadge status={map.status} />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-white">
                {map.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {map.gameShortTitle}
                {map.subtitle ? ` / ${map.subtitle}` : ""}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {map.imageAsset?.visibility === "private"
                  ? "Private draft asset"
                  : "No private draft asset"}
              </p>
            </Link>
          ))}
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
                    </div>
                    <StatusBadge status={suggestion.status} />
                  </div>
                  <p className="mt-3 font-mono text-sm text-slate-300">
                    x {suggestion.x.toFixed(2)} / y{" "}
                    {suggestion.y.toFixed(2)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
