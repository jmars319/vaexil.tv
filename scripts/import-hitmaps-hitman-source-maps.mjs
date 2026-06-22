import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const cacheRoot = join("/tmp", "vaexil-hitmaps-hitman-import");
const writeMode = process.argv.includes("--write");
const overwriteAssets = process.argv.includes("--overwrite-assets");
const targetMaxSize = 2048;
const today = new Date().toISOString().slice(0, 10);

// Hitmaps source contract
const mapSets = [
  {
    mapId: "hitman-ica-facility-freeform-training",
    slug: "ica-facility-freeform-training",
    title: "ICA Facility",
    missionTitle: "Freeform Training",
    hitmapsGame: "hitman",
    locationSlug: "ica-facility",
    missionSlug: "freeform-training",
    mapFolder: "freeform-training",
    fileBase: "freeform-training",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 10,
  },
  {
    mapId: "hitman-ica-facility-final-test",
    slug: "ica-facility-final-test",
    title: "ICA Facility",
    missionTitle: "The Final Test",
    hitmapsGame: "hitman",
    locationSlug: "ica-facility",
    missionSlug: "the-final-test",
    mapFolder: "the-final-test",
    fileBase: "final-test",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 20,
  },
  {
    mapId: "hitman-paris",
    slug: "paris",
    title: "Paris",
    missionTitle: "The Showstopper",
    hitmapsGame: "hitman",
    locationSlug: "paris",
    missionSlug: "the-showstopper",
    mapFolder: "paris",
    fileBase: "paris",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 30,
  },
  {
    mapId: "hitman-sapienza",
    slug: "sapienza",
    title: "Sapienza",
    missionTitle: "World of Tomorrow",
    hitmapsGame: "hitman",
    locationSlug: "sapienza",
    missionSlug: "world-of-tomorrow",
    mapFolder: "sapienza",
    fileBase: "sapienza",
    floorMin: 0,
    floorMax: 7,
    sortOrder: 40,
  },
  {
    mapId: "hitman-marrakesh",
    slug: "marrakesh",
    title: "Marrakesh",
    missionTitle: "A Gilded Cage",
    hitmapsGame: "hitman",
    locationSlug: "marrakesh",
    missionSlug: "a-gilded-cage",
    mapFolder: "marrakesh",
    fileBase: "marrakesh",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 50,
  },
  {
    mapId: "hitman-bangkok",
    slug: "bangkok",
    title: "Bangkok",
    missionTitle: "Club 27",
    hitmapsGame: "hitman",
    locationSlug: "bangkok",
    missionSlug: "club-27",
    mapFolder: "bangkok",
    fileBase: "bangkok",
    floorMin: 0,
    floorMax: 5,
    sortOrder: 60,
  },
  {
    mapId: "hitman-colorado",
    slug: "colorado",
    title: "Colorado",
    missionTitle: "Freedom Fighters",
    hitmapsGame: "hitman",
    locationSlug: "colorado",
    missionSlug: "freedom-fighters",
    mapFolder: "colorado",
    fileBase: "colorado",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 70,
  },
  {
    mapId: "hitman-hokkaido",
    slug: "hokkaido",
    title: "Hokkaido",
    missionTitle: "Situs Inversus",
    hitmapsGame: "hitman",
    locationSlug: "hokkaido",
    missionSlug: "situs-inversus",
    mapFolder: "hokkaido",
    fileBase: "hokkaido",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 80,
  },
  {
    mapId: "hitman-hawkes-bay",
    slug: "hawkes-bay",
    title: "Hawke's Bay",
    missionTitle: "Nightcall",
    hitmapsGame: "hitman2",
    locationSlug: "hawkes-bay",
    missionSlug: "nightcall",
    mapFolder: "hawkes_bay",
    fileBase: "hawkes-bay",
    floorMin: 0,
    floorMax: 2,
    sortOrder: 90,
  },
  {
    mapId: "hitman-miami",
    slug: "miami",
    title: "Miami",
    missionTitle: "The Finish Line",
    hitmapsGame: "hitman2",
    locationSlug: "miami",
    missionSlug: "finish-line",
    mapFolder: "miami",
    fileBase: "miami",
    floorMin: -1,
    floorMax: 3,
    sortOrder: 100,
  },
  {
    mapId: "hitman-santa-fortuna",
    slug: "santa-fortuna",
    title: "Santa Fortuna",
    missionTitle: "Three-Headed Serpent",
    hitmapsGame: "hitman2",
    locationSlug: "santa-fortuna",
    missionSlug: "three-headed-serpent",
    mapFolder: "santa_fortuna",
    fileBase: "santa-fortuna",
    floorMin: -1,
    floorMax: 2,
    sortOrder: 110,
  },
  {
    mapId: "hitman-mumbai",
    slug: "mumbai",
    title: "Mumbai",
    missionTitle: "Chasing a Ghost",
    hitmapsGame: "hitman2",
    locationSlug: "mumbai",
    missionSlug: "chasing-a-ghost",
    mapFolder: "mumbai",
    fileBase: "mumbai",
    floorMin: -1,
    floorMax: 7,
    sortOrder: 120,
  },
  {
    mapId: "hitman-whittleton-creek",
    slug: "whittleton-creek",
    title: "Whittleton Creek",
    missionTitle: "Another Life",
    hitmapsGame: "hitman2",
    locationSlug: "whittleton-creek",
    missionSlug: "another-life",
    mapFolder: "whittleton_creek",
    fileBase: "whittleton-creek",
    floorMin: -1,
    floorMax: 2,
    sortOrder: 130,
  },
  {
    mapId: "hitman-isle-of-sgail",
    slug: "isle-of-sgail",
    title: "Isle of Sgàil",
    missionTitle: "The Ark Society",
    hitmapsGame: "hitman2",
    locationSlug: "isle-of-sgail",
    missionSlug: "ark-society",
    mapFolder: "isle_sgail",
    fileBase: "isle-of-sgail",
    floorMin: 0,
    floorMax: 8,
    sortOrder: 140,
  },
  {
    mapId: "hitman-new-york",
    slug: "new-york",
    title: "New York",
    missionTitle: "Golden Handshake",
    hitmapsGame: "hitman2",
    locationSlug: "new-york",
    missionSlug: "golden-handshake",
    mapFolder: "golden-handshake",
    fileBase: "new-york",
    floorMin: -1,
    floorMax: 3,
    sortOrder: 150,
  },
  {
    mapId: "hitman-haven-island",
    slug: "haven-island",
    title: "Haven Island",
    missionTitle: "The Last Resort",
    hitmapsGame: "hitman2",
    locationSlug: "haven-island",
    missionSlug: "the-last-resort",
    mapFolder: "the-last-resort",
    fileBase: "haven-island",
    floorMin: -3,
    floorMax: 3,
    sortOrder: 160,
  },
  {
    mapId: "hitman-dubai",
    slug: "dubai",
    title: "Dubai",
    missionTitle: "On Top of the World",
    hitmapsGame: "hitman3",
    locationSlug: "dubai",
    missionSlug: "on-top-of-the-world",
    mapFolder: "on-top-of-the-world",
    fileBase: "dubai",
    floorMin: -1,
    floorMax: 5,
    sortOrder: 170,
  },
  {
    mapId: "hitman-dartmoor",
    slug: "dartmoor",
    title: "Dartmoor",
    missionTitle: "Death in the Family",
    hitmapsGame: "hitman3",
    locationSlug: "dartmoor",
    missionSlug: "death-in-the-family",
    mapFolder: "death-in-the-family",
    fileBase: "dartmoor",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 180,
  },
  {
    mapId: "hitman-dartmoor-garden-show",
    slug: "dartmoor-garden-show",
    title: "Dartmoor",
    missionTitle: "The Dartmoor Garden Show",
    hitmapsGame: "hitman3",
    locationSlug: "dartmoor",
    missionSlug: "the-dartmoor-garden-show",
    mapFolder: "the-dartmoor-garden-show",
    fileBase: "dartmoor-garden-show",
    floorMin: 0,
    floorMax: 0,
    sortOrder: 190,
  },
  {
    mapId: "hitman-berlin",
    slug: "berlin",
    title: "Berlin",
    missionTitle: "Apex Predator",
    hitmapsGame: "hitman3",
    locationSlug: "berlin",
    missionSlug: "apex-predator",
    mapFolder: "apex-predator",
    fileBase: "berlin",
    floorMin: -2,
    floorMax: 4,
    sortOrder: 200,
  },
  {
    mapId: "hitman-chongqing",
    slug: "chongqing",
    title: "Chongqing",
    missionTitle: "End of an Era",
    hitmapsGame: "hitman3",
    locationSlug: "chongqing",
    missionSlug: "end-of-an-era",
    mapFolder: "end-of-an-era",
    fileBase: "chongqing",
    floorMin: -3,
    floorMax: 5,
    sortOrder: 210,
  },
  {
    mapId: "hitman-mendoza",
    slug: "mendoza",
    title: "Mendoza",
    missionTitle: "The Farewell",
    hitmapsGame: "hitman3",
    locationSlug: "mendoza",
    missionSlug: "the-farewell",
    mapFolder: "the-farewell",
    fileBase: "mendoza",
    floorMin: 0,
    floorMax: 6,
    sortOrder: 220,
  },
  {
    mapId: "hitman-carpathian-mountains",
    slug: "carpathian-mountains",
    title: "Carpathian Mountains",
    missionTitle: "Untouchable",
    hitmapsGame: "hitman3",
    locationSlug: "carpathian-mountains",
    missionSlug: "untouchable",
    mapFolder: "untouchable",
    fileBase: "carpathian-mountains",
    floorMin: 0,
    floorMax: 3,
    sortOrder: 230,
  },
  {
    mapId: "hitman-ambrose-island",
    slug: "ambrose-island",
    title: "Ambrose Island",
    missionTitle: "Shadows in the Water",
    hitmapsGame: "hitman2",
    locationSlug: "ambrose-island",
    missionSlug: "shadows-in-the-water",
    mapFolder: "shadows-in-the-water",
    fileBase: "ambrose-island",
    floorMin: 0,
    floorMax: 4,
    sortOrder: 240,
  },
];

