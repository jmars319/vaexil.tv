import { renderSniperEliteGamePage } from "@/app/recon/_sniper-elite-pages";

export const metadata = {
  title: "Sniper Elite 5 Recon",
  description: "Vaexil Recon map and guide shell for Sniper Elite 5.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperEliteReconPage() {
  return renderSniperEliteGamePage({
    gameSlug: "sniper-elite-5",
    title: "Sniper Elite 5 Recon",
    description:
      "Curated interactive guide layers for Sniper Elite 5. Mission maps stay hidden until their custom schematic maps and marker data are ready.",
    emptyTitle: "No Sniper Elite 5 maps are public yet",
    emptyDescription:
      "Draft mission records exist for internal coordinate capture, but public mission map pages remain hidden until their Vaexil-authored map plates and markers are verified.",
    sourceNote:
      "Public Recon does not expose Sniper Elite Maps or Guides4Gamers assets, marker coordinates, or copied guide text. Private Guides4Gamers drafts remain admin-only until Vaexil review.",
  });
}
