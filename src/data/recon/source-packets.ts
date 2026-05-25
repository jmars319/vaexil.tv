import sourcePackets from "@/data/recon/source-packets.json";

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

const packets = sourcePackets as ReconSourcePacket[];

export function listReconSourcePackets() {
  return packets;
}

export function getReconSourcePacket(mapId: string) {
  return packets.find((packet) => packet.mapId === mapId) || null;
}
