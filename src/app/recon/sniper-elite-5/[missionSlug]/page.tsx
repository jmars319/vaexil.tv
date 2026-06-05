import {
  generateSniperEliteMapMetadata,
  renderSniperEliteMapPage,
} from "@/app/recon/_sniper-elite-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SniperEliteReconMapPageProps = {
  params: Promise<{ missionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SniperEliteReconMapPageProps) {
  const { missionSlug } = await params;
  return generateSniperEliteMapMetadata(
    "sniper-elite-5",
    missionSlug,
    "Sniper Elite 5 Recon map",
  );
}

export default async function SniperEliteReconMapPage({
  params,
}: SniperEliteReconMapPageProps) {
  const { missionSlug } = await params;
  return renderSniperEliteMapPage({
    gameSlug: "sniper-elite-5",
    missionSlug,
    backHref: "/recon/sniper-elite-5",
    backLabel: "Sniper Elite 5 Recon",
  });
}
