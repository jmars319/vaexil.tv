export type SuggestionStatus =
  | "pending"
  | "ready_for_review"
  | "verified"
  | "rejected"
  | "published";

export type OfficialGuideItem = {
  id: string;
  itemName: string;
  category: string;
  mapName: string;
  locationDescription: string;
  notes: string;
  verified: boolean;
  createdAt: string;
};

export type CommunitySuggestion = {
  id: string;
  itemName: string;
  category: string;
  mapName: string;
  locationDescription: string;
  notes: string;
  sourceUrl: string | null;
  status: SuggestionStatus;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
  status: string;
  emailStatus: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  viewsLast7Days: number;
  viewsLast30Days: number;
  topPaths: {
    path: string;
    views: number;
  }[];
  recentDays: {
    day: string;
    views: number;
  }[];
};

export type ReconStatus =
  | "draft"
  | "pending"
  | "ready_for_review"
  | "verified"
  | "published"
  | "rejected"
  | "archived";

export type ReconAssetStatus =
  | "placeholder"
  | "candidate"
  | "approved"
  | "rejected"
  | "needs_permission";

export type ReconAssetVisibility = "private" | "public";

export type ReconGame = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ReconAsset = {
  id: string;
  gameId: string;
  mapId: string | null;
  type: string;
  path: string;
  width: number | null;
  height: number | null;
  sourceName: string;
  sourceUrl: string | null;
  license: string;
  attribution: string;
  imported: boolean;
  status: ReconAssetStatus;
  visibility: ReconAssetVisibility;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ReconMap = {
  id: string;
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  gameShortTitle: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageAssetId: string | null;
  width: number;
  height: number;
  minZoom: number | null;
  maxZoom: number | null;
  floorSupport: boolean;
  enabled: boolean;
  status: ReconStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  imageAsset: ReconAsset | null;
};

export type ReconMarker = {
  id: string;
  gameId: string;
  mapId: string;
  mode: string;
  variant: string;
  category: string;
  subcategory: string | null;
  label: string;
  description: string | null;
  x: number;
  y: number;
  floor: string | null;
  iconKey: string;
  tags: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  confidence: "unverified" | "community_supported" | "verified";
  status: ReconStatus;
  hiddenByDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReconMarkerSuggestion = {
  id: string;
  gameId: string;
  gameTitle: string;
  mapId: string;
  mapTitle: string;
  mode: string;
  variant: string;
  category: string;
  label: string;
  description: string | null;
  x: number;
  y: number;
  floor: string | null;
  iconKey: string;
  sourceUrl: string | null;
  status: ReconStatus;
  createdAt: string;
  updatedAt: string;
};

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
