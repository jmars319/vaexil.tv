import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectExpectedMapGenieMarkers,
  fetchMapGenieData,
  mapGenieImageMedia,
  mediaExtension,
  safeFilePart,
  selectedMapGenieConfigs,
} from "./recon-mapgenie-source-utils.mjs";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const today = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(2);
const dryRun = !args.includes("--write");
const downloadImages = !args.includes("--skip-images");
const selectedConfigs = selectedMapGenieConfigs(args, ["sniper-elite-4"]);

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

function decodeHtmlEntities(value) {
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

function mapGenieDescriptionText(value) {
  if (!value) return "";
  return decodeHtmlEntities(String(value))
    .replace(/\r/g, "\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function assetId(config, mission, location, index) {
  return `mapgenie-${config.prefix}-${mission.slug}-${location.id}-context-${index + 1}`;
}

function assetPath(config, mission, location, media, index) {
  const extension = mediaExtension(media);
  return `private/recon/markers/${config.gameId}/${mission.slug}/${safeFilePart(location.id)}-${String(index + 1).padStart(2, "0")}.${extension}`;
}

function buildMediaAsset(config, mission, location, markerSeed, media, index) {
  return {
    id: assetId(config, mission, location, index),
    gameId: config.gameId,
    mapId: mission.mapId,
    type: "marker_context",
    path: assetPath(config, mission, location, media, index),
    width: null,
    height: null,
    sourceName: `${config.sourceName} marker media`,
    sourceUrl: media.url,
    license: "Third-party image; private draft review use approved by owner",
    attribution: media.attribution || "MapGenie",
    imported: true,
    status: "candidate",
    visibility: "private",
    notes: `Private MapGenie source image for ${mission.title} / ${markerSeed?.label || location.title || "marker context"}. Not approved for public publication; use only as admin review context.`,
  };
}

function buildDetail(config, existingDetail, markerSeed, mission, location, mediaAssetIds) {
  const sourceText = mapGenieDescriptionText(location.description);
  const sourceHasText = Boolean(sourceText);
  const mediaCount = mediaAssetIds.length;
  const notes = uniqueStrings([
    "Private MapGenie marker context imported for admin-only Recon review.",
    "Do not publish copied source prose or media; verify and rewrite before public release.",
    mediaCount > 0 ? `${mediaCount} private MapGenie context image${mediaCount === 1 ? "" : "s"} attached for local review.` : "",
    ...existingDetail?.notes || [],
  ]);

  return {
    markerId: markerSeed.id,
    mapId: mission.mapId,
    visibility: "private",
    status: existingDetail?.status || "draft",
    lastReviewed: today,
    locationHint: sourceHasText
      ? sourceText
      : existingDetail?.locationHint || markerSeed.description || `${mission.title} source marker context pending review.`,
    howToSteps: existingDetail?.howToSteps || [],
    requirements: existingDetail?.requirements || [],
    notes,
    mediaAssetIds,
  };
}

async function downloadFile(url, relativePath) {
  const outputPath = join(rootPath, relativePath);
  if (existsSync(outputPath)) return;
  if (dryRun || !downloadImages) {
    console.log(`[dry-run] would download ${url} -> ${relativePath}`);
    return;
  }

  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      referer: "https://mapgenie.io/",
    },
  });
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

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

function sortByStableId(items) {
  return [...items].sort((a, b) => String(a.id || a.markerId).localeCompare(String(b.id || b.markerId)));
}

const [assets, details, markers] = await Promise.all([
  readJson("src/data/recon/asset-manifest.json"),
  readJson("src/data/recon/marker-details.json"),
  readJson("src/data/recon/marker-seeds.json"),
]);
const markerById = new Map(markers.map((marker) => [marker.id, marker]));
const existingByMarkerId = new Map(details.map((detail) => [detail.markerId, detail]));
const selectedGameIds = new Set(selectedConfigs.map((config) => config.gameId));
const selectedPrefixes = new Set(selectedConfigs.map((config) => config.prefix));
const generatedDetails = [];
const generatedAssets = [];
const downloads = [];
const summaries = [];

for (const config of selectedConfigs) {
  const data = await fetchMapGenieData(config);
  const records = collectExpectedMapGenieMarkers(config, data);
  let mediaCount = 0;
  let descriptionCount = 0;

  for (const { mission, location, marker } of records) {
    const markerSeed = markerById.get(marker.id);
    if (!markerSeed) throw new Error(`${marker.id} is missing from marker-seeds.json`);
    const mediaItems = mapGenieImageMedia(location);
    const mediaAssets = mediaItems.map((media, index) =>
      buildMediaAsset(config, mission, location, markerSeed, media, index),
    );

    if (mapGenieDescriptionText(location.description)) descriptionCount += 1;
    mediaCount += mediaAssets.length;
    generatedAssets.push(...mediaAssets);
    downloads.push(...mediaAssets.map((asset, index) => ({
      url: mediaItems[index].url,
      path: asset.path,
    })));
    generatedDetails.push(
      buildDetail(
        config,
        existingByMarkerId.get(marker.id),
        markerSeed,
        mission,
        location,
        mediaAssets.map((asset) => asset.id),
      ),
    );
  }

  summaries.push({
    gameId: config.gameId,
    markers: records.length,
    sourceDescriptions: descriptionCount,
    mediaAssets: mediaCount,
  });
}

const generatedAssetIds = new Set(generatedAssets.map((asset) => asset.id));
const nextAssets = [
  ...assets.filter((asset) => {
    if (generatedAssetIds.has(asset.id)) return false;
    return !(selectedGameIds.has(asset.gameId) && asset.type === "marker_context" && String(asset.sourceName || "").includes("MapGenie"));
  }),
  ...generatedAssets,
];
const nextDetails = [
  ...details.filter(
    (detail) => ![...selectedPrefixes].some((prefix) => String(detail.markerId).startsWith(`mapgenie-${prefix}-`)),
  ),
  ...generatedDetails,
];

await runDownloads(downloads);
await writeJson("src/data/recon/asset-manifest.json", sortByStableId(nextAssets));
await writeJson("src/data/recon/marker-details.json", sortByStableId(nextDetails));

for (const summary of summaries) {
  console.log(
    `${dryRun ? "Prepared" : "Imported"} ${summary.markers} marker details, ${summary.sourceDescriptions} source descriptions, and ${summary.mediaAssets} private context images for ${summary.gameId}.`,
  );
}
