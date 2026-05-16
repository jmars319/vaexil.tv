import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.env.LIBSQL_URL || "file:.data/vaexil.db";

if (url.startsWith("file:")) {
  mkdirSync(join(process.cwd(), ".data"), { recursive: true });
}

const db = createClient({
  url,
  authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
});

const seedItems = JSON.parse(
  await readFile(
    new URL("../src/data/freelancer-free-items.json", import.meta.url),
    "utf8",
  ),
);
const reconSeedGames = JSON.parse(
  await readFile(new URL("../src/data/recon/games.json", import.meta.url), "utf8"),
);
const reconSeedMaps = JSON.parse(
  await readFile(new URL("../src/data/recon/maps.json", import.meta.url), "utf8"),
);
const reconSeedAssets = JSON.parse(
  await readFile(
    new URL("../src/data/recon/asset-manifest.json", import.meta.url),
    "utf8",
  ),
);

await db.batch([
  {
    sql: `
      CREATE TABLE IF NOT EXISTS official_items (
        id TEXT PRIMARY KEY,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        map_name TEXT NOT NULL,
        location_description TEXT NOT NULL,
        notes TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0,
        source_suggestion_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS community_suggestions (
        id TEXT PRIMARY KEY,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        map_name TEXT NOT NULL,
        location_description TEXT NOT NULL,
        notes TEXT NOT NULL,
        source_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        published_item_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS suggestion_votes (
        id TEXT PRIMARY KEY,
        suggestion_id TEXT NOT NULL,
        voter_key TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(suggestion_id, voter_key),
        FOREIGN KEY(suggestion_id) REFERENCES community_suggestions(id)
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        organization TEXT,
        inquiry_type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'received',
        email_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS page_views (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL,
        referrer TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS recon_games (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        short_title TEXT NOT NULL,
        description TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS recon_maps (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image_asset_id TEXT,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        min_zoom REAL,
        max_zoom REAL,
        floor_support INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, slug),
        FOREIGN KEY(game_id) REFERENCES recon_games(id)
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS recon_assets (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        map_id TEXT,
        type TEXT NOT NULL,
        path TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        source_name TEXT,
        source_url TEXT,
        license TEXT,
        attribution TEXT,
        imported INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'candidate',
        visibility TEXT NOT NULL DEFAULT 'private',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(game_id) REFERENCES recon_games(id)
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS recon_markers (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        map_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        variant TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        label TEXT NOT NULL,
        description TEXT,
        x REAL NOT NULL,
        y REAL NOT NULL,
        floor TEXT,
        icon_key TEXT NOT NULL,
        tags_json TEXT NOT NULL DEFAULT '[]',
        source_name TEXT,
        source_url TEXT,
        confidence TEXT NOT NULL DEFAULT 'unverified',
        status TEXT NOT NULL DEFAULT 'draft',
        hidden_by_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(game_id) REFERENCES recon_games(id),
        FOREIGN KEY(map_id) REFERENCES recon_maps(id)
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS recon_guides (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        map_id TEXT,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        summary TEXT,
        body TEXT NOT NULL,
        linked_marker_ids_json TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, slug),
        FOREIGN KEY(game_id) REFERENCES recon_games(id),
        FOREIGN KEY(map_id) REFERENCES recon_maps(id)
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE TABLE IF NOT EXISTS recon_marker_suggestions (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        map_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        variant TEXT NOT NULL,
        category TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        x REAL NOT NULL,
        y REAL NOT NULL,
        floor TEXT,
        icon_key TEXT NOT NULL,
        source_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(game_id) REFERENCES recon_games(id),
        FOREIGN KEY(map_id) REFERENCES recon_maps(id)
      );
    `,
    args: [],
  },
  {
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_official_source_suggestion
      ON official_items(source_suggestion_id)
      WHERE source_suggestion_id IS NOT NULL;
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
      ON contact_submissions(created_at);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at
      ON page_views(created_at);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at
      ON page_views(path, created_at);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_recon_games_slug
      ON recon_games(slug);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_recon_maps_game_status
      ON recon_maps(game_id, status, enabled);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_recon_assets_map_visibility
      ON recon_assets(map_id, visibility);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_recon_markers_map_status
      ON recon_markers(map_id, status);
    `,
    args: [],
  },
  {
    sql: `
      CREATE INDEX IF NOT EXISTS idx_recon_marker_suggestions_map_status
      ON recon_marker_suggestions(map_id, status);
    `,
    args: [],
  },
]);

await db.execute("DELETE FROM official_items WHERE id LIKE 'seed-sample-%';");

for (const item of seedItems) {
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO official_items (
        id,
        item_name,
        category,
        map_name,
        location_description,
        notes,
        verified
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        item_name = excluded.item_name,
        category = excluded.category,
        map_name = excluded.map_name,
        location_description = excluded.location_description,
        notes = excluded.notes,
        verified = excluded.verified;
    `,
    args: [
      item.id,
      item.itemName,
      item.category,
      item.mapName,
      item.locationDescription,
      item.notes,
      item.verified ? 1 : 0,
    ],
  });
}

