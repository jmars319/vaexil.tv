export type ReconSourceReference = {
  label: string;
  url: string;
  note: string;
};

export type ReconPoiCandidate = {
  label: string;
  category: string;
  confidence: "approximate" | "verified" | "unverified";
  notes: string;
};

export type ReconSourcePacket = {
  mapId: string;
  gameId: string;
  status: string;
  lastReviewed: string;
  officialSources: ReconSourceReference[];
  referenceSources: ReconSourceReference[];
  verifiedNamedAreas: string[];
  approximateAreas: string[];
  poiCandidates: ReconPoiCandidate[];
  uncertaintyNotes: string[];
  avoidCopying: string[];
};

export async function listStaticReconSourcePackets() {
  const sourcePacketData = await import("@/data/recon/source-packets.json");
  return sourcePacketData.default as ReconSourcePacket[];
}

export async function getStaticReconSourcePacket(mapId: string) {
  const packets = await listStaticReconSourcePackets();
  return packets.find((packet) => packet.mapId === mapId) || null;
}
