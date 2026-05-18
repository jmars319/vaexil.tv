import type { Row } from "@libsql/client";
import type {
  CommunitySuggestion,
  ContactSubmission,
  OfficialGuideItem,
  ReconAsset,
  ReconAssetStatus,
  ReconAssetVisibility,
  ReconGame,
  ReconMap,
  ReconMarker,
  ReconMarkerSuggestion,
  ReconStatus,
  SuggestionStatus,
} from "@/lib/types";

export function readString(row: Row, key: string) {
  const value = row[key];
  return value == null ? "" : String(value);
}

function readNullableString(row: Row, key: string) {
  const value = row[key];
  return value == null || value === "" ? null : String(value);
}

function readBoolean(row: Row, key: string) {
  return Number(row[key] || 0) === 1;
}

function readNumber(row: Row, key: string) {
  return Number(row[key] || 0);
}

function readNullableNumber(row: Row, key: string) {
  const value = row[key];
  return value == null || value === "" ? null : Number(value);
}

function readStatus(row: Row): SuggestionStatus {
  const value = readString(row, "status");
  if (
    value === "pending" ||
    value === "ready_for_review" ||
    value === "verified" ||
    value === "rejected" ||
    value === "published"
  ) {
    return value;
  }

  return "pending";
}

function readReconStatus(row: Row, key = "status"): ReconStatus {
  const value = readString(row, key);
  if (
    value === "draft" ||
    value === "pending" ||
    value === "ready_for_review" ||
    value === "verified" ||
    value === "published" ||
    value === "rejected" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function readReconAssetStatus(row: Row, key = "status"): ReconAssetStatus {
  const value = readString(row, key);
  if (
    value === "placeholder" ||
    value === "candidate" ||
    value === "approved" ||
    value === "rejected" ||
    value === "needs_permission"
  ) {
    return value;
  }

  return "candidate";
}

function readReconAssetVisibility(
  row: Row,
  key = "visibility",
): ReconAssetVisibility {
  return readString(row, key) === "public" ? "public" : "private";
}

function readStringArray(row: Row, key: string) {
  const raw = readString(row, key);
  if (!raw) {
    return [];
  }

  try {
    const value = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function mapOfficialItem(row: Row): OfficialGuideItem {
  return {
    id: readString(row, "id"),
    itemName: readString(row, "item_name"),
    category: readString(row, "category"),
    mapName: readString(row, "map_name"),
    locationDescription: readString(row, "location_description"),
    notes: readString(row, "notes"),
    verified: Number(row.verified || 0) === 1,
    createdAt: readString(row, "created_at"),
  };
}

export function mapSuggestion(row: Row): CommunitySuggestion {
  return {
    id: readString(row, "id"),
    itemName: readString(row, "item_name"),
    category: readString(row, "category"),
    mapName: readString(row, "map_name"),
    locationDescription: readString(row, "location_description"),
    notes: readString(row, "notes"),
    sourceUrl: readNullableString(row, "source_url"),
    status: readStatus(row),
    voteCount: Number(row.vote_count || 0),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

export function mapContactSubmission(row: Row): ContactSubmission {
  return {
    id: readString(row, "id"),
    name: readString(row, "name"),
    email: readString(row, "email"),
    organization: readString(row, "organization"),
    inquiryType: readString(row, "inquiry_type"),
    message: readString(row, "message"),
    status: readString(row, "status"),
    emailStatus: readString(row, "email_status"),
    createdAt: readString(row, "created_at"),
  };
}

export function mapReconGame(row: Row): ReconGame {
  return {
    id: readString(row, "id"),
    slug: readString(row, "slug"),
    title: readString(row, "title"),
    shortTitle: readString(row, "short_title"),
    description: readString(row, "description"),
    enabled: readBoolean(row, "enabled"),
    sortOrder: readNumber(row, "sort_order"),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

export function mapReconAsset(row: Row, prefix = ""): ReconAsset {
  return {
    id: readString(row, `${prefix}id`),
    gameId: readString(row, `${prefix}game_id`),
    mapId: readNullableString(row, `${prefix}map_id`),
    type: readString(row, `${prefix}type`),
    path: readString(row, `${prefix}path`),
    width: readNullableNumber(row, `${prefix}width`),
    height: readNullableNumber(row, `${prefix}height`),
    sourceName: readString(row, `${prefix}source_name`),
    sourceUrl: readNullableString(row, `${prefix}source_url`),
    license: readString(row, `${prefix}license`),
    attribution: readString(row, `${prefix}attribution`),
    imported: readBoolean(row, `${prefix}imported`),
    status: readReconAssetStatus(row, `${prefix}status`),
    visibility: readReconAssetVisibility(row, `${prefix}visibility`),
    notes: readString(row, `${prefix}notes`),
    createdAt: readString(row, `${prefix}created_at`),
    updatedAt: readString(row, `${prefix}updated_at`),
  };
}

export function mapReconMap(row: Row): ReconMap {
  const hasAsset = readNullableString(row, "asset_id") != null;

  return {
    id: readString(row, "id"),
    gameId: readString(row, "game_id"),
    gameSlug: readString(row, "game_slug"),
    gameTitle: readString(row, "game_title"),
    gameShortTitle: readString(row, "game_short_title"),
    slug: readString(row, "slug"),
    title: readString(row, "title"),
    subtitle: readNullableString(row, "subtitle"),
    description: readNullableString(row, "description"),
    imageAssetId: readNullableString(row, "image_asset_id"),
    width: readNumber(row, "width"),
    height: readNumber(row, "height"),
    minZoom: readNullableNumber(row, "min_zoom"),
    maxZoom: readNullableNumber(row, "max_zoom"),
    floorSupport: readBoolean(row, "floor_support"),
    enabled: readBoolean(row, "enabled"),
    status: readReconStatus(row),
    sortOrder: readNumber(row, "sort_order"),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
    imageAsset: hasAsset ? mapReconAsset(row, "asset_") : null,
  };
}

export function mapReconMarker(row: Row): ReconMarker {
  return {
    id: readString(row, "id"),
    gameId: readString(row, "game_id"),
    mapId: readString(row, "map_id"),
    mode: readString(row, "mode"),
    variant: readString(row, "variant"),
    category: readString(row, "category"),
    subcategory: readNullableString(row, "subcategory"),
    label: readString(row, "label"),
    description: readNullableString(row, "description"),
    x: readNumber(row, "x"),
    y: readNumber(row, "y"),
    floor: readNullableString(row, "floor"),
    iconKey: readString(row, "icon_key"),
    tags: readStringArray(row, "tags_json"),
    sourceName: readNullableString(row, "source_name"),
    sourceUrl: readNullableString(row, "source_url"),
    confidence:
      readString(row, "confidence") === "community_supported" ||
      readString(row, "confidence") === "verified"
        ? (readString(row, "confidence") as ReconMarker["confidence"])
        : "unverified",
    status: readReconStatus(row),
    hiddenByDefault: readBoolean(row, "hidden_by_default"),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

export function mapReconMarkerSuggestion(row: Row): ReconMarkerSuggestion {
  return {
    id: readString(row, "id"),
    gameId: readString(row, "game_id"),
    gameTitle: readString(row, "game_title"),
    mapId: readString(row, "map_id"),
    mapTitle: readString(row, "map_title"),
    mode: readString(row, "mode"),
    variant: readString(row, "variant"),
    category: readString(row, "category"),
    label: readString(row, "label"),
    description: readNullableString(row, "description"),
    x: readNumber(row, "x"),
    y: readNumber(row, "y"),
    floor: readNullableString(row, "floor"),
    iconKey: readString(row, "icon_key"),
    sourceUrl: readNullableString(row, "source_url"),
    status: readReconStatus(row),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

export const reconMapSelect = `
  m.*,
  g.slug AS game_slug,
  g.title AS game_title,
  g.short_title AS game_short_title,
  a.id AS asset_id,
  a.game_id AS asset_game_id,
  a.map_id AS asset_map_id,
  a.type AS asset_type,
  a.path AS asset_path,
  a.width AS asset_width,
  a.height AS asset_height,
  a.source_name AS asset_source_name,
  a.source_url AS asset_source_url,
  a.license AS asset_license,
  a.attribution AS asset_attribution,
  a.imported AS asset_imported,
  a.status AS asset_status,
  a.visibility AS asset_visibility,
  a.notes AS asset_notes,
  a.created_at AS asset_created_at,
  a.updated_at AS asset_updated_at
`;
