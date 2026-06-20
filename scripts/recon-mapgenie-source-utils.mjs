import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { categoryMapFor, configs, supportedGameIds } from "./recon-legacy-source-map-config.mjs";

export const root = new URL("../", import.meta.url);
export const rootPath = path.dirname(new URL(import.meta.url).pathname).replace(/\/scripts$/, "");
export const tileSize = 256;
export const defaultTileZoom = 14;

export function parseGameArgs(args) {
  return args.flatMap((arg, index) => {
    if (arg === "--game" && args[index + 1]) return args[index + 1].split(",");
    if (arg.startsWith("--game=")) return arg.slice("--game=".length).split(",");
    return [];
  }).filter(Boolean);
}

export function selectedMapGenieConfigs(args, defaultGameIds = []) {
  const gameIds = parseGameArgs(args);
  const selected = gameIds.length > 0 ? gameIds : defaultGameIds;
  const ids = selected.length > 0 ? selected : configs.map((config) => config.gameId);

  return ids.map((gameId) => {
    if (!supportedGameIds.has(gameId)) {
      throw new Error(`Unsupported MapGenie Recon game: ${gameId}`);
    }
    const config = configs.find((item) => item.gameId === gameId);
    if (!config) throw new Error(`No MapGenie Recon config found for ${gameId}`);
    return config;
  });
}

export function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, root), "utf8"));
}

export async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

export async function fetchMapGenieData(config) {
  const html = await fetchText(config.mapGenieUrl);
  const marker = "window.mapData = ";
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`MapGenie payload missing from ${config.mapGenieUrl}`);
  const jsonStart = start + marker.length;
  const end = html.indexOf(";window.", jsonStart);
  if (end < 0) throw new Error(`MapGenie payload terminator missing from ${config.mapGenieUrl}`);
  return JSON.parse(html.slice(jsonStart, end));
}

export function round4(value) {
  return Math.round(value * 10_000) / 10_000;
}

export function slugTitle(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function paddedBounds(bounds, paddingRatio = 0.025) {
  const width = bounds.east - bounds.west;
  const height = bounds.north - bounds.south;
  return {
    west: bounds.west - width * paddingRatio,
    east: bounds.east + width * paddingRatio,
    south: bounds.south - height * paddingRatio,
    north: bounds.north + height * paddingRatio,
  };
}

export function regionBounds(region) {
  const coordinates = region.features?.[0]?.geometry?.coordinates?.[0] || [];
  if (coordinates.length === 0) {
    throw new Error(`Region ${region.title} is missing polygon coordinates`);
  }
  const lngs = coordinates.map(([lng]) => lng);
  const lats = coordinates.map(([, lat]) => lat);
  return {
    west: Math.min(...lngs),
    east: Math.max(...lngs),
    south: Math.min(...lats),
    north: Math.max(...lats),
  };
}

export function project(lng, lat, zoom) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const scale = tileSize * 2 ** zoom;
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

export function cropGeometry(bounds, zoom = defaultTileZoom) {
  const northwest = project(bounds.west, bounds.north, zoom);
  const southeast = project(bounds.east, bounds.south, zoom);
  const minPixelX = Math.floor(northwest.x);
  const maxPixelX = Math.ceil(southeast.x);
  const minPixelY = Math.floor(northwest.y);
  const maxPixelY = Math.ceil(southeast.y);
  return {
    minPixelX,
    maxPixelX,
    minPixelY,
    maxPixelY,
    width: maxPixelX - minPixelX,
    height: maxPixelY - minPixelY,
  };
}

export function normalizeMarker(location, bounds, zoom = defaultTileZoom) {
  const geometry = cropGeometry(bounds, zoom);
  const point = project(Number(location.longitude), Number(location.latitude), zoom);
  return {
    x: round4(((point.x - geometry.minPixelX) / geometry.width) * 100),
    y: round4(((point.y - geometry.minPixelY) / geometry.height) * 100),
  };
}

export function locationInBounds(location, bounds) {
  const lng = Number(location.longitude);
  const lat = Number(location.latitude);
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  );
}

export function markerLabel(location, categoryTitle) {
  const title = String(location.title || "").trim();
  if (!title) return categoryTitle || "Draft marker";
  return title.replace(/\s+/g, " ");
}

export function markerDescription(mission, categoryTitle) {
  return `${mission.title} ${categoryTitle || "point-of-interest"} draft marker imported from a private external MapGenie review source. Verify exact placement, gameplay state, and meaning in-game before publication; replace with manually sourced Vaexil data when available.`;
}

export function sourceUrlFor(config, location) {
  return `${config.mapGenieUrl}?locationIds=${location.id}`;
}

