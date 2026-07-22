import { ReconHowToGuides } from "@/components/recon-how-to-guides";
import { ReconPublicMapPreview } from "@/components/recon-public-map-preview";
import type { ReconViewerMarker } from "@/components/recon-map-viewer";
import {
  EmptyState,
  Section,
  SectionHeading,
  SecondaryLink,
} from "@/components/ui";
import iconManifest from "@/data/recon/icon-manifest.json";
import { getReconCategoriesForGame } from "@/data/recon/category-registry";
import { getReconMapViews } from "@/data/recon/map-views";
import { isAdminAuthenticated } from "@/lib/admin";
import { listReconMarkerDetails } from "@/lib/recon-marker-details";
import {
  buildReconViewerMarkers,
  collectReconMarkerDetailAssetIds,
} from "@/lib/recon-viewer-data";
import {
  getPublicReconMap,
  getReconGameBySlug,
  listPublicReconMapsForGame,
  listPublishedReconMarkers,
  listReconAssetsByIds,
} from "@/lib/repository";
import { Map as MapIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type ReconGamePageOptions = {
  gameSlug: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  sourceNote: string;
};

type ReconMapPageOptions = {
  gameSlug: string;
  missionSlug: string;
  backHref: string;
  backLabel: string;
};

export async function renderSniperEliteGamePage({
  gameSlug,
  title,
  description,
  emptyTitle,
  emptyDescription,
  sourceNote,
}: ReconGamePageOptions) {
  const game = await getReconGameBySlug(gameSlug);
  if (!game) {
    notFound();
  }

  const [maps, isAdmin] = await Promise.all([
    listPublicReconMapsForGame(game.id),
    isAdminAuthenticated(),
  ]);

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            level={1}
            title={title}
            description={description}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
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
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {maps.map((map) => (
              <Link
                key={map.id}
                href={`/recon/${game.slug}/${map.slug}`}
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
            {sourceNote}
          </p>
        </div>
      </Section>
    </>
  );
}

export async function generateSniperEliteMapMetadata(
  gameSlug: string,
  missionSlug: string,
  fallbackTitle: string,
) {
  const map = await getPublicReconMap(gameSlug, missionSlug);

  if (!map) {
    return {
      title: fallbackTitle,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${map.title} Recon`,
    description: `Vaexil Recon map and location guide for ${map.title}.`,
  };
}

export async function renderSniperEliteMapPage({
  gameSlug,
  missionSlug,
  backHref,
  backLabel,
}: ReconMapPageOptions) {
  const map = await getPublicReconMap(gameSlug, missionSlug);
  if (!map || !map.imageAsset || map.imageAsset.visibility !== "public") {
    notFound();
  }

  const mapViewDefinitions = getReconMapViews(map.id);
  const [markers, markerDetails] = await Promise.all([
    listPublishedReconMarkers(map.id),
    listReconMarkerDetails(map.id),
  ]);
  const categories = getReconCategoriesForGame(map.gameId);
  const detailAssetIds = collectReconMarkerDetailAssetIds(markerDetails);
  const reconAssets = await listReconAssetsByIds([
    ...mapViewDefinitions.map((view) => view.assetId),
    ...detailAssetIds,
  ]);
  const assetById = new Map(reconAssets.map((asset) => [asset.id, asset]));
  const mapViews = mapViewDefinitions.flatMap((view) => {
    const asset = assetById.get(view.assetId);

    if (!asset || asset.visibility !== "public" || asset.status !== "approved") {
      return [];
    }

    return [
      {
        ...view,
        imageSrc: asset.path,
        width: asset.width || map.width,
        height: asset.height || map.height,
      },
    ];
  });
  const viewerMarkers: ReconViewerMarker[] = buildReconViewerMarkers(
    markers,
    markerDetails,
    reconAssets,
    {
      iconPaths: new Map(iconManifest.map((icon) => [icon.key, icon.path])),
    },
  );

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            level={1}
            title={map.title}
            description={
              map.subtitle
                ? `${map.subtitle}. Only reviewed locations are shown.`
                : "Only reviewed locations are shown."
            }
          />
          <SecondaryLink href={backHref}>{backLabel}</SecondaryLink>
        </div>
      </Section>
      <Section className="pt-4">
        <ReconPublicMapPreview
          title={map.title}
          imageSrc={map.imageAsset.path}
          imageAlt={`${map.title} Recon map`}
          width={map.width}
          height={map.height}
          minZoom={map.minZoom}
          maxZoom={map.maxZoom}
          markers={viewerMarkers}
          categories={categories}
          mapViews={mapViews}
          suggestionContext={{
            gameId: map.gameId,
            mapId: map.id,
            mapTitle: map.title,
            mode: "campaign",
            variant: "any",
          }}
        />
      </Section>
      <Section className="pt-4">
        <ReconHowToGuides markers={viewerMarkers} categories={categories} />
      </Section>
    </>
  );
}
