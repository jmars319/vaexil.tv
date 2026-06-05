import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const cacheRoot = join("/tmp", "vaexil-mapgenie-sniper-elite-import-v2");
const writeMode = process.argv.includes("--write");
const overwriteAssets = process.argv.includes("--overwrite-assets");
const today = new Date().toISOString().slice(0, 10);
const tileSize = 256;
const targetMaxSize = 2048;
const defaultTileZoom = 14;
const supportedGameIds = new Set([
  "sniper-elite-v2-remastered",
  "sniper-elite-3",
  "sniper-elite-4",
]);
const selectedGameIds = new Set(
  process.argv
    .filter((arg) => arg.startsWith("--game="))
    .flatMap((arg) => arg.slice("--game=".length).split(","))
    .filter(Boolean),
);

function shouldImportGame(gameId) {
  return selectedGameIds.size === 0 || selectedGameIds.has(gameId);
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, root), "utf8"));
}

async function writeJson(path, value) {
  const formatted = `${JSON.stringify(value, null, 2)}\n`;
  if (!writeMode) {
    console.log(`[dry-run] would write ${path}`);
    return;
  }
  await writeFile(new URL(path, root), formatted);
}

function round4(value) {
  return Math.round(value * 10_000) / 10_000;
}

function slugTitle(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mergeByKey(existing, additions, key) {
  const next = new Map(existing.map((item) => [item[key], item]));
  for (const item of additions) {
    next.set(item[key], item);
  }
  return [...next.values()];
}

function sortById(items) {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function sortByMapId(items) {
  return [...items].sort((a, b) => a.mapId.localeCompare(b.mapId));
}

function sortMaps(items) {
  const order = new Map([
    ["hitman-woa", 10],
    ["sniper-elite-v2-remastered", 20],
    ["sniper-elite-3", 30],
    ["sniper-elite-4", 40],
    ["sniper-elite-5", 50],
    ["sniper-elite-resistance", 60],
  ]);
  return [...items].sort((a, b) => {
    const gameOrder = (order.get(a.gameId) || 999) - (order.get(b.gameId) || 999);
    if (gameOrder !== 0) return gameOrder;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id);
  });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      referer: "https://mapgenie.io/",
    },
  });
  if (response.status === 403 || response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function extractMapData(html, sourceUrl) {
  const marker = "window.mapData = ";
  const start = html.indexOf(marker);
  if (start < 0) {
    throw new Error(`MapGenie payload missing from ${sourceUrl}`);
  }
  const jsonStart = start + marker.length;
  const end = html.indexOf(";window.", jsonStart);
  if (end < 0) {
    throw new Error(`MapGenie payload terminator missing from ${sourceUrl}`);
  }
  return JSON.parse(html.slice(jsonStart, end));
}

async function fetchMapGenieData(config) {
  const cachePath = join(cacheRoot, "html", `${config.sourceSlug}.html`);
  let html;
  if (existsSync(cachePath)) {
    html = await readFile(cachePath, "utf8");
  } else {
    html = await fetchText(config.mapGenieUrl);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, html);
  }
  return extractMapData(html, config.mapGenieUrl);
}

function project(lng, lat, zoom) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const scale = tileSize * 2 ** zoom;
  return {
    x: ((lng + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) *
      scale,
  };
}

function paddedBounds(bounds, paddingRatio = 0.025) {
  const width = bounds.east - bounds.west;
  const height = bounds.north - bounds.south;
  return {
    west: bounds.west - width * paddingRatio,
    east: bounds.east + width * paddingRatio,
    south: bounds.south - height * paddingRatio,
    north: bounds.north + height * paddingRatio,
  };
}

function regionBounds(region) {
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

function tileUrl(tileSet, zoom, x, y) {
  return `https://tiles.mapgenie.io/games/${tileSet.pattern
    .replace("{z}", zoom)
    .replace("{y}", y)
    .replace("{x}", x)}`;
}

async function downloadTile(tileSet, zoom, x, y) {
  const path = join(cacheRoot, "tiles", tileSet.path, String(zoom), String(y), `${x}.jpg`);
  if (existsSync(path)) return path;

  const url = tileUrl(tileSet, zoom, x, y);
  const bytes = await fetchBuffer(url);
  await mkdir(dirname(path), { recursive: true });
  if (bytes) {
    await writeFile(path, bytes);
  } else {
    execFileSync("magick", [
      "-size",
      `${tileSize}x${tileSize}`,
      "xc:#071014",
      "-quality",
      "86",
      path,
    ]);
  }
  return path;
}

async function downloadTiles(tileSet, zoom, tileBounds) {
  const tasks = [];
  for (let y = tileBounds.minTileY; y <= tileBounds.maxTileY; y += 1) {
    for (let x = tileBounds.minTileX; x <= tileBounds.maxTileX; x += 1) {
      tasks.push(() => downloadTile(tileSet, zoom, x, y));
    }
  }

  const concurrency = 10;
  let index = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (index < tasks.length) {
        const task = tasks[index];
        index += 1;
        await task();
      }
    }),
  );
}

