import {
  ReconMapViewer,
  type ReconViewerMarker,
} from "@/components/recon-map-viewer";
import { Section, SectionHeading, SecondaryLink } from "@/components/ui";
import iconManifest from "@/data/recon/icon-manifest.json";
import { getReconCategoriesForGame } from "@/data/recon/category-registry";
import {
  getPublicReconMap,
  listPublishedReconMarkers,
} from "@/lib/repository";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SniperEliteReconMapPageProps = {
  params: Promise<{ missionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SniperEliteReconMapPageProps) {
  const { missionSlug } = await params;
  const map = await getPublicReconMap("sniper-elite-5", missionSlug);

  if (!map) {
    return {
      title: "Sniper Elite 5 Recon map",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${map.title} Recon`,
    description: `Vaexil Recon map layer for ${map.title}.`,
  };
}

export default async function SniperEliteReconMapPage({
  params,
}: SniperEliteReconMapPageProps) {
  const { missionSlug } = await params;
  const map = await getPublicReconMap("sniper-elite-5", missionSlug);
  if (!map || !map.imageAsset || map.imageAsset.visibility !== "public") {
    notFound();
  }

  const markers = await listPublishedReconMarkers(map.id);
  const iconByKey = new Map(iconManifest.map((icon) => [icon.key, icon]));
  const viewerMarkers: ReconViewerMarker[] = markers.map((marker) => ({
    id: marker.id,
    label: marker.label,
    description: marker.description,
    category: marker.category,
    x: marker.x,
    y: marker.y,
    iconKey: marker.iconKey,
    iconPath: iconByKey.get(marker.iconKey)?.path,
    hiddenByDefault: marker.hiddenByDefault,
  }));

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
          <SecondaryLink href="/recon/sniper-elite-5">
            Sniper Elite 5 Recon
          </SecondaryLink>
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
    </>
  );
}
