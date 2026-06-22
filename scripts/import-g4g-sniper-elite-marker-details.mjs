import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const today = new Date().toISOString().slice(0, 10);
const dryRun = !process.argv.includes("--write");
const downloadImages = !process.argv.includes("--skip-images");
const gameArgs = process.argv.slice(2).flatMap((arg, index, args) => {
  if (arg === "--game" && args[index + 1]) return [args[index + 1]];
  if (arg.startsWith("--game=")) return [arg.slice("--game=".length)];
  return [];
});

// G4G source contract
const gameConfigs = {
  "sniper-elite-5": {
    gameId: "sniper-elite-5",
    gameShort: "se5",
    sourcePath: "sniper-elite-5",
    sourceName: "Guides4Gamers Sniper Elite 5 Campaign Maps",
    campaignMapId: 144,
    missions: [
      ["atlantic-wall", "The Atlantic Wall"],
      ["occupied-residence", "Occupied Residence"],
      ["spy-academy", "Spy Academy"],
      ["war-factory", "War Factory"],
      ["festung-guernsey", "Festung Guernsey"],
      ["liberation", "Liberation"],
      ["secret-weapons", "Secret Weapons"],
      ["rubble-and-ruin", "Rubble and Ruin"],
    ],
    singleMaps: [
      ["wolf-mountain", "Wolf Mountain", 145],
      ["landing-force", "Landing Force", 149],
      ["conqueror", "Conqueror", 170],
      ["rough-landing", "Rough Landing", 180],
      ["kraken-awakes", "Kraken Awakes", 191],
    ],
  },
  "sniper-elite-resistance": {
    gameId: "sniper-elite-resistance",
    gameShort: "ser",
    sourcePath: "sniper-elite-resistance",
    sourceName: "Guides4Gamers Sniper Elite: Resistance Campaign Maps",
    campaignMapId: 237,
    missions: [
      ["behind-enemy-lines", "Behind Enemy Lines"],
      ["dead-drop", "Dead Drop"],
      ["sonderzuge-sabotage", "Sonderzüge Sabotage"],
      ["collision-course", "Collision Course"],
      ["devils-cauldron", "Devil's Cauldron"],
      ["assault-on-fort-rouge", "Assault on Fort Rouge"],
      ["lock-stock-and-barrels", "Lock, Stock and Barrels"],
      ["end-of-the-line", "End of the Line"],
      ["all-or-nothing", "All or Nothing"],
    ],
    singleMaps: [
      ["lights-camera-achtung", "Lights, Camera, Achtung!", 238],
      ["vercors-vendetta", "Vercors Vendetta", 247],
      ["striking-range", "Striking Range", 250],
      ["mud-and-thunder", "Mud and Thunder", 273],
    ],
  },
};

const selectedConfigs = gameArgs.length > 0
  ? gameArgs.map((gameId) => {
      const config = gameConfigs[gameId];
      if (!config) throw new Error(`No marker-detail import config matched ${gameId}`);
      return config;
    })
  : Object.values(gameConfigs);

// JSON file boundary
function jsonUrl(path) {
  return new URL(path, root);
}

async function readJson(path) {
  return JSON.parse(await readFile(jsonUrl(path), "utf8"));
}

async function writeJson(path, value) {
  const formatted = `${JSON.stringify(value, null, 2)}\n`;
  if (dryRun) {
    console.log(`[dry-run] would write ${path}`);
    return;
  }
  await writeFile(jsonUrl(path), formatted);
}

