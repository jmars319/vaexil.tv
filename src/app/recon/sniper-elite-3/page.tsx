import { renderSniperEliteGamePage } from "@/app/recon/_sniper-elite-pages";

export const metadata = {
  title: "Sniper Elite 3 Recon",
  description: "Vaexil Recon map and guide shell for Sniper Elite 3.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperElite3ReconPage() {
  return renderSniperEliteGamePage({
    gameSlug: "sniper-elite-3",
    title: "Sniper Elite 3 Recon",
    description:
      "Curated interactive guide layers for Sniper Elite 3. Campaign and DLC maps stay hidden until their custom schematic maps and marker data are ready.",
    emptyTitle: "No Sniper Elite 3 maps are public yet",
    emptyDescription:
      "Draft campaign and DLC mission records exist for internal coordinate capture, but public mission map pages remain hidden until their Vaexil-authored map plates and markers are verified.",
    sourceNote:
      "Public Recon does not expose publisher screenshots, in-game map art, third-party map assets, marker coordinates, or copied guide text. Legacy Sniper Elite 3 drafts remain admin-only until Vaexil review.",
  });
}
