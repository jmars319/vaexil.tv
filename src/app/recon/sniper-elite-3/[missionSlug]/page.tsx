import {
  generateSniperEliteMapMetadata,
  renderSniperEliteMapPage,
} from "@/app/recon/_sniper-elite-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SniperElite3ReconMapPageProps = {
  params: Promise<{ missionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SniperElite3ReconMapPageProps) {
  const { missionSlug } = await params;
  return generateSniperEliteMapMetadata(
    "sniper-elite-3",
    missionSlug,
    "Sniper Elite 3 Recon map",
  );
}

export default async function SniperElite3ReconMapPage({
  params,
}: SniperElite3ReconMapPageProps) {
  const { missionSlug } = await params;
  return renderSniperEliteMapPage({
    gameSlug: "sniper-elite-3",
    missionSlug,
    backHref: "/recon/sniper-elite-3",
    backLabel: "Sniper Elite 3 Recon",
  });
}
