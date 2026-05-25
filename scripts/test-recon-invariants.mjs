import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

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
const icons = await readJson("src/data/recon/icon-manifest.json");
const sourcePackets = await readJson("src/data/recon/source-packets.json");

assert.ok(games.length >= 3, "Recon should keep the initial three games");
assert.equal(new Set(games.map((game) => game.slug)).size, games.length, "Recon game slugs should be unique");

const gameIds = new Set(games.map((game) => game.id));
const mapsById = new Map(maps.map((map) => [map.id, map]));
const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
const viewsByMapId = new Map();
const sourcePacketsByMapId = new Map(sourcePackets.map((packet) => [packet.mapId, packet]));
const routeKeys = new Set();
const requiredDraftMapIds = new Set([
  "hitman-dubai",
  "se5-atlantic-wall",
  "ser-behind-enemy-lines",
]);

for (const requiredGame of ["hitman-woa", "sniper-elite-5", "sniper-elite-resistance"]) {
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

const expectedImportedReviewAssets = new Map([
  ["hitman-dubai-b1", "wand-hitman-dubai-level-minus-1"],
  ["hitman-dubai-1f", "wand-hitman-dubai-level-0"],
  ["hitman-dubai-2f", "wand-hitman-dubai-level-1"],
  ["hitman-dubai-3f", "wand-hitman-dubai-level-2"],
  ["hitman-dubai-4f", "wand-hitman-dubai-level-3"],
  ["hitman-dubai-5f", "wand-hitman-dubai-level-4"],
  ["hitman-dubai-roof", "wand-hitman-dubai-level-5"],
  ["se5-atlantic-wall-surface", "guides4gamers-se5-atlantic-wall-surface"],
  ["ser-behind-enemy-lines-surface", "guides4gamers-ser-behind-enemy-lines-surface"],
]);

for (const [viewId, assetId] of expectedImportedReviewAssets) {
  const view = mapViews.find((item) => item.id === viewId);
  const asset = assetsById.get(assetId);
  assert.ok(view, `${viewId} should exist as a private source-map review view`);
  assert.ok(asset, `${assetId} should exist as a private source-map review asset`);
  assert.equal(view.assetId, assetId, `${viewId} should use ${assetId}`);
  assert.equal(asset.imported, true, `${assetId} should be recorded as an imported source asset`);
  assert.equal(asset.visibility, "private", `${assetId} should not be public`);
}

for (const icon of icons) {
  assert.match(icon.path, /^\/recon\/icons\//, `${icon.key} icon should resolve from public Recon icons`);
}

for (const packet of sourcePackets) {
  assert.ok(requiredDraftMapIds.has(packet.mapId), `${packet.mapId} source packet should be tied to a tracked draft target`);
  assert.ok(packet.lastReviewed, `${packet.mapId} should record lastReviewed`);
  assert.ok(packet.officialSources.length >= 1, `${packet.mapId} should list official sources`);
  assert.ok(packet.referenceSources.length >= 1, `${packet.mapId} should list reference sources`);
  assert.ok(packet.avoidCopying.length >= 1, `${packet.mapId} should record copyright-sensitive material to avoid`);
  assert.doesNotMatch(JSON.stringify(packet), /copied from|scraped coordinates/i, `${packet.mapId} should not claim copied source use`);
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