for (const game of reconSeedGames) {
  await db.execute({
    sql: `
      INSERT INTO recon_games (
        id,
        slug,
        title,
        short_title,
        description,
        enabled,
        sort_order,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        short_title = excluded.short_title,
        description = excluded.description,
        enabled = excluded.enabled,
        sort_order = excluded.sort_order,
        updated_at = CURRENT_TIMESTAMP;
    `,
    args: [
      game.id,
      game.slug,
      game.title,
      game.shortTitle,
      game.description,
      game.enabled ? 1 : 0,
      game.sortOrder,
    ],
  });
}

for (const map of reconSeedMaps) {
  await db.execute({
    sql: `
      INSERT INTO recon_maps (
        id,
        game_id,
        slug,
        title,
        subtitle,
        description,
        image_asset_id,
        width,
        height,
        min_zoom,
        max_zoom,
        floor_support,
        enabled,
        status,
        sort_order,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        game_id = excluded.game_id,
        slug = excluded.slug,
        title = excluded.title,
        subtitle = excluded.subtitle,
        description = excluded.description,
        image_asset_id = excluded.image_asset_id,
        width = excluded.width,
        height = excluded.height,
        min_zoom = excluded.min_zoom,
        max_zoom = excluded.max_zoom,
        floor_support = excluded.floor_support,
        enabled = excluded.enabled,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_at = CURRENT_TIMESTAMP;
    `,
    args: [
      map.id,
      map.gameId,
      map.slug,
      map.title,
      map.subtitle || null,
      map.description || null,
      map.imageAssetId || null,
      map.width,
      map.height,
      map.minZoom ?? null,
      map.maxZoom ?? null,
      map.floorSupport ? 1 : 0,
      map.enabled ? 1 : 0,
      map.status,
      map.sortOrder,
    ],
  });
}

for (const asset of reconSeedAssets) {
  await db.execute({
    sql: `
      INSERT INTO recon_assets (
        id,
        game_id,
        map_id,
        type,
        path,
        width,
        height,
        source_name,
        source_url,
        license,
        attribution,
        imported,
        status,
        visibility,
        notes,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        game_id = excluded.game_id,
        map_id = excluded.map_id,
        type = excluded.type,
        path = excluded.path,
        width = excluded.width,
        height = excluded.height,
        source_name = excluded.source_name,
        source_url = excluded.source_url,
        license = excluded.license,
        attribution = excluded.attribution,
        imported = excluded.imported,
        status = excluded.status,
        visibility = excluded.visibility,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP;
    `,
    args: [
      asset.id,
      asset.gameId,
      asset.mapId || null,
      asset.type,
      asset.path,
      asset.width ?? null,
      asset.height ?? null,
      asset.sourceName || null,
      asset.sourceUrl || null,
      asset.license || null,
      asset.attribution || null,
      asset.imported ? 1 : 0,
      asset.status,
      asset.visibility,
      asset.notes || null,
    ],
  });
}

console.log(
  `Seeded ${seedItems.length} guide items, ${reconSeedGames.length} Recon games, ${reconSeedMaps.length} Recon draft maps, and ${reconSeedAssets.length} Recon assets.`,
);
