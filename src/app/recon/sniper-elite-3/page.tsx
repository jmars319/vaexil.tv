import { renderSniperEliteGamePage } from "@/app/recon/_sniper-elite-pages";

export const metadata = {
  title: "Sniper Elite 3 Recon",
  description: "Vaexil Recon maps and location guides for Sniper Elite 3.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperElite3ReconPage() {
  return renderSniperEliteGamePage({
    gameSlug: "sniper-elite-3",
    title: "Sniper Elite 3 Recon",
    description:
      "Interactive maps and location guides for Sniper Elite 3. Only reviewed maps and notes are published.",
    emptyTitle: "No Sniper Elite 3 maps are public yet",
    emptyDescription:
      "There are no reviewed interactive maps available for this game right now.",
    sourceNote:
      "Recon maps and notes are independently authored for Vaexil. Third-party map art, coordinates, and guide text are not republished.",
  });
}
