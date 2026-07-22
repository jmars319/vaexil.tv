import { renderSniperEliteGamePage } from "@/app/recon/_sniper-elite-pages";

export const metadata = {
  title: "Sniper Elite 5 Recon",
  description: "Vaexil Recon maps and location guides for Sniper Elite 5.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperEliteReconPage() {
  return renderSniperEliteGamePage({
    gameSlug: "sniper-elite-5",
    title: "Sniper Elite 5 Recon",
    description:
      "Interactive maps and location guides for Sniper Elite 5. Only reviewed maps and notes are shown.",
    emptyTitle: "No Sniper Elite 5 maps are available yet",
    emptyDescription:
      "There are no reviewed interactive maps available for this game right now.",
    sourceNote:
      "Recon maps and notes are independently authored for Vaexil. Third-party map art, coordinates, and guide text are not republished.",
  });
}