// JSON file boundary
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

function sortMaps(items) {
  const order = new Map([
    ["hitman-woa", 10],
    ["sniper-elite-3", 20],
    ["sniper-elite-4", 30],
    ["sniper-elite-5", 40],
    ["sniper-elite-resistance", 50],
  ]);
  return [...items].sort((a, b) => {
    const gameOrder = (order.get(a.gameId) || 999) - (order.get(b.gameId) || 999);
    if (gameOrder !== 0) return gameOrder;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id);
  });
}

function sortById(items) {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function sortByMapId(items) {
  return [...items].sort((a, b) => a.mapId.localeCompare(b.mapId));
}

function mergeByKey(existing, updates, key) {
  const next = new Map(existing.map((item) => [item[key], item]));
  for (const item of updates) {
    next.set(item[key], item);
  }
  return [...next.values()];
}

// Source URL contract
function sourcePageUrl(mapSet) {
  return `https://www.hitmaps.com/games/${mapSet.hitmapsGame}/${mapSet.locationSlug}/${mapSet.missionSlug}/`;
}

function sourceSvgUrl(mapSet, floor) {
  return `https://media.hitmaps.com/img/${mapSet.hitmapsGame}/maps/${mapSet.mapFolder}/${floor}.svg`;
}

function levelToken(floor) {
  return floor < 0 ? `minus-${Math.abs(floor)}` : String(floor);
}

function assetId(mapSet, floor) {
  return `hitmaps-${mapSet.mapId}-level-${levelToken(floor)}`;
}

function filePath(mapSet, floor) {
  return `private/recon/maps/${mapSet.mapId}/${mapSet.fileBase}-level-${levelToken(floor)}-hitmaps.png`;
}

function floorShortLabel(floor) {
  if (floor < 0) return `B${Math.abs(floor)}`;
  return `${floor + 1}F`;
}

function viewId(mapSet, floor) {
  return `${mapSet.mapId}-${floorShortLabel(floor).toLowerCase()}`;
}

function floorsFor(mapSet) {
  const floors = [];
  for (let floor = mapSet.floorMin; floor <= mapSet.floorMax; floor += 1) {
    floors.push(floor);
  }
  return floors;
}

// SVG download boundary
async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function downloadSvg(mapSet, floor) {
  const cachePath = join(cacheRoot, mapSet.hitmapsGame, mapSet.mapFolder, `${floor}.svg`);
  if (!existsSync(cachePath)) {
    await mkdir(dirname(cachePath), { recursive: true });
    const body = await fetchBuffer(sourceSvgUrl(mapSet, floor));
    if (writeMode) {
      await writeFile(cachePath, body);
    }
  }
  return cachePath;
}

function imageSize(path) {
  const output = execFileSync("identify", ["-format", "%w %h", path], {
    encoding: "utf8",
  }).trim();
  const [width, height] = output.split(/\s+/).map(Number);
  return { width, height };
}

// Floor render workflow
async function renderFloor(mapSet, floor) {
  const outputPath = join(rootPath, filePath(mapSet, floor));

  if (existsSync(outputPath) && !overwriteAssets) {
    return imageSize(outputPath);
  }

  const svgPath = await downloadSvg(mapSet, floor);
  if (!writeMode) {
    console.log(`[dry-run] would render ${sourceSvgUrl(mapSet, floor)} -> ${filePath(mapSet, floor)}`);
    return { width: targetMaxSize, height: targetMaxSize };
  }

  await mkdir(dirname(outputPath), { recursive: true });
  execFileSync(
    "magick",
    [
      "-background",
      "none",
      svgPath,
      "-resize",
      `${targetMaxSize}x${targetMaxSize}`,
      "-depth",
      "8",
      `PNG32:${outputPath}`,
    ],
    { stdio: "pipe" },
  );

  return imageSize(outputPath);
}

// Recon output contracts
function buildMap(mapSet, existingMap, levelZeroSize) {
  return {
    ...(existingMap || {
      id: mapSet.mapId,
      gameId: "hitman-woa",
      slug: mapSet.slug,
      title: mapSet.title,
      subtitle: mapSet.missionTitle,
      minZoom: 0.5,
      maxZoom: 3,
      floorSupport: true,
      enabled: true,
      status: "draft",
    }),
    slug: existingMap?.slug || mapSet.slug,
    title: existingMap?.title || mapSet.title,
    subtitle: existingMap?.subtitle || mapSet.missionTitle,
    description:
      existingMap?.description ||
      "Draft Recon structure with private imported floor maps for admin-only review.",
    imageAssetId: assetId(mapSet, 0),
    width: levelZeroSize.width,
    height: levelZeroSize.height,
    minZoom: existingMap?.minZoom ?? 0.5,
    maxZoom: existingMap?.maxZoom ?? 3,
    floorSupport: true,
    enabled: existingMap?.enabled ?? true,
    status: existingMap?.status || "draft",
    sortOrder: mapSet.sortOrder,
  };
}

function buildAsset(mapSet, floor, size) {
  const shortLabel = floorShortLabel(floor);
  return {
    id: assetId(mapSet, floor),
    gameId: "hitman-woa",
    mapId: mapSet.mapId,
    type: "base_map",
    path: filePath(mapSet, floor),
    width: size.width,
    height: size.height,
    sourceName: "HITMAPS",
    sourceUrl: sourcePageUrl(mapSet),
    license: "Third-party source map; private draft review use approved by owner",
    attribution: "HITMAPS",
    imported: true,
    status: "candidate",
    visibility: "private",
    notes: `Private imported HITMAN ${mapSet.title} ${mapSet.missionTitle} Level ${floor} (${shortLabel}) source map for floor-specific Recon review. Not approved for public publication or marker-coordinate copying.`,
  };
}

function buildView(mapSet, floor) {
  const shortLabel = floorShortLabel(floor);
  return {
    id: viewId(mapSet, floor),
    mapId: mapSet.mapId,
    label: `${shortLabel} (Level ${floor})`,
    shortLabel,
    kind: "floor",
    floor: shortLabel,
    assetId: assetId(mapSet, floor),
    sortOrder: (floor - mapSet.floorMin + 1) * 10,
    notes: `Actual private HITMAPS floor map for ${mapSet.title} / ${mapSet.missionTitle} Level ${floor} review. Use only for admin coordinate capture and first-hand validation.`,
  };
}

function buildSourcePacket(mapSet) {
  return {
    mapId: mapSet.mapId,
    gameId: "hitman-woa",
    status: "research_draft",
    lastReviewed: today,
    officialSources: [
      {
        label: "IO Interactive - HITMAN World of Assassination",
        url: "https://ioi.dk/hitman",
        note: "Official product and location context for World of Assassination.",
      },
    ],
    referenceSources: [
      {
        label: `HITMAPS - ${mapSet.missionTitle} floor maps`,
        url: sourcePageUrl(mapSet),
        note:
          "Private source-map imagery imported for admin-only floor review; do not copy marker coordinates, checklist data, labels, public UI, API nodes, or guide prose.",
      },
      {
        label: "First-hand Vaexil gameplay review",
        url: "",
        note: `Required before any ${mapSet.title} marker becomes verified or published.`,
      },
    ],
    verifiedNamedAreas: [],
    approximateAreas: [
      `${mapSet.title} / ${mapSet.missionTitle} floor geometry review`,
      "Mission-space circulation, entrances, exits, shortcuts, vertical traversal, and target-area context",
    ],
    poiCandidates: [],
    uncertaintyNotes: [
      "HITMAPS floor map imagery is imported as private admin-only source material for local reference.",
      "Markers still require first-hand Vaexil gameplay validation before they can become verified or published.",
      "No HITMAPS API nodes, guide text, UI data, labels, or marker coordinate data is used.",
    ],
    avoidCopying: [
      "Official screenshots, map art, UI icons, and marketing images.",
      "HITMAPS API nodes, marker coordinates, labels, guide prose, and UI data.",
      "Third-party guide prose, numbered POI lists, annotated screenshots, and route instructions.",
    ],
  };
}

// Recon data merge workflow
const [maps, assets, views, packets] = await Promise.all([
  readJson("src/data/recon/maps.json"),
  readJson("src/data/recon/asset-manifest.json"),
  readJson("src/data/recon/map-views.json"),
  readJson("src/data/recon/source-packets.json"),
]);

const mapsById = new Map(maps.map((map) => [map.id, map]));
const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
const viewsById = new Map(views.map((view) => [view.id, view]));
const viewsByAssetId = new Map(views.map((view) => [view.assetId, view]));
const packetsByMapId = new Map(packets.map((packet) => [packet.mapId, packet]));

const mapUpdates = [];
const assetUpdates = [];
const viewUpdates = [];
const packetUpdates = [];
let renderedFloors = 0;
let reusedFloors = 0;

for (const mapSet of mapSets) {
  const floorSizes = new Map();

  for (const floor of floorsFor(mapSet)) {
    const targetPath = join(rootPath, filePath(mapSet, floor));
    const reused = existsSync(targetPath) && !overwriteAssets;
    const size = await renderFloor(mapSet, floor);
    floorSizes.set(floor, size);
    if (reused) {
      reusedFloors += 1;
    } else {
      renderedFloors += 1;
    }

    const id = assetId(mapSet, floor);
    if (!assetsById.has(id) || overwriteAssets) {
      assetUpdates.push(buildAsset(mapSet, floor, size));
    }

    const currentAssetId = assetId(mapSet, floor);
    const currentViewId = viewId(mapSet, floor);
    if (!viewsById.has(currentViewId) && !viewsByAssetId.has(currentAssetId)) {
      viewUpdates.push(buildView(mapSet, floor));
    }
  }

  mapUpdates.push(buildMap(mapSet, mapsById.get(mapSet.mapId), floorSizes.get(0)));

  if (!packetsByMapId.has(mapSet.mapId)) {
    packetUpdates.push(buildSourcePacket(mapSet));
  }
}

await writeJson(
  "src/data/recon/maps.json",
  sortMaps(mergeByKey(maps, mapUpdates, "id")),
);
await writeJson(
  "src/data/recon/asset-manifest.json",
  sortById(mergeByKey(assets, assetUpdates, "id")),
);
await writeJson(
  "src/data/recon/map-views.json",
  sortById(mergeByKey(views, viewUpdates, "id")),
);
await writeJson(
  "src/data/recon/source-packets.json",
  sortByMapId(mergeByKey(packets, packetUpdates, "mapId")),
);

console.log(
  `${writeMode ? "Imported" : "Prepared"} HITMAPS HITMAN floor maps: ${JSON.stringify({
    mapSets: mapSets.length,
    newMaps: mapUpdates.filter((map) => !mapsById.has(map.id)).length,
    assetUpdates: assetUpdates.length,
    viewUpdates: viewUpdates.length,
    packetUpdates: packetUpdates.length,
    renderedFloors,
    reusedFloors,
  })}`,
);
