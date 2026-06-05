import {
  generateSniperEliteMapMetadata,
  renderSniperEliteMapPage,
} from "@/app/recon/_sniper-elite-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SniperEliteV2RemasteredReconMapPageProps = {
  params: Promise<{ missionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SniperEliteV2RemasteredReconMapPageProps) {
  const { missionSlug } = await params;
  return generateSniperEliteMapMetadata(
    "sniper-elite-v2-remastered",
    missionSlug,
    "Sniper Elite V2 Remastered Recon map",
  );
}

export default async function SniperEliteV2RemasteredReconMapPage({
  params,
}: SniperEliteV2RemasteredReconMapPageProps) {
  const { missionSlug } = await params;
  return renderSniperEliteMapPage({
    gameSlug: "sniper-elite-v2-remastered",
    missionSlug,
    backHref: "/recon/sniper-elite-v2-remastered",
    backLabel: "Sniper Elite V2 Remastered Recon",
  });
}
