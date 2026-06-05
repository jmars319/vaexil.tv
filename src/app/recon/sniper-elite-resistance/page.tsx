import { renderSniperEliteGamePage } from "@/app/recon/_sniper-elite-pages";

export const metadata = {
  title: "Sniper Elite: Resistance Recon",
  description: "Vaexil Recon map and guide shell for Sniper Elite: Resistance.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperEliteResistanceReconPage() {
  return renderSniperEliteGamePage({
    gameSlug: "sniper-elite-resistance",
    title: "Sniper Elite: Resistance Recon",
    description:
      "Curated interactive guide layers for Sniper Elite: Resistance. Mission maps stay hidden until their custom schematic maps and marker data are ready.",
    emptyTitle: "No Sniper Elite: Resistance maps are public yet",
    emptyDescription:
      "Draft mission records exist for internal coordinate capture, but public mission map pages remain hidden until their Vaexil-authored map plates and markers are verified.",
    sourceNote:
      "Public Recon does not expose publisher screenshots, in-game map art, third-party map assets, marker coordinates, or copied guide text. Private Guides4Gamers drafts remain admin-only until Vaexil review.",
  });
}