function cropGeometry(bounds, zoom = defaultTileZoom) {
  const northwest = project(bounds.west, bounds.north, zoom);
  const southeast = project(bounds.east, bounds.south, zoom);
  const minPixelX = Math.floor(northwest.x);
  const maxPixelX = Math.ceil(southeast.x);
  const minPixelY = Math.floor(northwest.y);
  const maxPixelY = Math.ceil(southeast.y);
  const minTileX = Math.floor(minPixelX / tileSize);
  const maxTileX = Math.floor((maxPixelX - 1) / tileSize);
  const minTileY = Math.floor(minPixelY / tileSize);
  const maxTileY = Math.floor((maxPixelY - 1) / tileSize);

  return {
    minPixelX,
    maxPixelX,
    minPixelY,
    maxPixelY,
    width: maxPixelX - minPixelX,
    height: maxPixelY - minPixelY,
    minTileX,
    maxTileX,
    minTileY,
    maxTileY,
  };
}

function renderedSize(geometry) {
  if (geometry.width >= geometry.height) {
    return {
      width: targetMaxSize,
      height: Math.max(1, Math.round((geometry.height / geometry.width) * targetMaxSize)),
    };
  }

  return {
    width: Math.max(1, Math.round((geometry.width / geometry.height) * targetMaxSize)),
    height: targetMaxSize,
  };
}

async function renderPlate(config, data, mission) {
  const tileSet = data.mapConfig.tile_sets[0];
  const outputPath = join(rootPath, mission.assetPath);
  const zoom = config.tileZoom || defaultTileZoom;
  const outputSize = renderedSize(cropGeometry(mission.bounds, zoom));

  if (existsSync(outputPath) && !overwriteAssets) {
    return outputSize;
  }

  if (!writeMode) {
    console.log(`[dry-run] would render ${mission.assetPath}`);
    return outputSize;
  }

  const geometry = cropGeometry(mission.bounds, zoom);
  await downloadTiles(tileSet, zoom, geometry);

  const compositePath = join(
    cacheRoot,
    "composites",
    config.sourceSlug,
    `${mission.slug}-z${zoom}.jpg`,
  );
  await mkdir(dirname(compositePath), { recursive: true });
  await mkdir(dirname(outputPath), { recursive: true });

  const rowPaths = [];
  for (let y = geometry.minTileY; y <= geometry.maxTileY; y += 1) {
    const rowFiles = [];
    for (let x = geometry.minTileX; x <= geometry.maxTileX; x += 1) {
      rowFiles.push(join(cacheRoot, "tiles", tileSet.path, String(zoom), String(y), `${x}.jpg`));
    }
    const rowPath = join(
      cacheRoot,
      "composites",
      config.sourceSlug,
      `${mission.slug}-z${zoom}-row-${y}.jpg`,
    );
    execFileSync("magick", [...rowFiles, "+append", rowPath]);
    rowPaths.push(rowPath);
  }

  execFileSync("magick", [...rowPaths, "-append", compositePath]);

  const offsetX = geometry.minPixelX - geometry.minTileX * tileSize;
  const offsetY = geometry.minPixelY - geometry.minTileY * tileSize;

  execFileSync("magick", [
    compositePath,
    "-crop",
    `${geometry.width}x${geometry.height}+${offsetX}+${offsetY}`,
    "+repage",
    "-resize",
    `${targetMaxSize}x${targetMaxSize}`,
    "-quality",
    "86",
    outputPath,
  ]);

  return outputSize;
}

function normalizeMarker(location, bounds, zoom = defaultTileZoom) {
  const geometry = cropGeometry(bounds, zoom);
  const point = project(Number(location.longitude), Number(location.latitude), zoom);

  return {
    x: round4(((point.x - geometry.minPixelX) / geometry.width) * 100),
    y: round4(((point.y - geometry.minPixelY) / geometry.height) * 100),
  };
}

