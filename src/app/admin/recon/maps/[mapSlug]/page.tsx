import { ReconCoordinateCapture } from "@/components/recon-coordinate-capture";
import { Section, SectionHeading, StatusBadge } from "@/components/ui";
import iconManifest from "@/data/recon/icon-manifest.json";
import { getReconCategoriesForGame } from "@/data/recon/category-registry";
import { isAdminAuthenticated } from "@/lib/admin";
import {
  getAdminReconMapBySlug,
  listReconMarkerSuggestions,
} from "@/lib/repository";
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

  const suggestions = await listReconMarkerSuggestions(map.id);
  const privateImageSrc =
    map.imageAsset?.visibility === "private"
      ? `/admin/recon/assets/${map.imageAsset.id}`
      : null;

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
        />
      </Section>
    </>
  );
}