function missionId(config, mission) {
  return `${config.gameShort}-${mission[0]}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

// Source content normalization
function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s*\n\s*/g, "\n")
      .trim(),
  );
}

function descriptionText(html) {
  if (!html) return "";
  const withoutScreens = html
    .replace(/<span\s+class=["']screenshot["'][\s\S]*?<\/span>/gi, " ")
    .replace(/<p\s+class=["']poi-tooltip["'][\s\S]*?<\/p>/gi, " ")
    .replace(/<div\s+class=["']related-pois["'][\s\S]*?<\/div>/gi, " ");
  return stripHtml(withoutScreens).replace(/\n{2,}/g, "\n").trim();
}

function extractScreenshots(html) {
  const screenshots = [];
  const seen = new Set();
  const pattern = /<a[^>]+href=["'](https:\/\/guides4gamers\.com\/sites\/\d+\/screenshots\/[^"']+)["'][^>]*>\s*<img[^>]+src=["'](https:\/\/guides4gamers\.com\/sites\/\d+\/screenshots\/[^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const highResUrl = match[1];
    const thumbnailUrl = match[2];
    if (seen.has(thumbnailUrl)) continue;
    seen.add(thumbnailUrl);
    screenshots.push({ thumbnailUrl, highResUrl });
  }
  return screenshots;
}

function safeFilePart(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function markerId(config, mission, sourceMarkerId) {
  return `g4g-${config.gameShort}-${mission[0]}-${sourceMarkerId}`;
}

function imageAssetId(config, mission, sourceMarkerId, index) {
  return `g4g-${config.gameShort}-${mission[0]}-${sourceMarkerId}-context-${index + 1}`;
}

function imagePath(config, mission, sourceMarkerId, index) {
  return `private/recon/markers/${config.sourcePath}/${mission[0]}/${safeFilePart(sourceMarkerId)}-${String(index + 1).padStart(2, "0")}.jpg`;
}

// Private media boundary
async function downloadFile(url, relativePath) {
  const outputPath = join(rootPath, relativePath);
  if (existsSync(outputPath)) return;
  if (dryRun || !downloadImages) {
    console.log(`[dry-run] would download ${url} -> ${relativePath}`);
    return;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

// Marker detail contract
function buildDetail(config, existingDetail, markerSeed, mission, sourceMarkerId, poi, mediaAssetIds) {
  const sourceText = descriptionText(String(poi.description || ""));
  const existingLocationHint = existingDetail?.locationHint || "";
  const existingIsPendingFallback = /source marker context pending review\.$/.test(existingLocationHint);
  const existingNotes = existingDetail?.notes || [];
  const notes = uniqueStrings([
    "Private Guides4Gamers marker context imported for admin-only Recon review.",
    "Do not publish copied source prose or screenshots; verify and rewrite before public release.",
    ...existingNotes,
  ]);

  return {
    markerId: markerId(config, mission, sourceMarkerId),
    mapId: missionId(config, mission),
    visibility: "private",
    status: existingDetail?.status || "draft",
    lastReviewed: today,
    locationHint: sourceText ||
      (!existingIsPendingFallback ? existingLocationHint : "") ||
      markerSeed?.description ||
      `${mission[1]} source marker context pending review.`,
    howToSteps: existingDetail?.howToSteps || [],
    requirements: existingDetail?.requirements || [],
    notes,
    mediaAssetIds,
  };
}

function buildImageAsset(config, mission, sourceMarkerId, poi, screenshot, index) {
  const label = String(poi.name || poi.name_sub || "Marker context").replace(/^M\d{2}:\s*/i, "").trim();
  return {
    id: imageAssetId(config, mission, sourceMarkerId, index),
    gameId: config.gameId,
    mapId: missionId(config, mission),
    type: "marker_context",
    path: imagePath(config, mission, sourceMarkerId, index),
    width: 320,
    height: 180,
    sourceName: `${config.sourceName} marker screenshot`,
    sourceUrl: screenshot.highResUrl,
    license: "Third-party screenshot; private draft review use approved by owner",
    attribution: "Guides4Gamers",
    imported: true,
    status: "candidate",
    visibility: "private",
    notes: `Private source screenshot for ${mission[1]} / ${label}. Not approved for public publication; use only as admin review context.`,
  };
}

// Campaign cell workflow
function expectedCampaignDetails(config, payload, existingByMarkerId, markerById) {
  const cellSize = payload.map.width / 3;
  const details = [];
  const assets = [];
  const downloads = [];

  for (const [index, mission] of config.missions.entries()) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const minX = col * cellSize;
    const maxX = (col + 1) * cellSize;
    const minY = row * cellSize;
    const maxY = (row + 1) * cellSize;

    for (const [sourceMarkerId, poi] of Object.entries(payload.pois)) {
      if (poi.x < minX || poi.x >= maxX || poi.y < minY || poi.y >= maxY) continue;
      const screenshots = extractScreenshots(String(poi.description || ""));
      const markerMediaAssets = screenshots.map((screenshot, imageIndex) =>
        buildImageAsset(config, mission, sourceMarkerId, poi, screenshot, imageIndex),
      );
      details.push(
        buildDetail(
          config,
          existingByMarkerId.get(markerId(config, mission, sourceMarkerId)),
          markerById.get(markerId(config, mission, sourceMarkerId)),
          mission,
          sourceMarkerId,
          poi,
          markerMediaAssets.map((asset) => asset.id),
        ),
      );
      assets.push(...markerMediaAssets);
      downloads.push(...markerMediaAssets.map((asset, imageIndex) => ({
        url: screenshots[imageIndex].thumbnailUrl,
        path: asset.path,
      })));
    }
  }

  return { details, assets, downloads };
}

// Single map workflow
function expectedSingleDetails(config, mission, payload, existingByMarkerId, markerById) {
  const details = [];
  const assets = [];
  const downloads = [];

  for (const [sourceMarkerId, poi] of Object.entries(payload.pois)) {
    const screenshots = extractScreenshots(String(poi.description || ""));
    const markerMediaAssets = screenshots.map((screenshot, imageIndex) =>
      buildImageAsset(config, mission, sourceMarkerId, poi, screenshot, imageIndex),
    );
    details.push(
      buildDetail(
        config,
        existingByMarkerId.get(markerId(config, mission, sourceMarkerId)),
        markerById.get(markerId(config, mission, sourceMarkerId)),
        mission,
        sourceMarkerId,
        poi,
        markerMediaAssets.map((asset) => asset.id),
      ),
    );
    assets.push(...markerMediaAssets);
    downloads.push(...markerMediaAssets.map((asset, imageIndex) => ({
      url: screenshots[imageIndex].thumbnailUrl,
      path: asset.path,
    })));
  }

  return { details, assets, downloads };
}

// Download concurrency boundary
async function runDownloads(downloads) {
  const concurrency = 10;
  let index = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (index < downloads.length) {
      const current = downloads[index];
      index += 1;
      await downloadFile(current.url, current.path);
    }
  }));
}

function sortById(items) {
  return [...items].sort((a, b) => String(a.id || a.markerId).localeCompare(String(b.id || b.markerId)));
}

async function collectConfigDetails(config, existingByMarkerId, markerById) {
  const generatedAssets = [];
  const generatedDetails = [];
  const downloads = [];

  const campaignPayload = await fetchJson(`https://guides4gamers.com/json/map.2.0.php?id=${config.campaignMapId}`);
  const campaign = expectedCampaignDetails(config, campaignPayload, existingByMarkerId, markerById);
  generatedDetails.push(...campaign.details);
  generatedAssets.push(...campaign.assets);
  downloads.push(...campaign.downloads);

  for (const mission of config.singleMaps) {
    const payload = await fetchJson(`https://guides4gamers.com/json/map.2.0.php?id=${mission[2]}`);
    const single = expectedSingleDetails(config, mission, payload, existingByMarkerId, markerById);
    generatedDetails.push(...single.details);
    generatedAssets.push(...single.assets);
    downloads.push(...single.downloads);
  }

  return { generatedDetails, generatedAssets, downloads };
}