function locationInBounds(location, bounds) {
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

function categoryMapFor(config, categoryTitle) {
  const shared = {
    "Mission Start": ["starting_location", "entrance"],
    "Vantage Point": ["sniper", "weapon"],
    Weapon: ["weapon", "weapon"],
    Explosives: ["explosives", "explosive"],
    "Supply Crate": ["supply_pouch", "supply"],
    Miscellaneous: ["poi", "poi"],
    Safe: ["key_or_code", "key"],
  };

  const byGame = {
    "sniper-elite-v2-remastered": {
      "Gold Bar": ["gold_bar", "item"],
      "Wine Bottle": ["wine_bottle", "item"],
      "Ammo Box": ["ammunition", "ammo"],
    },
    "sniper-elite-3": {
      "Collectible Card": ["collectible_card", "document"],
      "Long Shot": ["long_shot", "target"],
      "Sniper Nest": ["sniper_nest", "weapon"],
      "War Diary": ["war_diary", "document"],
      "Weapon Part": ["weapon_part", "weapon"],
      Generator: ["fuse_box", "fuse-box"],
      "Main Objective": ["main_objective", "objective"],
      "Optional Objective": ["optional_objective", "objective"],
    },
    "sniper-elite-4": {
      "Deadeye Target": ["deadeye_target", "target"],
      Document: ["misc_document", "document"],
      "Duty Roster": ["duty_roster", "document"],
      "Last Letter": ["last_letter", "document"],
      "Letter from Home": ["letter_from_home", "document"],
      "Letter to Home": ["letter_to_home", "document"],
      "Sniper Report": ["sniper_report", "document"],
      "Ammo Box": ["ammo_box", "ammo"],
      Challenge: ["medal_related", "medal"],
      Generator: ["generator", "fuse-box"],
      "Primary Objective": ["main_objective", "objective"],
      "Optional Objective": ["optional_objective", "objective"],
    },
  };

  return byGame[config.gameId]?.[categoryTitle] || shared[categoryTitle] || ["poi", "poi"];
}

function markerLabel(location, categoryTitle) {
  const title = String(location.title || "").trim();
  if (!title) return categoryTitle || "Draft marker";
  return title.replace(/\s+/g, " ");
}

function markerDescription(mission, categoryTitle) {
  return `${mission.title} ${categoryTitle || "point-of-interest"} draft marker imported from a private external MapGenie review source. Verify exact placement, gameplay state, and meaning in-game before publication; replace with manually sourced Vaexil data when available.`;
}

function sourceUrlFor(config, location) {
  return `${config.mapGenieUrl}?locationIds=${location.id}`;
}

function buildMarker(config, mission, location, categoryTitle) {
  const [category, iconKey] = categoryMapFor(config, categoryTitle);
  const coordinates = normalizeMarker(location, mission.bounds, config.tileZoom || defaultTileZoom);
  return {
    id: `mapgenie-${config.prefix}-${mission.slug}-${location.id}`,
    gameId: config.gameId,
    mapId: mission.mapId,
    mode: "campaign",
    variant: "mapgenie-atlas-bounds-draft",
    category,
    subcategory: categoryTitle || null,
    label: markerLabel(location, categoryTitle),
    description: markerDescription(mission, categoryTitle),
    x: Math.max(0, Math.min(100, coordinates.x)),
    y: Math.max(0, Math.min(100, coordinates.y)),
    floor: "surface",
    iconKey,
    tags: [
      "mapgenie",
      mission.slug,
      "draft-import",
      "external_source_imported",
      "needs_manual_position_review",
      "manual_replacement_pending",
      "mapgenie-web-mercator-bounds",
      ...(config.gameId === "sniper-elite-4"
        ? ["cross_checked_against_secondary_source"]
        : []),
    ],
    sourceName: config.sourceName,
    sourceUrl: sourceUrlFor(config, location),
    sourceMarkerId: String(location.id),
    confidence: "unverified",
    status: "draft",
    hiddenByDefault: false,
  };
}

function officialReference(config) {
  return {
    label: config.officialLabel,
    url: config.officialUrl,
    note: "Official product context for game and mission scope; no official art, screenshots, UI, or map assets are reused.",
  };
}

function packetFor(config, mission, markerCount) {
  return {
    mapId: mission.mapId,
    gameId: config.gameId,
    status: "research_draft",
    lastReviewed: today,
    officialSources: [officialReference(config)],
    referenceSources: [
      {
        label: config.sourceName,
        url: config.mapGenieUrl,
        note: "Private source-map imagery, category labels, and marker coordinate payload are imported for admin-only draft review. Public publication and manual Vaexil replacement remain blocked.",
      },
      ...config.secondarySources.map((source) => ({
        label: source.label,
        url: source.url,
        note: source.note,
      })),
      {
        label: "First-hand Vaexil gameplay review",
        url: "",
        note: `Required before any ${mission.title} marker becomes verified or published.`,
      },
    ],
    verifiedNamedAreas: [],
    approximateAreas: [
      `${mission.title} private MapGenie source-map plate`,
      `${markerCount} external draft marker coordinates queued for manual review`,
      "Manual Vaexil replacement source pending",
    ],
    poiCandidates: [
      {
        label: `${mission.title} imported marker review`,
        category: "poi",
        confidence: "unverified",
        notes: "External marker seed layer is draft-only and must be reviewed in-game before any confidence upgrade.",
      },
      {
        label: `${mission.title} manual replacement pass`,
        category: "poi",
        confidence: "unverified",
        notes: "Replace this private external source plate with a manually sourced Vaexil map when available while preserving stable map and marker contracts.",
      },
    ],
    uncertaintyNotes: [
      "The active source plate is a private admin-only candidate rendered from MapGenie source tiles and must not be published as a public Recon asset.",
      "Marker positions use MapGenie Web Mercator tile coordinates normalized into the private Recon source plate.",
      "Marker labels are short source titles only; guide prose, screenshots, media, icons, checklist state, route text, and UI are not reused.",
      "All imported markers remain draft/unverified until first-hand Vaexil gameplay review confirms placement and meaning.",
    ],
    avoidCopying: [
      "Rebellion screenshots, in-game map art, UI icons, and marketing images.",
      "MapGenie UI chrome, icons, media attachments, screenshots, checklist state, route prose, and guide descriptions.",
      "Gamepressure, Wand, sniperelite4maps, PowerPyx, PS4Trophies, and similar guide prose, screenshots, routes, UI, icons, and media.",
    ],
  };
}

function crossCheckFor(config, mission, markers) {
  const secondary = config.secondarySources.length > 0;
  return {
    mapId: mission.mapId,
    gameId: config.gameId,
    status: "needs_manual_position_review",
    lastReviewed: today,
    localMarkerCount: markers.length,
    localWorkbenchCount: markers.filter((marker) => marker.category === "workbench").length,
    summary: `${mission.title} now has a private external MapGenie source plate and ${markers.length} draft marker seeds. Manual Vaexil replacement and first-hand gameplay validation are still required before publication.`,
    sources: [
      {
        label: config.sourceName,
        url: config.mapGenieUrl,
        coverage: "external_source_imported",
        notes: "Private admin-only source plate and draft marker coordinates imported. Public asset publication is not approved.",
      },
      ...config.secondarySources.map((source) => ({
        label: source.label,
        url: source.url,
        coverage: source.coverage,
        notes: source.note,
      })),
    ],
    visualReview: {
      status: secondary ? "partial_visual_sources_compared" : "source_limited",
      lastCompared: today,
      summary: secondary
        ? "Primary MapGenie source import is present and secondary source coverage is recorded for manual comparison; exact positions still need first-hand review."
        : "Primary MapGenie source import is present; no independent secondary source pass has been completed for this mission yet.",
      findings: [
        "External source-map plate is private/admin-only and marked for future manual replacement.",
        "Imported markers are source-derived draft review seeds, not verified public guide data.",
        ...(secondary
          ? ["Secondary source coverage is recorded for category and visual comparison only; no secondary marker coordinates are imported."]
          : ["Additional secondary comparison remains pending before confidence can increase."]),
      ],
      manualReviewFocus: [
        "Confirm mission bounds and orientation against gameplay.",
        "Review start, objective, collectible, resource, and challenge layers before changing marker confidence.",
        "Create a manually sourced Vaexil replacement plate when available and preserve stable map/marker IDs where practical.",
      ],
    },
    checks: [
      {
        label: "External source import",
        status: "pending",
        localValue: "private source plate and draft marker seeds",
        sourceValue: "MapGenie map payload",
        notes: "Imported for admin-only review; positions still need manual gameplay validation.",
      },
      {
        label: "Manual replacement",
        status: "pending",
        localValue: "external source active",
        sourceValue: "manual Vaexil source pending",
        notes: "Owner-approved temporary posture is to use external maps now and replace them later.",
      },
      {
        label: "Secondary source check",
        status: secondary ? "scope_delta" : "source_gap",
        localValue: secondary ? "secondary source recorded" : "primary import only",
        sourceValue: secondary ? "secondary source available" : "secondary source pending",
        notes: secondary
          ? "Secondary source is recorded for visual/category comparison only; marker coordinates are not imported from it."
          : "Record a secondary comparison or gameplay pass before increasing confidence.",
      },
    ],
    warnings: [
      "Do not publish this private external map plate.",
      "Do not treat draft marker positions as verified until first-hand gameplay review is recorded.",
    ],
    nextSteps: [
      "Spot-check imported markers by category in the admin map view.",
      "Replace the external source plate with a manually sourced Vaexil version when available.",
      "Only move markers beyond draft/unverified after gameplay validation.",
    ],
  };
}

function sourceGapPacket(existingPacket, config) {
  if (!existingPacket) return null;
  return {
    ...existingPacket,
    lastReviewed: today,
    referenceSources: [
      {
        label: config.sourceName,
        url: config.mapGenieUrl,
        note: "MapGenie source import was found for this title, but this mission has no compatible importable mission region in the current payload.",
      },
      ...existingPacket.referenceSources,
    ],
    approximateAreas: [
      ...existingPacket.approximateAreas,
      "Manual replacement pending because no compatible external mission source was imported for this map.",
    ],
    uncertaintyNotes: [
      "No compatible MapGenie mission region was available for this DLC map during the source-map import pass.",
      ...existingPacket.uncertaintyNotes,
    ],
  };
}

function sourceGapCrossCheck(existing, config, mission) {
  if (!existing) return null;
  return {
    ...existing,
    status: "source_gap",
    lastReviewed: today,
    summary: `${mission.title} remains a source gap: ${config.sourceName} has title coverage, but no compatible campaign/DLC region was available for this mission in the current payload.`,
    visualReview: {
      ...existing.visualReview,
      status: "source_limited",
      lastCompared: today,
      summary: "No compatible external source plate or marker coordinate layer was imported for this DLC mission; manual replacement remains pending.",
      findings: [
        "MapGenie title endpoint exists, but this mission is not represented as an importable mission region in the current payload.",
        "The existing neutral placeholder remains private/admin-only.",
      ],
    },
    checks: [
      ...existing.checks,
      {
        label: "External source import",
        status: "source_gap",
        localValue: "neutral placeholder",
        sourceValue: "no matching MapGenie mission region",
        notes: "Leave this map in manual replacement queue rather than fabricating marker coordinates.",
      },
    ],
    warnings: [
      ...existing.warnings,
      "Manual replacement pending; do not infer DLC marker positions from unrelated maps.",
    ],
  };
}

function buildImportedAsset(config, mission, size) {
  return {
    id: mission.assetId,
    gameId: config.gameId,
    mapId: mission.mapId,
    type: "base_map",
    path: mission.assetPath,
    width: size.width,
    height: size.height,
    sourceName: "MapGenie",
    sourceUrl: config.mapGenieUrl,
    license: "Third-party source map; private draft review use approved by owner",
    attribution: "MapGenie",
    imported: true,
    status: "candidate",
    visibility: "private",
    notes: `Private imported ${mission.title} source map rendered from MapGenie tiles for Recon admin review. Not approved for public publication or marker-coordinate publication.`,
  };
}

function buildMapUpdate(map, mission, size) {
  return {
    ...map,
    description:
      "Draft Recon structure with a private imported external source map for admin-only review and future manual replacement.",
    imageAssetId: mission.assetId,
    width: size.width,
    height: size.height,
    status: "draft",
  };
}

function buildMapView(existingView, mission) {
  return {
    ...(existingView || {
      id: `${mission.mapId}-surface`,
      mapId: mission.mapId,
      label: "Surface",
      shortLabel: "Surface",
      kind: "surface",
      floor: "surface",
      sortOrder: 10,
    }),
    label: "Surface / external source",
    shortLabel: "Source",
    assetId: mission.assetId,
    notes:
      "Private MapGenie external source plate for admin-only draft marker review. Labels: external_source_imported, needs_manual_position_review, manual_replacement_pending.",
  };
}

function mapMissionsFromRegions(config, data) {
  const regionsByTitle = new Map(data.regions.map((region) => [slugTitle(region.title), region]));
  return config.missions
    .map((mission) => {
      const region = regionsByTitle.get(mission.regionSlug);
      if (!region) {
        return {
          ...mission,
          importable: false,
        };
      }
      return {
        ...mission,
        importable: true,
        bounds: paddedBounds(regionBounds(region)),
        sourceRegionId: region.id,
      };
    });
}

function mapMissionsFromManualBounds(config) {
  return config.missions.map((mission) => ({
    ...mission,
    importable: true,
    bounds: paddedBounds(mission.bounds),
  }));
}

function missionLocationsByRegion(config, data, missions) {
  const categoryById = new Map(Object.values(data.categories).map((category) => [category.id, category.title]));
  const output = new Map(missions.map((mission) => [mission.mapId, []]));

  for (const location of data.locations) {
    const mission = missions.find(
      (item) => item.importable && item.sourceRegionId === location.region_id,
    );
    if (!mission) continue;
    output.get(mission.mapId).push({
      location,
      categoryTitle: categoryById.get(location.category_id) || "Point of interest",
    });
  }

  return output;
}

function missionLocationsByBounds(data, missions) {
  const categoryById = new Map(Object.values(data.categories).map((category) => [category.id, category.title]));
  const starts = new Map(
    missions.map((mission) => [
      mission.mapId,
      {
        lat: (mission.bounds.north + mission.bounds.south) / 2,
        lng: (mission.bounds.west + mission.bounds.east) / 2,
      },
    ]),
  );
  const output = new Map(missions.map((mission) => [mission.mapId, []]));

  for (const location of data.locations) {
    const matches = missions.filter(
      (mission) => mission.importable && locationInBounds(location, mission.bounds),
    );
    if (matches.length === 0) continue;

    const mission =
      matches.length === 1
        ? matches[0]
        : matches.toSorted((a, b) => {
            const pointA = starts.get(a.mapId);
            const pointB = starts.get(b.mapId);
            const lat = Number(location.latitude);
            const lng = Number(location.longitude);
            const distanceA = (lat - pointA.lat) ** 2 + (lng - pointA.lng) ** 2;
            const distanceB = (lat - pointB.lat) ** 2 + (lng - pointB.lng) ** 2;
            return distanceA - distanceB;
          })[0];

    output.get(mission.mapId).push({
      location,
      categoryTitle: categoryById.get(location.category_id) || "Point of interest",
    });
  }

  return output;
}

function missionBase(config, slug, title, regionSlug = slug) {
  return {
    slug,
    title,
    mapId: `${config.prefix}-${slug}`,
    assetId: `mapgenie-${config.prefix}-${slug}-source`,
    assetPath: `private/recon/maps/${config.gameId}/${slug}-mapgenie-source.jpg`,
    regionSlug,
  };
}

const v2RegionTitles = new Map([
  ["schoneberg-convoy", "schonberg-convoy"],
  ["mittelwerk-facility", "mittlewerk-facility"],
]);

const se4GridBounds = {
  "san-celini-island": {
    west: -1.043354752962216,
    east: -0.9032790693685229,
    south: 1.0051230017872257,
    north: 1.121832610768294,
  },
  "bitanti-village": {
    west: -0.8574733956066893,
    east: -0.72685551668485,
    south: 1.0029565498270046,
    north: 1.1229220718329458,
  },
  "regilino-viaduct": {
    west: -0.674552613618971,
    east: -0.5466073399274762,
    south: 1.0012189770324227,
    north: 1.12259407779581,
  },
  "lorino-dockyard": {
    west: -0.4947719165689364,
    east: -0.3629168601163144,
    south: 0.9935531713694132,
    north: 1.124438551315265,
  },
  "abrunza-monastery": {
    west: -0.9572837858752621,
    east: -0.8202863000110483,
    south: 0.8691737525685568,
    north: 0.9848854091349466,
  },
  "magazzeno-facility": {
    west: -0.7719986706671307,
    east: -0.6375852575530132,
    south: 0.8676795201014613,
    north: 0.9852758601898444,
  },
  "giovi-fiorini-mansion": {
    west: -0.589781524997079,
    east: -0.43024620992613904,
    south: 0.8562828155101556,
    north: 0.9857666057994123,
  },
  "allagra-fortress": {
    west: -0.7863607248853839,
    east: -0.6232648461764256,
    south: 0.7237215367500909,
    north: 0.8510639491886423,
  },
  "target-fuhrer": {
    west: -0.7752461624027376,
    east: -0.6302330732546579,
    south: 0.5239373893049333,
    north: 0.6542586919110818,
  },
  "deathstorm-inception": {
    west: -0.9758040453355932,
    east: -0.792597964883214,
    south: 0.3875627365802927,
    north: 0.5164387802902439,
  },
  "deathstorm-infiltration": {
    west: -0.7752461624027376,
    east: -0.6302330732546579,
    south: 0.3875627365802927,
    north: 0.5164387802902439,
  },
  "deathstorm-obliteration": {
    west: -0.6081367442146188,
    east: -0.42163395355652256,
    south: 0.3875627365802927,
    north: 0.5164387802902439,
  },
};

const configs = [
  {
    gameId: "sniper-elite-v2-remastered",
    prefix: "sev2r",
    sourceSlug: "sniper-elite-v2-germany",
    sourceName: "MapGenie Sniper Elite V2 Germany Map",
    mapGenieUrl: "https://mapgenie.io/sniper-elite-v2/maps/germany",
    tileZoom: 13,
    officialLabel: "Rebellion - Sniper Elite V2 Remastered",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-v2-remastered",
    assignment: "region",
    secondarySources: [
      {
        label: "GameMappers Sniper Elite V2 map article",
        url: "https://gamemappers.com/sniper-elite-v2-map/",
        coverage: "mapgenie_category_scope_reference",
        note: "MapGenie-backed source context only; no GameMappers UI, prose, screenshots, or marker text is imported separately.",
      },
    ],
    missions: [
      ["prologue", "Prologue"],
      ["schoneberg-convoy", "Schöneberg Convoy"],
      ["mittelwerk-facility", "Mittelwerk Facility"],
      ["kaiser-friedrich-museum", "Kaiser-Friedrich Museum"],
      ["opernplatz", "Opernplatz"],
      ["st-olibartus-church", "St. Olibartus Church"],
      ["tiergarten-flak-tower", "Tiergarten Flak Tower"],
      ["karlshorst-command-post", "Karlshorst Command Post"],
      ["kreuzberg-headquarters", "Kreuzberg Headquarters"],
      ["kopenick-launch-site", "Köpenick Launch Site"],
      ["brandenburg-gate", "Brandenburg Gate"],
    ].map(([slug, title]) =>
      missionBase(
        { prefix: "sev2r", gameId: "sniper-elite-v2-remastered" },
        slug,
        title,
        v2RegionTitles.get(slug) || slug,
      ),
    ),
  },
  {
    gameId: "sniper-elite-3",
    prefix: "se3",
    sourceSlug: "sniper-elite-3-afrika",
    sourceName: "MapGenie Sniper Elite 3 Afrika Map",
    mapGenieUrl: "https://mapgenie.io/sniper-elite-3/maps/afrika",
    officialLabel: "Rebellion - Sniper Elite 3",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-3",
    assignment: "region",
    secondarySources: [
      {
        label: "GameMappers Sniper Elite 3 map article",
        url: "https://gamemappers.com/sniper-elite-3-map/",
        coverage: "mapgenie_category_scope_reference",
        note: "MapGenie-backed source context only; no GameMappers UI, prose, screenshots, or marker text is imported separately.",
      },
      {
        label: "PowerPyx Sniper Elite 3 strategy guide",
        url: "https://www.powerpyx.com/guides/sniper_elite_3.html",
        coverage: "collectible_count_reference",
        note: "Count/category sanity check only; no guide prose, screenshots, routes, video content, or positions are imported.",
      },
    ],
    missions: [
      ["siege-of-tobruk", "Siege of Tobruk"],
      ["gaberoun", "Gaberoun"],
      ["halfaya-pass", "Halfaya Pass"],
      ["fort-rifugio", "Fort Rifugio"],
      ["siwa-oasis", "Siwa Oasis"],
      ["kasserine-pass", "Kasserine Pass"],
      ["ponts-du-fahs-airfield", "Ponts Du Fahs Airfield"],
      ["ratte-factory", "Ratte Factory"],
      ["hunt-the-grey-wolf", "Hunt The Grey Wolf"],
      ["in-shadows", "In Shadows"],
      ["belly-of-the-beast", "Belly of the Beast"],
      ["confrontation", "Confrontation"],
    ].map(([slug, title]) =>
      missionBase({ prefix: "se3", gameId: "sniper-elite-3" }, slug, title),
    ),
  },
  {
    gameId: "sniper-elite-4",
    prefix: "se4",
    sourceSlug: "sniper-elite-4-italia",
    sourceName: "MapGenie Sniper Elite 4 Italia Map",
    mapGenieUrl: "https://mapgenie.io/sniper-elite-4/maps/italia",
    officialLabel: "Rebellion - Sniper Elite 4",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-4",
    assignment: "bounds",
    secondarySources: [
      {
        label: "sniperelite4maps.de",
        url: "https://sniperelite4maps.de/h/",
        coverage: "secondary_visual_and_category_reference",
        note: "Secondary campaign/DLC map source for manual visual/category comparison only; map files, app data, coordinates, UI, icons, and text are not imported.",
      },
      {
        label: "sniperelite4maps GitHub repository",
        url: "https://github.com/lordfiSh/sniperelite4maps",
        coverage: "secondary_source_package_reference",
        note: "Repository/source package availability is recorded for review only; code, map assets, marker data, descriptions, and UI are not reused.",
      },
    ],
    missions: [
      ["san-celini-island", "San Celini Island"],
      ["bitanti-village", "Bitanti Village"],
      ["regilino-viaduct", "Regilino Viaduct"],
      ["lorino-dockyard", "Lorino Dockyard"],
      ["abrunza-monastery", "Abrunza Monastery"],
      ["magazzeno-facility", "Magazzeno Facility"],
      ["giovi-fiorini-mansion", "Giovi Fiorini Mansion"],
      ["allagra-fortress", "Allagra Fortress"],
      ["target-fuhrer", "Target Führer"],
      ["deathstorm-inception", "Deathstorm Part 1: Inception"],
      ["deathstorm-infiltration", "Deathstorm Part 2: Infiltration"],
      ["deathstorm-obliteration", "Deathstorm Part 3: Obliteration"],
    ].map(([slug, title]) => ({
      ...missionBase({ prefix: "se4", gameId: "sniper-elite-4" }, slug, title),
      bounds: se4GridBounds[slug],
    })),
  },
];

for (const gameId of selectedGameIds) {
  if (!supportedGameIds.has(gameId)) {
    throw new Error(`Unsupported --game=${gameId}`);
  }
}

const [maps, assets, views, packets, checks, markerSeeds] = await Promise.all([
  readJson("src/data/recon/maps.json"),
  readJson("src/data/recon/asset-manifest.json"),
  readJson("src/data/recon/map-views.json"),
  readJson("src/data/recon/source-packets.json"),
  readJson("src/data/recon/source-cross-checks.json"),
  readJson("src/data/recon/marker-seeds.json"),
]);

let nextMaps = maps;
let nextAssets = assets;
let nextViews = views;
let nextPackets = packets;
let nextChecks = checks;
let nextMarkers = markerSeeds.filter(
  (marker) =>
    !(
      marker.tags?.includes("mapgenie") &&
      supportedGameIds.has(marker.gameId) &&
      shouldImportGame(marker.gameId)
    ),
);

const mapsById = new Map(maps.map((map) => [map.id, map]));
const viewsById = new Map(views.map((view) => [view.id, view]));
const packetsByMapId = new Map(packets.map((packet) => [packet.mapId, packet]));
const checksByMapId = new Map(checks.map((check) => [check.mapId, check]));

const summary = [];

for (const config of configs.filter((item) => shouldImportGame(item.gameId))) {
  console.log(`${writeMode ? "Importing" : "Preparing"} ${config.gameId} from ${config.mapGenieUrl}`);
  const data = await fetchMapGenieData(config);
  const missions =
    config.assignment === "bounds"
      ? mapMissionsFromManualBounds(config)
      : mapMissionsFromRegions(config, data);
  const locationsByMission =
    config.assignment === "bounds"
      ? missionLocationsByBounds(data, missions)
      : missionLocationsByRegion(config, data, missions);

  const mapUpdates = [];
  const assetUpdates = [];
  const viewUpdates = [];
  const packetUpdates = [];
  const checkUpdates = [];
  const markerUpdates = [];

  for (const mission of missions) {
    const existingMap = mapsById.get(mission.mapId);
    if (!existingMap) {
      throw new Error(`${mission.mapId} does not exist in maps.json`);
    }

    if (!mission.importable) {
      const packet = sourceGapPacket(packetsByMapId.get(mission.mapId), config);
      const check = sourceGapCrossCheck(checksByMapId.get(mission.mapId), config, mission);
      if (packet) packetUpdates.push(packet);
      if (check) checkUpdates.push(check);
      continue;
    }

    const markerInputs = locationsByMission.get(mission.mapId) || [];
    const markers = markerInputs.map(({ location, categoryTitle }) =>
      buildMarker(config, mission, location, categoryTitle),
    );
    const size = await renderPlate(config, data, mission);

    mapUpdates.push(buildMapUpdate(existingMap, mission, size));
    assetUpdates.push(buildImportedAsset(config, mission, size));
    viewUpdates.push(buildMapView(viewsById.get(`${mission.mapId}-surface`), mission));
    packetUpdates.push(packetFor(config, mission, markers.length));
    checkUpdates.push(crossCheckFor(config, mission, markers));
    markerUpdates.push(...markers);
  }

  const nonImportedExistingMaps = maps.filter((map) => map.gameId === config.gameId);
  for (const map of nonImportedExistingMaps) {
    if (missions.some((mission) => mission.mapId === map.id)) continue;
    const packet = sourceGapPacket(packetsByMapId.get(map.id), config);
    const check = sourceGapCrossCheck(checksByMapId.get(map.id), config, {
      mapId: map.id,
      title: map.title,
    });
    if (packet) packetUpdates.push(packet);
    if (check) checkUpdates.push(check);
  }

  nextMaps = mergeByKey(nextMaps, mapUpdates, "id");
  nextAssets = mergeByKey(nextAssets, assetUpdates, "id");
  nextViews = mergeByKey(nextViews, viewUpdates, "id");
  nextPackets = mergeByKey(nextPackets, packetUpdates, "mapId");
  nextChecks = mergeByKey(nextChecks, checkUpdates, "mapId");
  nextMarkers.push(...markerUpdates);
  summary.push({
    gameId: config.gameId,
    importedMaps: mapUpdates.length,
    importedMarkers: markerUpdates.length,
    sourceGaps: packetUpdates.length - mapUpdates.length,
  });
}

nextMaps = sortMaps(nextMaps);
nextAssets = sortById(nextAssets);
nextViews = sortById(nextViews);
nextPackets = sortByMapId(nextPackets);
nextChecks = sortByMapId(nextChecks);
nextMarkers = sortById(nextMarkers);

await writeJson("src/data/recon/maps.json", nextMaps);
await writeJson("src/data/recon/asset-manifest.json", nextAssets);
await writeJson("src/data/recon/map-views.json", nextViews);
await writeJson("src/data/recon/source-packets.json", nextPackets);
await writeJson("src/data/recon/source-cross-checks.json", nextChecks);
await writeJson("src/data/recon/marker-seeds.json", nextMarkers);

console.log(
  `${writeMode ? "Imported" : "Prepared"} legacy source-map upgrades: ${JSON.stringify(summary)}`,
);
