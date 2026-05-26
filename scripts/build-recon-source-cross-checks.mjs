import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const writeMode = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);

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

const se5GamerGuidesMarkerCounts = new Map([
  ["se5-atlantic-wall", 66],
  ["se5-occupied-residence", 49],
  ["se5-spy-academy", 54],
  ["se5-war-factory", 45],
  ["se5-festung-guernsey", 63],
  ["se5-liberation", 42],
  ["se5-secret-weapons", 36],
  ["se5-rubble-and-ruin", 51],
  ["se5-wolf-mountain", 59],
]);

const se5PushSquareWorkbenchCounts = new Map(
  [
    "se5-atlantic-wall",
    "se5-occupied-residence",
    "se5-spy-academy",
    "se5-war-factory",
    "se5-festung-guernsey",
    "se5-liberation",
    "se5-secret-weapons",
    "se5-rubble-and-ruin",
    "se5-wolf-mountain",
  ].map((mapId) => [mapId, 3]),
);

const serCampaignWorkbenchCounts = new Map([
  ["ser-behind-enemy-lines", 1],
  ["ser-dead-drop", 3],
  ["ser-sonderzuge-sabotage", 3],
  ["ser-collision-course", 3],
  ["ser-devils-cauldron", 3],
  ["ser-assault-on-fort-rouge", 3],
  ["ser-lock-stock-and-barrels", 3],
  ["ser-end-of-the-line", 3],
  ["ser-all-or-nothing", 0],
]);

const serPushSquareWorkbenchCounts = new Map([
  ...serCampaignWorkbenchCounts,
  ["ser-vercors-vendetta", 3],
]);

const serWandCoverage = new Set([
  "ser-behind-enemy-lines",
  "ser-dead-drop",
  "ser-sonderzuge-sabotage",
  "ser-collision-course",
  "ser-devils-cauldron",
  "ser-assault-on-fort-rouge",
  "ser-lock-stock-and-barrels",
  "ser-end-of-the-line",
  "ser-lights-camera-achtung",
]);

const positionReviewed = new Map([
  [
    "se5-atlantic-wall",
    "Atlantic Wall has received a manual plate-alignment pass, including shoreline drift checks and long-shot medal descriptions. Keep later changes draft-only until each marker is checked again in-game.",
  ],
  [
    "ser-behind-enemy-lines",
    "Behind Enemy Lines has received a manual campaign-cell transform correction plus workbench/source review. Interior and underground detail still needs first-hand gameplay confirmation before publication.",
  ],
]);

const knownSourceGaps = new Set([
  "se5-landing-force",
  "se5-conqueror",
  "se5-rough-landing",
  "se5-kraken-awakes",
  "ser-all-or-nothing",
  "ser-striking-range",
  "ser-mud-and-thunder",
]);

const urls = {
  gamerGuidesSe5Maps: "https://www.gamerguides.com/sniper-elite-5/maps",
  pushSquareSe5Workbenches: "https://www.pushsquare.com/guides/sniper-elite-5-all-workbenches-locations",
  wandSerMaps: "https://wand.com/maps/sniper-elite-resistance",
  gameSpotSerWorkbenches:
    "https://www.gamespot.com/gallery/sniper-elite-resistance-workbench-locations-weapon-workbenches-guide/2900-6153/",
  pushSquareSerWorkbenches:
    "https://www.pushsquare.com/guides/sniper-elite-resistance-all-workbenches-locations",
};

function workbenchCount(markers) {
  return markers.filter((marker) =>
    /workbench/i.test(
      `${marker.category || ""} ${marker.subcategory || ""} ${marker.label || ""}`,
    ),
  ).length;
}

function sourceSourceForPacket(packet, map) {
  const source = packet.referenceSources.find((item) => item.url);
  if (!source) return null;
  return {
    label: `${source.label}`,
    url: source.url,
    coverage: "private_source_import",
    notes: `${map.title} private map plate and draft markers remain owner-approved admin review inputs, not public publication data.`,
  };
}

