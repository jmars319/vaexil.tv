import { ReconHowToGuides } from "@/components/recon-how-to-guides";
import { ReconPublicMapPreview } from "@/components/recon-public-map-preview";
import type { ReconViewerMarker } from "@/components/recon-map-viewer";
import { Section, SectionHeading, StatusBadge } from "@/components/ui";
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
  getAdminReconMapBySlug,
  listAdminReconMarkers,
  listReconAssetsByIds,
} from "@/lib/repository";
import { ArrowLeft, Crosshair, Eye } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Recon Public Preview",
  description: "Protected public-style Recon map preview.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ReconMapPublicPreviewPageProps = {
  params: Promise<{ mapSlug: string }>;
};

function resolveAdminAssetSrc(
  asset: { id: string; path: string; visibility: string; status: string } | null,
) {
  if (!asset) {
    return null;
  }

  if (asset.visibility === "private") {
    return `/admin/recon/assets/${asset.id}`;
  }

  return asset.status === "approved" ? asset.path : null;
}

export default async function ReconMapPublicPreviewPage({
  params,
}: ReconMapPublicPreviewPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { mapSlug } = await params;
  const map = await getAdminReconMapBySlug(mapSlug);
  if (!map) {
    notFound();
  }

  const mapViewDefinitions = getReconMapViews(map.id);
  const [markers, markerDetails] =
    await Promise.all([
      listAdminReconMarkers(map.id),
      listReconMarkerDetails(map.id),
    ]);
  const categories = getReconCategoriesForGame(map.gameId);
  const detailAssetIds = collectReconMarkerDetailAssetIds(markerDetails);
  const reconAssets = await listReconAssetsByIds([
    ...mapViewDefinitions.map((view) => view.assetId),
    ...detailAssetIds,
  ]);
  const assetById = new Map(reconAssets.map((asset) => [asset.id, asset]));
  const mapViews = mapViewDefinitions.map((view) => {
    const asset = assetById.get(view.assetId);

    return {
      ...view,
      imageSrc: resolveAdminAssetSrc(asset || null),
      width: asset?.width || map.width,
      height: asset?.height || map.height,
    };
  });
  const viewerMarkers: ReconViewerMarker[] = buildReconViewerMarkers(
    markers,
    markerDetails,
    reconAssets,
    {
      iconPaths: new Map(iconManifest.map((icon) => [icon.key, icon.path])),
      adminMode: false,
    },
  );
  const previewImageSrc = resolveAdminAssetSrc(map.imageAsset);

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title={`${map.title} public preview`}
            description="Admin-only preview of the simplified map page. It uses current review markers and public-safe media filtering without publishing the map."
          />
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={map.status} />
            <StatusBadge status={map.imageAsset?.visibility || "no_asset"} />
            <StatusBadge status={map.imageAsset?.status || "missing_asset"} />
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 size-5 shrink-0 text-cyan-200" aria-hidden="true" />
              <p className="text-sm leading-6 text-slate-300">
                This is the public-style presentation only. Private base-map
                assets are loaded through authenticated admin routes; private
                marker media is hidden the same way it would be on a public page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/recon/maps/${map.slug}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              >
                <Crosshair className="size-4" aria-hidden="true" />
                Capture view
              </Link>
              <Link
                href="/admin/recon"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                All maps
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        <ReconPublicMapPreview
          title={map.title}
          imageSrc={previewImageSrc}
          imageAlt={`${map.title} public Recon preview`}
          width={map.width}
          height={map.height}
          minZoom={map.minZoom}
          maxZoom={map.maxZoom}
          markers={viewerMarkers}
          categories={categories}
          mapViews={mapViews}
          markerSummaryLabel="preview markers"
          emptyState="No draft map asset is available for preview yet."
          suggestionContext={{
            gameId: map.gameId,
            mapId: map.id,
            mapTitle: map.title,
            mode: map.gameId === "hitman-woa" ? "freelancer" : "campaign",
            variant: "any",
          }}
        />
      </Section>

      <Section className="pt-4">
        <ReconHowToGuides
          markers={viewerMarkers}
          categories={categories}
          emptyState
        />
      </Section>
    </>
  );
}
