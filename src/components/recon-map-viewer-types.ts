export type ReconViewerCategory = {
  key: string;
  label: string;
  description: string;
  defaultIconKey: string;
  defaultVisible: boolean;
};

export type ReconViewerMarker = {
  id: string;
  label: string;
  description?: string | null;
  category: string;
  x: number;
  y: number;
  floor?: string | null;
  iconKey: string;
  iconPath?: string;
  hiddenByDefault?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  confidence?: "unverified" | "community_supported" | "verified";
  status?: string;
  mode?: string;
  variant?: string;
  detail?: ReconViewerMarkerDetail | null;
  detailStatus?: string | null;
  detailLastReviewed?: string | null;
  media?: ReconViewerMarkerMedia[];
};

export type ReconViewerMarkerDetail = {
  markerId: string;
  mapId: string;
  locationHint?: string;
  howToSteps?: string[];
  requirements?: string[];
  notes?: string[];
  mediaAssetIds?: string[];
};

export type ReconViewerMarkerMedia = {
  assetId: string;
  src: string;
  alt: string;
  caption: string;
  visibility: "private" | "public";
  status: string;
};

export type ReconCoordinate = {
  x: number;
  y: number;
};

export type ReconMapViewerProps = {
  title: string;
  imageSrc?: string | null;
  imageAlt?: string;
  width: number;
  height: number;
  minZoom?: number | null;
  maxZoom?: number | null;
  markers: ReconViewerMarker[];
  categories: ReconViewerCategory[];
  onCoordinateCapture?: (coordinate: ReconCoordinate) => void;
  capturedCoordinate?: ReconCoordinate | null;
  markerSummaryLabel?: string;
  emptyState?: string;
  className?: string;
  viewerMode?: "admin" | "public";
};

export type GestureZoomEvent = Event & {
  clientX?: number;
  clientY?: number;
  scale?: number;
};
