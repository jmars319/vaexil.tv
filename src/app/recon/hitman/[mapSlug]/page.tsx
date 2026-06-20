import { ReconHowToGuides } from "@/components/recon-how-to-guides";
import { ReconPublicMapPreview } from "@/components/recon-public-map-preview";
import type { ReconViewerMarker } from "@/components/recon-map-viewer";
import { Section, SectionHeading, SecondaryLink } from "@/components/ui";
import iconManifest from "@/data/recon/icon-manifest.json";
import { getReconCategoriesForGame } from "@/data/recon/category-registry";
import { getReconMapViews } from "@/data/recon/map-views";
import { listReconMarkerDetails } from "@/lib/recon-marker-details";
import {
  buildReconViewerMarkers,
  collectReconMarkerDetailAssetIds,
} from "@/lib/recon-viewer-data";
import {
  getPublicReconMap,
  listReconAssetsByIds,
  listPublishedReconMarkers,
} from "@/lib/repository";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HitmanReconMapPageProps = {
  params: Promise<{ mapSlug: string }>;
};

export async function generateMetadata({ params }: HitmanReconMapPageProps) {
  const { mapSlug } = await params;
  const map = await getPublicReconMap("hitman", mapSlug);

  if (!map) {
    return {
      title: "HITMAN Recon map",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${map.title} Recon`,
    description: `Vaexil Recon map layer for ${map.title}.`,
  };
}

export default async function HitmanReconMapPage({
  params,
}: HitmanReconMapPageProps) {
  const { mapSlug } = await params;
  const map = await getPublicReconMap("hitman", mapSlug);
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
                ? `${map.subtitle}. Published Recon markers only.`
                : "Published Recon markers only."
            }
          />
          <SecondaryLink href="/recon/hitman">HITMAN Recon</SecondaryLink>
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
            mode: "freelancer",
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
