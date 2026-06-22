import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

// JSON fixture boundary
async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, root), "utf8"));
}

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

const games = await readJson("src/data/recon/games.json");
const maps = await readJson("src/data/recon/maps.json");
const assets = await readJson("src/data/recon/asset-manifest.json");
const mapViews = await readJson("src/data/recon/map-views.json");
const markerSeeds = await readJson("src/data/recon/marker-seeds.json");
const markerDetails = await readJson("src/data/recon/marker-details.json");
const icons = await readJson("src/data/recon/icon-manifest.json");
const sourcePackets = await readJson("src/data/recon/source-packets.json");
const sourceCrossChecks = await readJson("src/data/recon/source-cross-checks.json");

// Registry integrity gates
assert.ok(games.length >= 5, "Recon should keep the active Recon games");
assert.equal(new Set(games.map((game) => game.slug)).size, games.length, "Recon game slugs should be unique");

const gameIds = new Set(games.map((game) => game.id));
const mapsById = new Map(maps.map((map) => [map.id, map]));
const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
const iconsByKey = new Map(icons.map((icon) => [icon.key, icon]));
const viewsByMapId = new Map();
const sourcePacketsByMapId = new Map(sourcePackets.map((packet) => [packet.mapId, packet]));
const sourceCrossChecksByMapId = new Map(sourceCrossChecks.map((check) => [check.mapId, check]));
const markerDetailAssetIds = new Set(
  markerDetails.flatMap((detail) => detail.mediaAssetIds || []),
);
const routeKeys = new Set();
const requiredDraftMapIds = new Set(
  maps
    .filter((map) => map.status === "draft")
    .map((map) => map.id),
);
const modernSniperEliteGameIds = new Set([
  "sniper-elite-5",
  "sniper-elite-resistance",
]);
const sniperEliteGameIds = new Set([
  "sniper-elite-3",
  "sniper-elite-4",
  ...modernSniperEliteGameIds,
]);
const sniperEliteMapIds = new Set(
  maps
    .filter((map) => sniperEliteGameIds.has(map.gameId))
    .map((map) => map.id),
);
const modernSniperEliteMapIds = new Set(
  maps
    .filter((map) => modernSniperEliteGameIds.has(map.gameId))
    .map((map) => map.id),
);

for (const requiredGame of [
  "hitman-woa",
  "sniper-elite-3",
  "sniper-elite-4",
  "sniper-elite-5",
  "sniper-elite-resistance",
]) {
  assert.ok(gameIds.has(requiredGame), `Recon should include ${requiredGame}`);
}

