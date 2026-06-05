import {
  generateSniperEliteMapMetadata,
  renderSniperEliteMapPage,
} from "@/app/recon/_sniper-elite-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SniperElite4ReconMapPageProps = {
  params: Promise<{ missionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SniperElite4ReconMapPageProps) {
  const { missionSlug } = await params;
  return generateSniperEliteMapMetadata(
    "sniper-elite-4",
    missionSlug,
    "Sniper Elite 4 Recon map",
  );
}

export default async function SniperElite4ReconMapPage({
  params,
}: SniperElite4ReconMapPageProps) {
  const { missionSlug } = await params;
  return renderSniperEliteMapPage({
    gameSlug: "sniper-elite-4",
    missionSlug,
    backHref: "/recon/sniper-elite-4",
    backLabel: "Sniper Elite 4 Recon",
  });
}
