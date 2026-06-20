import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  assertIconFile,
  collectExpectedMapGenieMarkers,
  fetchMapGenieData,
  mapGenieImageMedia,
  readJson,
  selectedMapGenieConfigs,
} from "./recon-mapgenie-source-utils.mjs";

const args = process.argv.slice(2);
const requireDetails = args.includes("--require-details");
const selectedConfigs = selectedMapGenieConfigs(args, ["sniper-elite-4"]);
const maps = readJson("src/data/recon/maps.json");
const markers = readJson("src/data/recon/marker-seeds.json");
const details = readJson("src/data/recon/marker-details.json");
const assets = readJson("src/data/recon/asset-manifest.json");
const icons = readJson("src/data/recon/icon-manifest.json");
const categoryRegistry = `${readFileSync("src/data/recon/category-registry.ts", "utf8")}\n${readFileSync("src/data/recon/sniper-elite-legacy-categories.ts", "utf8")}`;

const mapIds = new Set(maps.map((map) => map.id));
const iconByKey = new Map(icons.map((icon) => [icon.key, icon]));
const markerById = new Map(markers.map((marker) => [marker.id, marker]));
const detailByMarkerId = new Map(details.map((detail) => [detail.markerId, detail]));
const assetById = new Map(assets.map((asset) => [asset.id, asset]));
const failures = [];
const summaries = [];

function assertNear(actual, expected, context) {
  if (Math.abs(Number(actual) - Number(expected)) > 0.0001) {
    failures.push(`${context}: expected ${expected}, found ${actual}`);
  }
}

function expectedMediaAssetId(config, mission, location, index) {
  return `mapgenie-${config.prefix}-${mission.slug}-${location.id}-context-${index + 1}`;
}

for (const config of selectedConfigs) {
  const data = await fetchMapGenieData(config);
  const expectedRecords = collectExpectedMapGenieMarkers(config, data);
  const expectedById = new Map(expectedRecords.map((record) => [record.marker.id, record]));
  const localMarkers = markers.filter(
    (marker) => marker.gameId === config.gameId && marker.tags?.includes("mapgenie"),
  );
  const countsByMap = new Map();
  let detailCount = 0;
  let mediaAssetCount = 0;

  for (const { marker: expected, mission, location } of expectedRecords) {
    countsByMap.set(expected.mapId, (countsByMap.get(expected.mapId) || 0) + 1);
    if (!mapIds.has(expected.mapId)) {
      failures.push(`${expected.id}: expected map ${expected.mapId} is not registered`);
    }

    const icon = iconByKey.get(expected.iconKey);
    if (!icon) {
      failures.push(`${expected.id}: expected icon ${expected.iconKey} is not registered`);
    } else if (!assertIconFile(icon)) {
      failures.push(`${expected.id}: expected icon file is missing at ${icon.path}`);
    }

    if (!categoryRegistry.includes(`key: "${expected.category}"`)) {
      failures.push(`${expected.id}: expected category ${expected.category} is not registered`);
    }

    const local = markerById.get(expected.id);
    if (!local) {
      failures.push(`${expected.id}: missing local marker`);
      continue;
    }

    for (const key of ["gameId", "mapId", "sourceMarkerId", "category", "iconKey", "subcategory", "label", "sourceName", "sourceUrl"]) {
      if ((local[key] ?? null) !== (expected[key] ?? null)) {
        failures.push(`${expected.id}: ${key} expected ${JSON.stringify(expected[key] ?? null)}, found ${JSON.stringify(local[key] ?? null)}`);
      }
    }

    assertNear(local.x, expected.x, `${expected.id} x`);
    assertNear(local.y, expected.y, `${expected.id} y`);

    for (const tag of ["mapgenie", mission.slug, "draft-import", "mapgenie-web-mercator-bounds"]) {
      if (!Array.isArray(local.tags) || !local.tags.includes(tag)) {
        failures.push(`${expected.id}: missing tag ${tag}`);
      }
    }

    if (config.gameId === "sniper-elite-4" && !local.tags?.includes("cross_checked_against_secondary_source")) {
      failures.push(`${expected.id}: missing SE4 secondary-source cross-check tag`);
    }

    if (!requireDetails) continue;
    const detail = detailByMarkerId.get(expected.id);
    if (!detail) {
      failures.push(`${expected.id}: missing private marker detail`);
      continue;
    }
    detailCount += 1;
    if (detail.visibility !== "private") {
      failures.push(`${expected.id}: marker detail should be private`);
    }
    if (!detail.locationHint && !detail.notes?.length) {
      failures.push(`${expected.id}: marker detail should include context text or notes`);
    }

    const expectedMedia = mapGenieImageMedia(location);
    const mediaAssetIds = detail.mediaAssetIds || [];
    if (mediaAssetIds.length !== expectedMedia.length) {
      failures.push(`${expected.id}: expected ${expectedMedia.length} media assets, found ${mediaAssetIds.length}`);
    }
    for (const [index, media] of expectedMedia.entries()) {
      const assetId = expectedMediaAssetId(config, mission, location, index);
      if (!mediaAssetIds.includes(assetId)) {
        failures.push(`${expected.id}: missing media asset link ${assetId}`);
      }
      const asset = assetById.get(assetId);
      if (!asset) {
        failures.push(`${expected.id}: missing media asset record ${assetId}`);
        continue;
      }
      mediaAssetCount += 1;
      if (asset.visibility !== "private" || asset.status !== "candidate" || !asset.imported) {
        failures.push(`${asset.id}: imported marker context should be private candidate-only`);
      }
      if (asset.sourceUrl !== media.url) {
        failures.push(`${asset.id}: source URL expected ${media.url}, found ${asset.sourceUrl}`);
      }
      if (!existsSync(path.join(process.cwd(), asset.path))) {
        failures.push(`${asset.id}: downloaded marker context file is missing at ${asset.path}`);
      }
    }
  }

  for (const local of localMarkers) {
    if (!expectedById.has(local.id)) {
      failures.push(`${local.id}: extra local MapGenie marker not present in live payload`);
    }
  }

  summaries.push({
    gameId: config.gameId,
    markers: expectedRecords.length,
    details: detailCount,
    mediaAssets: mediaAssetCount,
    countsByMap,
  });
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[mapgenie-sniper-elite:fail] ${failure}`);
  }
  process.exit(1);
}

for (const summary of summaries) {
  console.log(`[mapgenie-sniper-elite] Live MapGenie audit passed for ${summary.gameId}`);
  console.log(`[mapgenie-sniper-elite] ${summary.markers} markers represented across ${summary.countsByMap.size} maps`);
  if (requireDetails) {
    console.log(`[mapgenie-sniper-elite] ${summary.details} private marker details and ${summary.mediaAssets} context images represented`);
  }
  for (const [mapId, count] of [...summary.countsByMap].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`[mapgenie-sniper-elite] ${mapId}: ${count}`);
  }
}