// Private import merge boundary
async function main() {
  const [assets, details, markers] = await Promise.all([
    readJson("src/data/recon/asset-manifest.json"),
    readJson("src/data/recon/marker-details.json"),
    readJson("src/data/recon/marker-seeds.json"),
  ]);
  const selectedGameIds = new Set(selectedConfigs.map((config) => config.gameId));
  const selectedShorts = new Set(selectedConfigs.map((config) => config.gameShort));
  const existingByMarkerId = new Map(details.map((detail) => [detail.markerId, detail]));
  const markerById = new Map(markers.map((marker) => [marker.id, marker]));
  const nextDetails = details.filter(
    (detail) => ![...selectedShorts].some((gameShort) => String(detail.markerId).startsWith(`g4g-${gameShort}-`)),
  );
  const generatedAssets = [];
  const generatedDetails = [];
  const downloads = [];

  for (const config of selectedConfigs) {
    const collected = await collectConfigDetails(config, existingByMarkerId, markerById);
    generatedDetails.push(...collected.generatedDetails);
    generatedAssets.push(...collected.generatedAssets);
    downloads.push(...collected.downloads);
  }

  const generatedAssetIds = new Set(generatedAssets.map((asset) => asset.id));
  const nextAssets = [
    ...assets.filter((asset) => {
      if (generatedAssetIds.has(asset.id)) return false;
      return !(selectedGameIds.has(asset.gameId) && asset.type === "marker_context" && String(asset.sourceName || "").includes("Guides4Gamers"));
    }),
    ...generatedAssets,
  ];

  await runDownloads(downloads);
  await writeJson("src/data/recon/asset-manifest.json", sortById(nextAssets));
  await writeJson("src/data/recon/marker-details.json", sortById([...nextDetails, ...generatedDetails]));

  console.log(
    `${dryRun ? "Prepared" : "Imported"} ${generatedDetails.length} marker details and ${generatedAssets.length} private context screenshots for ${[...selectedGameIds].join(", ")}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
