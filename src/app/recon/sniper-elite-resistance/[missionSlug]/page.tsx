import {
  generateSniperEliteMapMetadata,
  renderSniperEliteMapPage,
} from "@/app/recon/_sniper-elite-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SniperEliteResistanceReconMapPageProps = {
  params: Promise<{ missionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SniperEliteResistanceReconMapPageProps) {
  const { missionSlug } = await params;
  return generateSniperEliteMapMetadata(
    "sniper-elite-resistance",
    missionSlug,
    "Sniper Elite: Resistance Recon map",
  );
}

export default async function SniperEliteResistanceReconMapPage({
  params,
}: SniperEliteResistanceReconMapPageProps) {
  const { missionSlug } = await params;
  return renderSniperEliteMapPage({
    gameSlug: "sniper-elite-resistance",
    missionSlug,
    backHref: "/recon/sniper-elite-resistance",
    backLabel: "Sniper Elite: Resistance Recon",
  });
}
