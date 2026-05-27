import { ReconCoordinateCapture } from "@/components/recon-coordinate-capture";
import { ReconSourceNotes } from "@/components/recon-source-notes";
import { Section, SectionHeading, StatusBadge } from "@/components/ui";
import iconManifest from "@/data/recon/icon-manifest.json";
import { getReconCategoriesForGame } from "@/data/recon/category-registry";
import { getReconMapViews } from "@/data/recon/map-views";
import { isAdminAuthenticated } from "@/lib/admin";
import {
  getReconSourceCrossCheck,
  getReconSourcePacket,
} from "@/lib/recon-review-metadata";
import {
  getAdminReconMapBySlug,
  listAdminReconMaps,
  listAdminReconMarkers,
  listReconAssetsByIds,
  listReconMarkerSuggestions,
} from "@/lib/repository";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Recon Map Admin",
  description: "Protected Recon map coordinate capture.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ReconMapAdminPageProps = {
  params: Promise<{ mapSlug: string }>;
};

export default async function ReconMapAdminPage({
  params,
}: ReconMapAdminPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { mapSlug } = await params;
  const map = await getAdminReconMapBySlug(mapSlug);
  if (!map) {
    notFound();
  }

  const mapViewDefinitions = getReconMapViews(map.id);
  const [markers, suggestions, allMaps, mapViewAssets, sourcePacket, sourceCrossCheck] =
    await Promise.all([
    listAdminReconMarkers(map.id),
    listReconMarkerSuggestions(map.id),
    listAdminReconMaps(),
      listReconAssetsByIds(mapViewDefinitions.map((view) => view.assetId)),
      getReconSourcePacket(map.id),
      getReconSourceCrossCheck(map.id),
    ]);
  const sameGameMaps = allMaps.filter((item) => item.gameId === map.gameId);
  const currentMapIndex = sameGameMaps.findIndex((item) => item.id === map.id);
  const previousMap =
    currentMapIndex > 0 ? sameGameMaps[currentMapIndex - 1] : null;
  const nextMap =
    currentMapIndex >= 0 && currentMapIndex < sameGameMaps.length - 1
      ? sameGameMaps[currentMapIndex + 1]
      : null;
  const privateImageSrc =
    map.imageAsset?.visibility === "private"
      ? `/admin/recon/assets/${map.imageAsset.id}`
      : null;
  const assetById = new Map(mapViewAssets.map((asset) => [asset.id, asset]));
  const mapViews = mapViewDefinitions.map((view) => {
    const asset = assetById.get(view.assetId);

    return {
      ...view,
      imageSrc:
        asset?.visibility === "private"
          ? `/admin/recon/assets/${asset.id}`
          : null,
      width: asset?.width || map.width,
      height: asset?.height || map.height,
    };
  });

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title={`${map.title} capture`}
            description="Click the protected draft map to capture normalized coordinates. Saving creates a pending marker suggestion only."
          />
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={map.status} />
            <StatusBadge status={map.imageAsset?.visibility || "no_asset"} />
            <StatusBadge status={map.imageAsset?.status || "missing_asset"} />
          </div>
        </div>
      </Section>
      <Section className="pt-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <List className="size-3.5" aria-hidden="true" />
                Map navigator
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                {map.gameShortTitle} map set
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Jump between maps in this game while reviewing source notes and
                marker placement.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/recon"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              >
                All maps
              </Link>
              {previousMap ? (
                <Link
                  href={`/admin/recon/maps/${previousMap.slug}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/5 px-4 text-sm font-semibold text-slate-600">
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Previous
                </span>
              )}
              {nextMap ? (
                <Link
                  href={`/admin/recon/maps/${nextMap.slug}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/5 px-4 text-sm font-semibold text-slate-600">
                  Next
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {sameGameMaps.map((item) => {
              const isCurrent = item.id === map.id;

              return (
                <Link
                  key={item.id}
                  href={`/admin/recon/maps/${item.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={
                    isCurrent
                      ? "inline-flex min-h-10 shrink-0 items-center rounded-full border border-cyan-200/50 bg-cyan-300/[0.12] px-4 text-sm font-semibold text-cyan-100"
                      : "inline-flex min-h-10 shrink-0 items-center rounded-full border border-white/10 bg-slate-950/40 px-4 text-sm font-medium text-slate-300 transition hover:border-cyan-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                  }
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </Section>
      <Section className="pt-4">
        <ReconCoordinateCapture
          map={{
            id: map.id,
            gameId: map.gameId,
            gameShortTitle: map.gameShortTitle,
            title: map.title,
            width: map.width,
            height: map.height,
            minZoom: map.minZoom,
            maxZoom: map.maxZoom,
          }}
          imageSrc={privateImageSrc}
          categories={getReconCategoriesForGame(map.gameId)}
          icons={iconManifest.map((icon) => ({
            key: icon.key,
            label: icon.label,
            path: icon.path,
          }))}
          suggestions={suggestions}
          markers={markers.map((marker) => {
            const icon = iconManifest.find((item) => item.key === marker.iconKey);

            return {
              id: marker.id,
              label: marker.label,
              description: marker.description,
              category: marker.category,
              x: marker.x,
              y: marker.y,
              floor: marker.floor,
              iconKey: marker.iconKey,
              iconPath: icon?.path,
              hiddenByDefault: marker.hiddenByDefault,
            };
          })}
          mapViews={mapViews}
        />
      </Section>
      <Section className="pt-4">
        <ReconSourceNotes packet={sourcePacket} crossCheck={sourceCrossCheck} />
      </Section>
    </>
  );
}