function externalSourcesFor(map, packet) {
  const sources = [];
  const packetSource = sourceSourceForPacket(packet, map);
  if (packetSource) sources.push(packetSource);

  if (map.gameId === "sniper-elite-5") {
    if (se5GamerGuidesMarkerCounts.has(map.id)) {
      sources.push({
        label: "Gamer Guides Sniper Elite 5 map index",
        url: urls.gamerGuidesSe5Maps,
        coverage: "marker_counts_and_categories",
        notes: "Used as an independent marker-count and category-scope check for the base missions and Wolf Mountain; coordinates and guide prose are not copied.",
      });
    }

    if (se5PushSquareWorkbenchCounts.has(map.id)) {
      sources.push({
        label: "Push Square Sniper Elite 5 workbench guide",
        url: urls.pushSquareSe5Workbenches,
        coverage: "workbench_counts_and_named_types",
        notes: "Used to confirm three workbench types per covered mission; route prose and screenshots are not copied.",
      });
    }
  }

  if (map.gameId === "sniper-elite-resistance") {
    if (serWandCoverage.has(map.id)) {
      sources.push({
        label: "Wand Sniper Elite: Resistance map index",
        url: urls.wandSerMaps,
        coverage: "map_availability_and_checklist_coverage",
        notes: "Used as a secondary map/checklist reference for covered Resistance regions; exact coordinates and app data are not copied into Recon.",
      });
    }

    if (serCampaignWorkbenchCounts.has(map.id) && map.id !== "ser-all-or-nothing") {
      sources.push({
        label: "GameSpot Sniper Elite: Resistance workbench guide",
        url: urls.gameSpotSerWorkbenches,
        coverage: "workbench_locations_by_mission",
        notes: "Used as a second workbench-location reference for campaign missions one through eight; prose and images are not copied.",
      });
    }

    if (serPushSquareWorkbenchCounts.has(map.id)) {
      sources.push({
        label: "Push Square Sniper Elite: Resistance workbench guide",
        url: urls.pushSquareSerWorkbenches,
        coverage: "workbench_counts_and_named_types",
        notes: "Used to confirm campaign workbench count expectations and Vercors Vendetta workbench names; prose and screenshots are not copied.",
      });
    }
  }

  return sources;
}

function expectedWorkbenchCount(mapId) {
  if (se5PushSquareWorkbenchCounts.has(mapId)) {
    return se5PushSquareWorkbenchCounts.get(mapId);
  }

  if (serPushSquareWorkbenchCounts.has(mapId)) {
    return serPushSquareWorkbenchCounts.get(mapId);
  }

  return null;
}

function checksFor(map, markers, sources) {
  const checks = [];
  const localWorkbenchCount = workbenchCount(markers);
  const expectedWorkbenches = expectedWorkbenchCount(map.id);

  if (expectedWorkbenches != null) {
    checks.push({
      label: "Workbench count",
      status:
        localWorkbenchCount === expectedWorkbenches ? "match" : "mismatch",
      localValue: String(localWorkbenchCount),
      sourceValue: String(expectedWorkbenches),
      notes:
        localWorkbenchCount === expectedWorkbenches
          ? "Local draft data matches the independent workbench-count expectation."
          : "Local draft data does not match the independent workbench-count expectation; review before any publication.",
    });
  } else {
    checks.push({
      label: "Workbench count",
      status: "source_gap",
      localValue: String(localWorkbenchCount),
      sourceValue: "unknown",
      notes: "No reliable independent workbench-count source has been recorded for this map yet.",
    });
  }

  if (se5GamerGuidesMarkerCounts.has(map.id)) {
    const sourceCount = se5GamerGuidesMarkerCounts.get(map.id);
    checks.push({
      label: "Independent marker-count scope",
      status: markers.length === sourceCount ? "match" : "scope_delta",
      localValue: String(markers.length),
      sourceValue: String(sourceCount),
      notes:
        markers.length === sourceCount
          ? "Local draft marker count matches the independent Gamer Guides map index count."
          : "Local draft marker import intentionally includes a broader admin review layer than the independent Gamer Guides index count; review high-noise utility/supply layers before publishing.",
    });
  }

  checks.push({
    label: "Position review",
    status: positionReviewed.has(map.id)
      ? "match"
      : sources.length > 1
        ? "pending"
        : "source_gap",
    localValue: positionReviewed.has(map.id)
      ? "manual pass recorded"
      : "draft positions only",
    sourceValue: sources.length > 1 ? "secondary source available" : "none recorded",
    notes:
      positionReviewed.get(map.id) ||
      "Exact marker positions still need a manual source comparison plus first-hand gameplay review. Do not treat the imported draft points as verified guide data.",
  });

  return checks;
}

