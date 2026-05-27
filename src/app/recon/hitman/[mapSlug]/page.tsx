import {
  ReconMapViewer,
  type ReconViewerMarker,
} from "@/components/recon-map-viewer";
import { ReconSourceNotes } from "@/components/recon-source-notes";
import { Section, SectionHeading, SecondaryLink } from "@/components/ui";
import iconManifest from "@/data/recon/icon-manifest.json";
import { getReconCategoriesForGame } from "@/data/recon/category-registry";
import {
  getReconSourceCrossCheck,
  getReconSourcePacket,
} from "@/lib/recon-review-metadata";
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

  const [markers, sourcePacket, sourceCrossCheck, markerDetails] = await Promise.all([
    listPublishedReconMarkers(map.id),
    getReconSourcePacket(map.id),
    getReconSourceCrossCheck(map.id),
    listReconMarkerDetails(map.id),
  ]);
  const detailAssets = await listReconAssetsByIds(
    collectReconMarkerDetailAssetIds(markerDetails),
  );
  const viewerMarkers: ReconViewerMarker[] = buildReconViewerMarkers(
    markers,
    markerDetails,
    detailAssets,
    {
      iconPaths: new Map(iconManifest.map((icon) => [icon.key, icon.path])),
    },
  );

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
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
        <ReconMapViewer
          title={map.title}
          imageSrc={map.imageAsset.path}
          imageAlt={`${map.title} Recon map`}
          width={map.width}
          height={map.height}
          minZoom={map.minZoom}
          maxZoom={map.maxZoom}
          markers={viewerMarkers}
          categories={getReconCategoriesForGame(map.gameId)}
        />
      </Section>
      <Section className="pt-4">
        <ReconSourceNotes
          packet={sourcePacket}
          crossCheck={sourceCrossCheck}
          publicMode
        />
      </Section>
    </>
  );
}
