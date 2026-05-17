import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

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
const icons = await readJson("src/data/recon/icon-manifest.json");

assert.ok(games.length >= 2, "Recon should keep at least the initial two games");
assert.equal(new Set(games.map((game) => game.slug)).size, games.length, "Recon game slugs should be unique");

const gameIds = new Set(games.map((game) => game.id));
const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
const routeKeys = new Set();

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
  assert.equal(asset.imported, false, `${asset.id} should not be marked as imported third-party content`);
  assert.doesNotMatch(`${asset.sourceName} ${asset.sourceUrl}`, /hitmaps|guides4gamers|sniper\s*elite\s*maps/i, `${asset.id} should not reference third-party map sources`);
  if (asset.visibility === "private") {
    assert.match(asset.path, /^private\/recon\//, `${asset.id} private asset path should not be public`);
  }
}

for (const icon of icons) {
  assert.match(icon.path, /^\/recon\/icons\//, `${icon.key} icon should resolve from public Recon icons`);
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
