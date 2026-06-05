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

const serMapMasterCoverage = new Set([
  "ser-behind-enemy-lines",
  "ser-dead-drop",
  "ser-sonderzuge-sabotage",
  "ser-collision-course",
  "ser-devils-cauldron",
  "ser-assault-on-fort-rouge",
  "ser-lock-stock-and-barrels",
  "ser-end-of-the-line",
  "ser-all-or-nothing",
  "ser-lights-camera-achtung",
  "ser-vercors-vendetta",
  "ser-striking-range",
]);

const serPowerPyxCollectibleCoverage = new Set([
  "ser-behind-enemy-lines",
  "ser-dead-drop",
  "ser-sonderzuge-sabotage",
  "ser-collision-course",
  "ser-devils-cauldron",
  "ser-assault-on-fort-rouge",
  "ser-lock-stock-and-barrels",
  "ser-end-of-the-line",
  "ser-all-or-nothing",
  "ser-lights-camera-achtung",
]);

const se5DlcCollectibleGuideUrls = new Map([
  [
    "se5-landing-force",
    "https://itemlevel.net/sniper-elite-5-landing-force-all-collectible-locations/",
  ],
  [
    "se5-conqueror",
    "https://www.powerpyx.com/sniper-elite-5-mission-12-conqueror-all-collectible-locations/",
  ],
  [
    "se5-rough-landing",
    "https://www.powerpyx.com/sniper-elite-5-mission-13-rough-landing-all-collectible-locations/",
  ],
  [
    "se5-kraken-awakes",
    "https://itemlevel.net/sniper-elite-5-kraken-awakes-all-collectible-locations/",
  ],
]);

const serGameRantDlcCollectibleGuideUrls = new Map([
  [
    "ser-striking-range",
    "https://gamerant.com/sniper-elite-resistance-all-collectibles-for-striking-range/",
  ],
  [
    "ser-mud-and-thunder",
    "https://gamerant.com/sniper-elite-resistance-all-collectibles-in-mud-and-thunder-dlc/",
  ],
]);

