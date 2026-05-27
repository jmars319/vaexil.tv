import type { ReconMarkerDetailPayload } from "@/lib/types";

export type StaticReconMarkerDetail = ReconMarkerDetailPayload & {
  status: "draft" | "pending" | "ready_for_review" | "verified" | "published";
  lastReviewed?: string;
};

export async function listStaticReconMarkerDetails() {
  const markerDetailData = await import("@/data/recon/marker-details.json");
  return markerDetailData.default as StaticReconMarkerDetail[];
}

export async function listStaticReconMarkerDetailsForMap(mapId: string) {
  const details = await listStaticReconMarkerDetails();
  return details.filter((detail) => detail.mapId === mapId);
}