function statusFor(map, sources) {
  if (positionReviewed.has(map.id)) return "position_cross_checked";
  if (knownSourceGaps.has(map.id) || sources.length <= 1) return "source_gap";
  return "needs_manual_position_review";
}

function summaryFor(status, map, sources) {
  if (status === "position_cross_checked") {
    return `${map.title} has a recorded manual position review. Keep using the source list for regression checks before publication.`;
  }

  if (status === "source_gap") {
    return `${map.title} needs another reliable source or first-hand gameplay pass before position accuracy can be called reviewed.`;
  }

  if (sources.some((source) => source.label.includes("Wand"))) {
    return `${map.title} has secondary Resistance map/checklist coverage available through Wand, but local marker positions are still draft until manually compared.`;
  }

  return `${map.title} has independent count/category coverage, but individual marker positions still need manual cross-checking.`;
}

function warningsFor(map, markers) {
  const warnings = [];

  if (knownSourceGaps.has(map.id)) {
    warnings.push("Independent source coverage is incomplete for this target; use gameplay review before changing marker confidence.");
  }

  if (markers.length > 100) {
    warnings.push("High marker density: review by category and hide noisy supply/ammo layers while checking core collectibles.");
  }

  if (map.id === "ser-all-or-nothing") {
    warnings.push("All or Nothing currently has minimal imported marker coverage; confirm whether it needs a guide surface, a campaign note, or no Recon map.");
  }

  return warnings;
}

const [maps, markers, sourcePackets] = await Promise.all([
  readJson("src/data/recon/maps.json"),
  readJson("src/data/recon/marker-seeds.json"),
  readJson("src/data/recon/source-packets.json"),
]);

const packetsByMapId = new Map(
  sourcePackets.map((packet) => [packet.mapId, packet]),
);

const output = maps
  .filter((map) =>
    ["sniper-elite-5", "sniper-elite-resistance"].includes(map.gameId),
  )
  .map((map) => {
    const mapMarkers = markers.filter((marker) => marker.mapId === map.id);
    const packet = packetsByMapId.get(map.id);
    const sources = packet ? externalSourcesFor(map, packet) : [];
    const status = statusFor(map, sources);

    return {
      mapId: map.id,
      gameId: map.gameId,
      status,
      lastReviewed: today,
      localMarkerCount: mapMarkers.length,
      localWorkbenchCount: workbenchCount(mapMarkers),
      summary: summaryFor(status, map, sources),
      sources,
      checks: checksFor(map, mapMarkers, sources),
      warnings: warningsFor(map, mapMarkers),
      nextSteps:
        status === "position_cross_checked"
          ? [
              "Re-run the manual cross-source pass after any source import or marker-coordinate change.",
              "Verify exact marker placement in-game before changing marker confidence.",
            ]
          : [
              "Compare core objective, collectible, workbench, tool, and route markers against the recorded secondary sources.",
              "Record any manual coordinate adjustment in marker descriptions or source-check notes.",
              "Verify exact placement in-game before changing marker confidence.",
            ],
    };
  })
  .sort((a, b) => a.mapId.localeCompare(b.mapId));

await writeJson("src/data/recon/source-cross-checks.json", output);

const statusCounts = output.reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});

console.log(
  `${writeMode ? "Wrote" : "Prepared"} ${output.length} source cross-check records: ${JSON.stringify(statusCounts)}`,
);