const serGameRantDlcWorkbenchGuideUrls = new Map([
  [
    "ser-striking-range",
    "https://gamerant.com/sniper-elite-resistance-all-striking-range-workbenches/",
  ],
  [
    "ser-mud-and-thunder",
    "https://gamerant.com/sniper-elite-resistance-all-workbench-locations-in-mud-and-thunder-dlc/",
  ],
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

const urls = {
  gamerGuidesSe5Maps: "https://www.gamerguides.com/sniper-elite-5/maps",
  exputerSe5InteractiveMap: "https://exputer.com/guides/sniper-elite-5-interactive-map/",
  sniperElite5Maps: "https://sniperelite5maps.de/",
  pushSquareSe5Workbenches: "https://www.pushsquare.com/guides/sniper-elite-5-all-workbenches-locations",
  wandSerMaps: "https://wand.com/maps/sniper-elite-resistance",
  mapMasterSerMaps: "https://mapmaster.io/games/sniper-elite-resistance",
  powerPyxSerCollectibles:
    "https://www.powerpyx.com/sniper-elite-resistance-collectible-guide-letters-documents-items-eagles-workbenches/",
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
    sources.push({
      label: "Sniper Elite 5 Maps reference site",
      url: urls.sniperElite5Maps,
      coverage: "independent_visual_map_reference",
      notes: "Used as a visual map-shape, coastline/building-block, and category sanity check only. Map tiles, marker coordinates, marker text, and UI are not copied.",
    });

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

    if (se5GamerGuidesMarkerCounts.has(map.id)) {
      sources.push({
        label: "eXputer Sniper Elite 5 interactive-map article",
        url: urls.exputerSe5InteractiveMap,
        coverage: "secondary_visual_map_and_collectible_counts",
        notes: "Used as a secondary visual/count reference for base missions and Wolf Mountain. Article images, captions, and prose are not copied.",
      });
    }

    if (se5DlcCollectibleGuideUrls.has(map.id)) {
      sources.push({
        label: "DLC collectible guide spot check",
        url: se5DlcCollectibleGuideUrls.get(map.id),
        coverage: "dlc_collectible_count_and_area_spot_check",
        notes: "Used to spot-check DLC collectible and workbench expectations against the private map plate. Guide prose and screenshots are not copied.",
      });
    }
  }

  if (map.gameId === "sniper-elite-resistance") {
    if (serMapMasterCoverage.has(map.id)) {
      sources.push({
        label: "MapMaster Sniper Elite Resistance map index",
        url: urls.mapMasterSerMaps,
        coverage: "independent_visual_map_reference",
        notes: "Used as a secondary visual/map-availability reference for covered Resistance missions. Map images, marker data, and guide text are not copied.",
      });
    }

    if (serWandCoverage.has(map.id)) {
      sources.push({
        label: "Wand Sniper Elite: Resistance map index",
        url: urls.wandSerMaps,
        coverage: "map_availability_and_checklist_coverage",
        notes: "Used as a secondary map/checklist reference for covered Resistance regions; exact coordinates and app data are not copied into Recon.",
      });
    }

    if (serPowerPyxCollectibleCoverage.has(map.id)) {
      sources.push({
        label: "PowerPyx Sniper Elite Resistance collectible guide",
        url: urls.powerPyxSerCollectibles,
        coverage: "collectible_counts_by_mission",
        notes: "Used to verify campaign and Lights, Camera, Achtung collectible-count expectations. Route prose, screenshots, and exact positions are not copied.",
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

    if (serGameRantDlcCollectibleGuideUrls.has(map.id)) {
      sources.push({
        label: "Game Rant Resistance DLC collectible guide",
        url: serGameRantDlcCollectibleGuideUrls.get(map.id),
        coverage: "dlc_collectible_count_and_area_spot_check",
        notes: "Used as a DLC collectible/source plausibility check. Article images, prose, and marker positions are not copied.",
      });
    }

    if (serGameRantDlcWorkbenchGuideUrls.has(map.id)) {
      sources.push({
        label: "Game Rant Resistance DLC workbench guide",
        url: serGameRantDlcWorkbenchGuideUrls.get(map.id),
        coverage: "dlc_workbench_count_and_area_spot_check",
        notes: "Used as a DLC workbench source check. Article images, prose, and marker positions are not copied.",
      });
    }
  }

  return sources;
}

function visualReviewStatusFor(map, sources) {
  const labels = sources.map((source) => source.label).join(" ");
  const hasIndependentVisual =
    /Sniper Elite 5 Maps|MapMaster|Wand|eXputer/.test(labels);
  const hasCollectibleSpotCheck =
    /PowerPyx|GameSpot|Push Square|Game Rant|DLC collectible guide/.test(labels);

  if (hasIndependentVisual && hasCollectibleSpotCheck) {
    return "visual_sources_compared";
  }
  if (hasIndependentVisual || sources.length > 1) {
    return "partial_visual_sources_compared";
  }
  return "source_limited";
}

function visualReviewSummaryFor(map, status) {
  if (status === "visual_sources_compared") {
    return `${map.title} has been visually compared against at least one independent map/reference surface plus a count or category guide. Exact marker positions remain draft until first-hand gameplay review.`;
  }

  if (status === "partial_visual_sources_compared") {
    return `${map.title} has usable independent visual or count coverage, but the comparison is partial. Treat high-density marker placement as a manual review queue.`;
  }

  return `${map.title} still has limited independent visual coverage. Keep all positions draft and prioritize first-hand gameplay review before publication.`;
}

function visualFindingsFor(map, status) {
  const findings = [
    "Private Guides4Gamers review plates remain the working source map; secondary sources are used only to compare silhouette, orientation, major landmarks, category coverage, and obvious placement drift.",
    "No third-party marker coordinates, guide prose, screenshots, icons, or app data are copied into public Recon.",
  ];

  if (map.gameId === "sniper-elite-5") {
    findings.push(
      "SniperElite5Maps provides a second full-map visual reference across the base missions and DLC, useful for checking coastline, road, building, and objective-area alignment.",
    );
  }

  if (map.gameId === "sniper-elite-resistance") {
    findings.push(
      "MapMaster and Wand coverage is strongest for campaign/Lights/Striking surfaces; GameSpot, Push Square, PowerPyx, and Game Rant provide count and area spot checks rather than reusable coordinates.",
    );
  }

  if (map.id === "ser-all-or-nothing") {
    findings.push(
      "All or Nothing is intentionally sparse: multiple references confirm it has no normal collectible sweep, so the admin review should decide whether a minimal mission note is more useful than a full map.",
    );
  }

  if (status === "source_limited") {
    findings.push(
      "This map has fewer independent visual references than the rest of the set; do not upgrade confidence based on the current source packet alone.",
    );
  }

  return findings;
}

function manualReviewFocusFor(map, markers) {
  const focus = [
    "Check every workbench, starting point, exfiltration point, and medal-related marker first.",
    "Then review high-density utility layers such as satchels, crowbars, bolt cutters, keys, alarms, and medical items by region.",
  ];

  if (markers.length > 200) {
    focus.push(
      "High-density map: compare by quadrants or named districts instead of reviewing all markers in one pass.",
    );
  }

  if (map.gameId === "sniper-elite-resistance") {
    focus.push(
      "Look for underground, bunker, tunnel, dam, and interior spaces that may need separate map views even when the surface plate looks correct.",
    );
  }

  if (map.id === "ser-mud-and-thunder") {
    focus.push(
      "Mud and Thunder needs extra manual attention because secondary checks are guide-based rather than a full independent map surface.",
    );
  }

  if (map.id === "ser-all-or-nothing") {
    focus.push(
      "Confirm whether the single imported marker is enough for the mission or whether this should become a short mission note instead of a full Recon map.",
    );
  }

  return focus;
}

function visualReviewFor(map, markers, sources) {
  const status = visualReviewStatusFor(map, sources);

  return {
    status,
    lastCompared: today,
    summary: visualReviewSummaryFor(map, status),
    findings: visualFindingsFor(map, status),
    manualReviewFocus: manualReviewFocusFor(map, markers),
  };
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
  if (sources.length <= 1) return "source_gap";
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

  if (map.id === "ser-mud-and-thunder") {
    warnings.push("Mud and Thunder has secondary guide checks but no recorded full-map secondary visual surface; use gameplay review before changing marker confidence.");
  }

  if (markers.length > 100) {
    warnings.push("High marker density: review by category and hide noisy supply/ammo layers while checking core collectibles.");
  }

  if (map.id === "ser-all-or-nothing") {
    warnings.push("All or Nothing currently has minimal imported marker coverage; confirm whether it needs a guide surface, a campaign note, or no Recon map.");
  }

  return warnings;
}

function legacySourceGapFor(map, markers, packet) {
  const packetSources = [
    ...(packet?.officialSources || []),
    ...(packet?.referenceSources || []),
  ];
  const sources = packetSources
    .filter((source) => source.url)
    .map((source) => ({
      label: source.label,
      url: source.url,
      coverage: "source_gap_reference",
      notes: "Recorded as private admin source context only. Map art, marker coordinates, screenshots, guide prose, icons, UI, and app data are not copied.",
    }));

  return {
    mapId: map.id,
    gameId: map.gameId,
    status: "source_gap",
    lastReviewed: today,
    localMarkerCount: markers.length,
    localWorkbenchCount: workbenchCount(markers),
    summary: `${map.title} has legacy source context recorded, but no approved private source plate or marker-coordinate import yet.`,
    sources,
    visualReview: {
      status: "source_limited",
      lastCompared: today,
      summary: `${map.title} is present for admin draft parity with a Vaexil neutral placeholder plate. Exact map layout and markers need approved source import or first-hand gameplay review.`,
      findings: [
        "Legacy reference sources were recorded for scope and source discovery only.",
        "No third-party map art, screenshots, UI, marker coordinates, app data, or guide prose has been imported for this map.",
      ],
      manualReviewFocus: [
        "Confirm mission boundaries and objective flow from first-hand gameplay.",
        "Capture normalized coordinates only after the map view is approved for admin review.",
        "Cross-check legacy title-specific collectibles before changing any marker confidence.",
      ],
    },
    checks: [
      {
        label: "Legacy source import status",
        status: "source_gap",
        notes: "No approved private source-map import or marker-coordinate source adapter exists for this legacy map yet.",
      },
      {
        label: "Marker seed status",
        status: markers.length > 0 ? "pending" : "source_gap",
        notes:
          markers.length > 0
            ? "Local marker seeds exist and need manual review before any confidence upgrade."
            : "No local marker seeds are present; coordinate capture is deferred.",
      },
    ],
    warnings: [
      "Do not treat the neutral placeholder plate as a gameplay-accurate public map.",
      "Do not copy coordinates, routes, guide text, screenshots, icons, UI, or app data from legacy reference sources.",
    ],
    nextSteps: [
      "Review available legacy source coverage and record any owner-approved private source import before coordinate capture.",
      "Create or approve a gameplay-accurate private review plate for this mission.",
      "Capture draft/unverified markers from approved review material or first-hand gameplay only.",
    ],
  };
}

const [maps, markers, sourcePackets, existingSourceCrossChecks] = await Promise.all([
  readJson("src/data/recon/maps.json"),
  readJson("src/data/recon/marker-seeds.json"),
  readJson("src/data/recon/source-packets.json"),
  readJson("src/data/recon/source-cross-checks.json"),
]);

const packetsByMapId = new Map(
  sourcePackets.map((packet) => [packet.mapId, packet]),
);
const existingSourceCrossChecksByMapId = new Map(
  existingSourceCrossChecks.map((check) => [check.mapId, check]),
);
const modernSniperEliteGameIds = new Set([
  "sniper-elite-5",
  "sniper-elite-resistance",
]);
const legacySniperEliteGameIds = new Set([
  "sniper-elite-v2-remastered",
  "sniper-elite-3",
  "sniper-elite-4",
]);

const modernOutput = maps
  .filter((map) => modernSniperEliteGameIds.has(map.gameId))
  .map((map) => {
    const mapMarkers = markers.filter((marker) => marker.mapId === map.id);
    const packet = packetsByMapId.get(map.id);
    const sources = packet ? externalSourcesFor(map, packet) : [];
    const status = statusFor(map, sources);
    const visualReview = visualReviewFor(map, mapMarkers, sources);

    return {
      mapId: map.id,
      gameId: map.gameId,
      status,
      lastReviewed: today,
      localMarkerCount: mapMarkers.length,
      localWorkbenchCount: workbenchCount(mapMarkers),
      summary: summaryFor(status, map, sources),
      sources,
      visualReview,
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
  });

const legacyOutput = maps
  .filter((map) => legacySniperEliteGameIds.has(map.gameId))
  .map((map) => {
    const existing = existingSourceCrossChecksByMapId.get(map.id);
    if (existing) return existing;

    const mapMarkers = markers.filter((marker) => marker.mapId === map.id);
    return legacySourceGapFor(map, mapMarkers, packetsByMapId.get(map.id));
  });

const output = [...modernOutput, ...legacyOutput].sort((a, b) =>
  a.mapId.localeCompare(b.mapId),
);

await writeJson("src/data/recon/source-cross-checks.json", output);

const statusCounts = output.reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});

console.log(
  `${writeMode ? "Wrote" : "Prepared"} ${output.length} source cross-check records: ${JSON.stringify(statusCounts)}`,
);