export function buildExpectedMarker(config, mission, location, categoryTitle) {
  const [category, iconKey] = categoryMapFor(config, categoryTitle);
  const coordinates = normalizeMarker(location, mission.bounds, config.tileZoom || defaultTileZoom);
  return {
    id: `mapgenie-${config.prefix}-${mission.slug}-${location.id}`,
    gameId: config.gameId,
    mapId: mission.mapId,
    missionSlug: mission.slug,
    category,
    subcategory: categoryTitle || null,
    label: markerLabel(location, categoryTitle),
    description: markerDescription(mission, categoryTitle),
    x: Math.max(0, Math.min(100, coordinates.x)),
    y: Math.max(0, Math.min(100, coordinates.y)),
    iconKey,
    sourceName: config.sourceName,
    sourceUrl: sourceUrlFor(config, location),
    sourceMarkerId: String(location.id),
  };
}

export function mapMissionsFromRegions(config, data) {
  const regionsByTitle = new Map(Object.values(data.regions || {}).map((region) => [slugTitle(region.title), region]));
  return config.missions.map((mission) => {
    const region = regionsByTitle.get(mission.regionSlug);
    if (!region) return { ...mission, importable: false };
    return {
      ...mission,
      importable: true,
      bounds: paddedBounds(regionBounds(region)),
      sourceRegionId: region.id,
    };
  });
}

export function mapMissionsFromManualBounds(config) {
  return config.missions.map((mission) => ({
    ...mission,
    importable: true,
    bounds: paddedBounds(mission.bounds),
  }));
}

export function categoryTitleById(data) {
  return new Map(Object.values(data.categories || {}).map((category) => [category.id, category.title]));
}

export function missionLocationsByRegion(data, missions) {
  const categories = categoryTitleById(data);
  const output = new Map(missions.map((mission) => [mission.mapId, []]));
  for (const location of data.locations || []) {
    const mission = missions.find((item) => item.importable && item.sourceRegionId === location.region_id);
    if (!mission) continue;
    output.get(mission.mapId).push({
      location,
      categoryTitle: categories.get(location.category_id) || "Point of interest",
    });
  }
  return output;
}

export function missionLocationsByBounds(data, missions) {
  const categories = categoryTitleById(data);
  const starts = new Map(missions.map((mission) => [
    mission.mapId,
    {
      lat: (mission.bounds.north + mission.bounds.south) / 2,
      lng: (mission.bounds.west + mission.bounds.east) / 2,
    },
  ]));
  const output = new Map(missions.map((mission) => [mission.mapId, []]));

  for (const location of data.locations || []) {
    const matches = missions.filter((mission) => mission.importable && locationInBounds(location, mission.bounds));
    if (matches.length === 0) continue;
    const mission = matches.length === 1
      ? matches[0]
      : matches.toSorted((a, b) => {
          const pointA = starts.get(a.mapId);
          const pointB = starts.get(b.mapId);
          const lat = Number(location.latitude);
          const lng = Number(location.longitude);
          return ((lat - pointA.lat) ** 2 + (lng - pointA.lng) ** 2) -
            ((lat - pointB.lat) ** 2 + (lng - pointB.lng) ** 2);
        })[0];

    output.get(mission.mapId).push({
      location,
      categoryTitle: categories.get(location.category_id) || "Point of interest",
    });
  }
  return output;
}

export function collectExpectedMapGenieMarkers(config, data) {
  const missions = config.assignment === "bounds"
    ? mapMissionsFromManualBounds(config)
    : mapMissionsFromRegions(config, data);
  const locationsByMission = config.assignment === "bounds"
    ? missionLocationsByBounds(data, missions)
    : missionLocationsByRegion(data, missions);
  const records = [];

  for (const mission of missions.filter((mission) => mission.importable)) {
    for (const { location, categoryTitle } of locationsByMission.get(mission.mapId) || []) {
      records.push({
        config,
        mission,
        location,
        categoryTitle,
        marker: buildExpectedMarker(config, mission, location, categoryTitle),
      });
    }
  }
  return records;
}

export function mapGenieImageMedia(location) {
  return (Array.isArray(location.media) ? location.media : [])
    .filter((media) => media?.type === "image" && media.url)
    .toSorted((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || String(a.id).localeCompare(String(b.id)));
}

export function safeFilePart(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mediaExtension(media) {
  const fileExtension = String(media.file_name || media.url || "").match(/\.([a-z0-9]+)(?:\?|#|$)/i)?.[1]?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
    return fileExtension === "jpeg" ? "jpg" : fileExtension;
  }
  if (String(media.mime_type || "").includes("png")) return "png";
  if (String(media.mime_type || "").includes("webp")) return "webp";
  return "jpg";
}

export function assertIconFile(icon) {
  if (!icon) return false;
  return existsSync(path.join(process.cwd(), icon.path.replace(/^\//, "public/")));
}
