import { renderSniperEliteGamePage } from "@/app/recon/_sniper-elite-pages";

export const metadata = {
  title: "Sniper Elite: Resistance Recon",
  description: "Vaexil Recon maps and location guides for Sniper Elite: Resistance.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SniperEliteResistanceReconPage() {
  return renderSniperEliteGamePage({
    gameSlug: "sniper-elite-resistance",
    title: "Sniper Elite: Resistance Recon",
    description:
      "Interactive maps and location guides for Sniper Elite: Resistance. Only reviewed maps and notes are published.",
    emptyTitle: "No Sniper Elite: Resistance maps are public yet",
    emptyDescription:
      "There are no reviewed interactive maps available for this game right now.",
    sourceNote:
      "Recon maps and notes are independently authored for Vaexil. Third-party map art, coordinates, and guide text are not republished.",
  });
}