for (const map of maps) {
  assert.ok(gameIds.has(map.gameId), `${map.id} should point to a known game`);
  assert.ok(map.slug, `${map.id} should have a public slug`);
  assert.ok(map.width > 0 && map.height > 0, `${map.id} should have usable dimensions`);
  assert.ok(["draft", "pending", "ready_for_review", "verified", "published"].includes(map.status), `${map.id} should use an expected workflow status`);

  const routeKey = `${map.gameId}:${map.slug}`;
  assert.ok(!routeKeys.has(routeKey), `${routeKey} should be unique`);
  routeKeys.add(routeKey);

  const asset = assetsById.get(map.imageAssetId);
  assert.ok(asset, `${map.id} should reference a known image asset`);
  assert.equal(asset.mapId, map.id, `${asset.id} should point back to ${map.id}`);

  if (requiredDraftMapIds.has(map.id)) {
    assert.ok(sourcePacketsByMapId.has(map.id), `${map.id} should have a source packet`);
  }

  if (map.status !== "published") {
    assert.notEqual(asset.visibility, "public", `${map.id} draft asset should not be public`);
    assert.match(asset.path, /^private\/recon\//, `${asset.id} should stay under private/recon`);
  }

  if (map.status === "published") {
    assert.equal(asset.visibility, "public", `${map.id} published asset must be public`);
    assert.equal(asset.status, "approved", `${map.id} published asset must be approved`);
  }
}

// Private asset gates
for (const asset of assets) {
  if (asset.visibility === "private") {
    assert.match(asset.path, /^private\/recon\//, `${asset.id} private asset path should not be public`);
    await access(new URL(asset.path, root));
  }

  if (asset.imported) {
    assert.equal(asset.visibility, "private", `${asset.id} imported source assets must stay private`);
    assert.equal(asset.status, "candidate", `${asset.id} imported source assets must stay candidate-only`);
    assert.ok(asset.sourceName, `${asset.id} imported source assets must name their source`);
    assert.ok(asset.sourceUrl, `${asset.id} imported source assets must include a source URL`);
    assert.match(asset.license, /private draft review use approved by owner/i, `${asset.id} imported source asset license/status should be explicit`);
    assert.match(asset.notes, /Not approved for public publication/i, `${asset.id} imported source assets must be publication-gated`);
  } else {
    assert.doesNotMatch(`${asset.sourceName} ${asset.sourceUrl}`, /hitmaps|guides4gamers|sniper\s*elite\s*maps|wand|wemod/i, `${asset.id} Vaexil-created assets should not reference third-party map sources`);
  }
}

for (const view of mapViews) {
  const map = mapsById.get(view.mapId);
  assert.ok(map, `${view.id} should point to a known map`);
  assert.ok(view.label && view.shortLabel, `${view.id} should have labels`);
  assert.ok(["overview", "floor", "surface", "underground"].includes(view.kind), `${view.id} should use a known view kind`);

  const asset = assetsById.get(view.assetId);
  assert.ok(asset, `${view.id} should reference a known asset`);
  assert.equal(asset.mapId, view.mapId, `${view.id} asset should point back to the same map`);
  assert.equal(asset.visibility, "private", `${view.id} draft asset should stay private`);
  if (asset.imported) {
    assert.equal(asset.status, "candidate", `${view.id} imported source asset should stay candidate-only`);
  }
  await access(new URL(asset.path, root));

  const views = viewsByMapId.get(view.mapId) || [];
  views.push(view);
  viewsByMapId.set(view.mapId, views);
}

for (const map of maps) {
  const views = viewsByMapId.get(map.id) || [];
  if (map.floorSupport && requiredDraftMapIds.has(map.id)) {
    assert.ok(views.some((view) => view.kind === "floor"), `${map.id} should define floor views`);
  }
}

for (const mapId of ["se5-atlantic-wall", "ser-behind-enemy-lines"]) {
  const views = viewsByMapId.get(mapId) || [];
  assert.ok(views.some((view) => view.kind === "underground"), `${mapId} should define an underground/interior view`);
}

for (const asset of assets.filter((item) => item.imported && item.type === "base_map")) {
  assert.ok(
    mapViews.some((view) => view.assetId === asset.id),
    `${asset.id} should be attached to at least one private source-map review view`,
  );
  assert.equal(asset.visibility, "private", `${asset.id} should not be public`);
}

for (const asset of assets.filter((item) => item.imported && item.type === "marker_context")) {
  assert.ok(
    markerDetailAssetIds.has(asset.id),
    `${asset.id} should be attached to at least one private marker detail`,
  );
  assert.equal(asset.visibility, "private", `${asset.id} should not be public`);
}

for (const icon of icons) {
  assert.match(icon.path, /^\/recon\/icons\//, `${icon.key} icon should resolve from public Recon icons`);
}

assert.ok(
  sniperEliteMapIds.size >= 50,
  "Recon should include the private SE3, SE4, SE5, and SE:R draft map sets",
);
assert.ok(
  markerSeeds.length >= 3189,
  "Recon should include the full private SE5 and SE:R draft marker import",
);
// Marker seed invariants
for (const marker of markerSeeds) {
  const map = mapsById.get(marker.mapId);
  assert.ok(map, `${marker.id} should point to a known map`);
  assert.equal(marker.gameId, map.gameId, `${marker.id} should match its map game`);
  assert.equal(marker.status, "draft", `${marker.id} should remain a draft marker`);
  assert.equal(marker.confidence, "unverified", `${marker.id} should require gameplay verification`);
  assert.ok(marker.x >= 0 && marker.x <= 100, `${marker.id} should use normalized x`);
  assert.ok(marker.y >= 0 && marker.y <= 100, `${marker.id} should use normalized y`);
  assert.ok(iconsByKey.has(marker.iconKey), `${marker.id} should use a known icon`);
  assert.ok(marker.sourceName, `${marker.id} should record a source name`);
  assert.match(marker.sourceUrl, /^https:\/\//, `${marker.id} should record an HTTPS source URL`);
  if (marker.tags.includes("guides4gamers")) {
    assert.match(marker.sourceUrl, /^https:\/\/guides4gamers\.com\//, `${marker.id} Guides4Gamers markers should record Guides4Gamers as their source`);
  }

  if (/workbench/i.test(`${marker.category} ${marker.subcategory} ${marker.label}`)) {
    assert.equal(marker.category, "workbench", `${marker.id} workbench marker should use the workbench category`);
    assert.equal(marker.iconKey, "workbench", `${marker.id} workbench marker should use the workbench icon`);
  }
}

for (const detail of markerDetails) {
  const marker = markerSeeds.find((item) => item.id === detail.markerId);
  assert.ok(marker, `${detail.markerId} marker detail should point to a known marker`);
  assert.equal(detail.mapId, marker.mapId, `${detail.markerId} marker detail should match marker map`);
  assert.ok(["draft", "pending", "ready_for_review", "verified", "published"].includes(detail.status), `${detail.markerId} marker detail should use an expected workflow status`);
  assert.ok(
    detail.locationHint || detail.howToSteps?.length || detail.notes?.length,
    `${detail.markerId} marker detail should include at least one useful guide field`,
  );
  for (const assetId of detail.mediaAssetIds || []) {
    const asset = assetsById.get(assetId);
    assert.ok(asset, `${detail.markerId} marker detail media should reference a known asset`);
    assert.ok(
      asset.type.includes("marker") || asset.type.includes("media") || asset.type.includes("image"),
      `${asset.id} marker detail media should use a media-oriented asset type`,
    );
  }
}

// Position safety gates
const atlanticWallMarkers = markerSeeds.filter((marker) => marker.mapId === "se5-atlantic-wall");
const atlanticWallMarkerBySourceId = new Map(
  atlanticWallMarkers.map((marker) => [marker.sourceMarkerId, marker]),
);
const expectedAtlanticWallIcons = new Map([
  ["satchel_charge", "satchel-charge"],
  ["bolt_cutters", "bolt-cutters"],
  ["crowbar", "crowbar"],
  ["fuse_box", "fuse-box"],
  ["medal_related", "medal"],
]);

for (const [category, expectedIcon] of expectedAtlanticWallIcons) {
  const categoryMarkers = atlanticWallMarkers.filter((marker) => marker.category === category);
  assert.ok(categoryMarkers.length > 0, `Atlantic Wall should include ${category} draft markers`);
  for (const marker of categoryMarkers) {
    assert.equal(marker.iconKey, expectedIcon, `${marker.id} should use the ${expectedIcon} icon`);
  }
}

assert.equal(
  atlanticWallMarkerBySourceId.get("37590")?.x,
  78.4,
  "Atlantic Wall Beach objective should be manually anchored to the southeast shoreline",
);
assert.ok(
  (atlanticWallMarkerBySourceId.get("37590")?.y ?? 100) < 80,
  "Atlantic Wall Beach objective should not drift into the southeast water margin",
);
assert.ok(
  (atlanticWallMarkerBySourceId.get("37260")?.y ?? 100) <= 81,
  "Atlantic Wall Submarine Deck start should be represented near the beach landing lane, not in open water",
);

const longShot = atlanticWallMarkerBySourceId.get("37964");
assert.ok(longShot, "Atlantic Wall should keep the long-shot medal marker");
assert.match(longShot.description, /600 m/i, "Long-shot medal marker should explain the required distance");
assert.match(longShot.description, /northeast/i, "Long-shot medal marker should explain the firing direction");
assert.match(longShot.description, /radar/i, "Long-shot medal marker should explain the target area");

const behindEnemyLinesMarkers = markerSeeds.filter((marker) => marker.mapId === "ser-behind-enemy-lines");
const behindEnemyLinesMarkerBySourceId = new Map(
  behindEnemyLinesMarkers.map((marker) => [marker.sourceMarkerId, marker]),
);
assert.ok(
  behindEnemyLinesMarkers.length >= 24,
  "Behind Enemy Lines should keep the corrected private marker import and may include additional review layers",
);
assert.equal(
  behindEnemyLinesMarkerBySourceId.has("68718"),
  false,
  "Behind Enemy Lines should not import the gnome marker from another campaign cell",
);
for (const marker of behindEnemyLinesMarkers) {
  assert.ok(
    marker.tags.includes("campaign-cell-scale-corrected"),
    `${marker.id} should record the corrected campaign-cell transform`,
  );
  assert.ok(
    marker.x >= 30 && marker.x <= 82 && marker.y >= 23 && marker.y <= 70,
    `${marker.id} should land on the Behind Enemy Lines map plate, not title/water margins`,
  );
}

const expectedBehindEnemyLinesIcons = new Map([
  ["satchel_charge", "satchel-charge"],
  ["bolt_cutters", "bolt-cutters"],
  ["crowbar", "crowbar"],
  ["workbench", "workbench"],
  ["main_objective", "objective"],
]);

for (const [category, expectedIcon] of expectedBehindEnemyLinesIcons) {
  const categoryMarkers = behindEnemyLinesMarkers.filter((marker) => marker.category === category);
  assert.ok(categoryMarkers.length > 0, `Behind Enemy Lines should include ${category} draft markers`);
  for (const marker of categoryMarkers) {
    assert.equal(marker.iconKey, expectedIcon, `${marker.id} should use the ${expectedIcon} icon`);
  }
}

assert.equal(
  behindEnemyLinesMarkerBySourceId.get("68130")?.x,
  32.8857,
  "Behind Enemy Lines exfil should be anchored to the west dam-end road",
);
assert.equal(
  behindEnemyLinesMarkerBySourceId.get("68130")?.y,
  28.1433,
  "Behind Enemy Lines exfil should not drift into the lower water/title margin",
);
assert.ok(
  (behindEnemyLinesMarkerBySourceId.get("68116")?.x ?? 0) > 80,
  "Behind Enemy Lines start should remain near the observation-tower point",
);
assert.match(
  behindEnemyLinesMarkerBySourceId.get("68138")?.description || "",
  /Push Square and PowerPyx/i,
  "Behind Enemy Lines workbench marker should record the cross-source collectible check",
);

function assertMapGeniePrivateContext(gameId, expectedMarkerCount, expectedContextAssetCount, label) {
  const gameMarkers = markerSeeds.filter((marker) => marker.gameId === gameId);
  const markerIds = new Set(gameMarkers.map((marker) => marker.id));
  const detailsById = new Map(
    markerDetails
      .filter((detail) => markerIds.has(detail.markerId))
      .map((detail) => [detail.markerId, detail]),
  );
  const contextAssets = assets.filter(
    (asset) => asset.gameId === gameId && asset.type === "marker_context",
  );

  assert.equal(
    gameMarkers.length,
    expectedMarkerCount,
    `${label} should keep the complete MapGenie marker set`,
  );
  assert.equal(
    detailsById.size,
    gameMarkers.length,
    `Every ${label} marker should have private admin review detail`,
  );
  assert.equal(
    contextAssets.length,
    expectedContextAssetCount,
    `${label} should keep every imported private MapGenie marker context image`,
  );
  for (const marker of gameMarkers) {
    const detail = detailsById.get(marker.id);
    assert.equal(detail?.visibility, "private", `${marker.id} ${label} marker detail should stay private`);
  }
}

assertMapGeniePrivateContext("sniper-elite-3", 362, 184, "Sniper Elite 3");
assertMapGeniePrivateContext("sniper-elite-4", 564, 149, "Sniper Elite 4");

// Source provenance gates
for (const packet of sourcePackets) {
  assert.ok(mapsById.has(packet.mapId), `${packet.mapId} source packet should be tied to a tracked Recon map`);
  assert.ok(packet.lastReviewed, `${packet.mapId} should record lastReviewed`);
  assert.ok(packet.officialSources.length >= 1, `${packet.mapId} should list official sources`);
  assert.ok(packet.referenceSources.length >= 1, `${packet.mapId} should list reference sources`);
  assert.ok(packet.avoidCopying.length >= 1, `${packet.mapId} should record copyright-sensitive material to avoid`);
  assert.doesNotMatch(JSON.stringify(packet), /copied from|scraped coordinates/i, `${packet.mapId} should not claim copied source use`);
}

const sourceCrossCheckStatuses = new Set([
  "position_cross_checked",
  "needs_manual_position_review",
  "source_gap",
]);
const sourceCrossCheckResultStatuses = new Set([
  "match",
  "mismatch",
  "scope_delta",
  "pending",
  "source_gap",
]);
const visualReviewStatuses = new Set([
  "visual_sources_compared",
  "partial_visual_sources_compared",
  "source_limited",
]);

for (const check of sourceCrossChecks) {
  assert.ok(mapsById.has(check.mapId), `${check.mapId} source cross-check should be tied to a tracked Recon map`);
  assert.ok(gameIds.has(check.gameId), `${check.mapId} source cross-check should reference a known game`);
  assert.ok(sourceCrossCheckStatuses.has(check.status), `${check.mapId} source cross-check should use a known status`);
  assert.ok(check.lastReviewed, `${check.mapId} source cross-check should record lastReviewed`);
  assert.ok(check.localMarkerCount >= 0, `${check.mapId} source cross-check should record localMarkerCount`);
  assert.ok(check.localWorkbenchCount >= 0, `${check.mapId} source cross-check should record localWorkbenchCount`);
  assert.ok(check.summary, `${check.mapId} source cross-check should summarize the review status`);
  assert.ok(check.sources.length >= 1, `${check.mapId} source cross-check should list source coverage`);
  assert.ok(check.visualReview, `${check.mapId} source cross-check should include visual review metadata`);
  assert.ok(
    visualReviewStatuses.has(check.visualReview.status),
    `${check.mapId} visual review should use a known status`,
  );
  assert.ok(check.visualReview.lastCompared, `${check.mapId} visual review should record lastCompared`);
  assert.ok(check.visualReview.summary, `${check.mapId} visual review should include a summary`);
  assert.ok(check.visualReview.findings.length >= 1, `${check.mapId} visual review should include findings`);
  assert.ok(
    check.visualReview.manualReviewFocus.length >= 1,
    `${check.mapId} visual review should include manual review focus`,
  );
  assert.ok(check.checks.length >= 1, `${check.mapId} source cross-check should list check results`);
  assert.ok(check.nextSteps.length >= 1, `${check.mapId} source cross-check should list next steps`);

  for (const source of check.sources) {
    assert.match(source.url, /^https:\/\//, `${check.mapId} cross-check source should use an HTTPS URL`);
    assert.ok(source.label, `${check.mapId} cross-check source should include a label`);
    assert.ok(source.coverage, `${check.mapId} cross-check source should include coverage`);
    assert.ok(source.notes, `${check.mapId} cross-check source should include notes`);
  }

  for (const result of check.checks) {
    assert.ok(sourceCrossCheckResultStatuses.has(result.status), `${check.mapId} source cross-check result should use a known status`);
    assert.ok(result.label, `${check.mapId} source cross-check result should include a label`);
    assert.ok(result.notes, `${check.mapId} source cross-check result should include notes`);
  }

  assert.doesNotMatch(
    JSON.stringify(check),
    /copied coordinates|scraped coordinates|wand coordinates|mapmaster coordinates|sniperelite5maps coordinates/i,
    `${check.mapId} source cross-check should not claim copied third-party coordinates`,
  );
}

for (const mapId of sniperEliteMapIds) {
  const map = mapsById.get(mapId);
  assert.ok(map, `${mapId} should be registered`);
  assert.ok(sourcePacketsByMapId.has(mapId), `${mapId} should have a source packet`);
  assert.ok(
    sourceCrossChecksByMapId.has(mapId),
    `${mapId} should have a source cross-check record`,
  );
  assert.ok(
    (viewsByMapId.get(mapId) || []).some((view) => view.kind === "surface"),
    `${mapId} should have a private surface review view`,
  );
}

for (const mapId of modernSniperEliteMapIds) {
  assert.ok(
    markerSeeds.some((marker) => marker.mapId === mapId),
    `${mapId} should have private draft markers`,
  );
}

// Public exposure gates
const categoryRegistry = `${await text("src/data/recon/category-registry.ts")}\n${await text("src/data/recon/sniper-elite-legacy-categories.ts")}`;
for (const expectedLegacyCategory of ["war_diary", "deadeye_target"]) {
  assert.match(
    categoryRegistry,
    new RegExp(`key: "${expectedLegacyCategory}"`),
    `Recon category registry should include ${expectedLegacyCategory}`,
  );
}

const repository = await text("src/lib/repository.ts");
assert.match(repository, /m\.status = 'published'/, "public Recon queries should require published maps");
assert.match(repository, /a\.visibility = 'public'/, "public Recon queries should require public assets");
assert.match(repository, /a\.status = 'approved'/, "public Recon queries should require approved assets");

const publicFiles = await readdir(new URL("public", root), { recursive: true });
for (const file of publicFiles) {
  if (file.endsWith("/")) continue;
  const content = await readFile(new URL(`public/${file}`, root)).catch(() => null);
  if (!content) continue;
  assert.doesNotMatch(content.toString("utf8"), /private\/recon\/maps/i, `public/${file} should not reference private draft Recon assets`);
}

console.log("[test:unit] Vaexil Recon invariants passed");
