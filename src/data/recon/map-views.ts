import mapViews from "@/data/recon/map-views.json";

export type ReconMapViewKind =
  | "overview"
  | "floor"
  | "surface"
  | "underground";

export type ReconMapView = {
  id: string;
  mapId: string;
  label: string;
  shortLabel: string;
  kind: ReconMapViewKind;
  floor: string;
  assetId: string;
  sortOrder: number;
  notes: string;
};

const views = mapViews as ReconMapView[];

export function listReconMapViews() {
  return [...views].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getReconMapViews(mapId: string) {
  return listReconMapViews().filter((view) => view.mapId === mapId);
}
