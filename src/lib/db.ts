import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const localDataDir = join(process.cwd(), ".data");

declare global {
  var vaexilDbClient: Client | undefined;
  var vaexilDbReady: Promise<void> | undefined;
}

export function getDb() {
  if (!globalThis.vaexilDbClient) {
    const url =
      process.env.LIBSQL_URL ||
      (process.env.NODE_ENV === "production" ? "" : "file:.data/vaexil.db");

    if (!url) {
      throw new Error(
        "LIBSQL_URL is required in production. Use a hosted libSQL/Turso database for deployed environments.",
      );
    }

    if (process.env.VERCEL && url.startsWith("file:")) {
      throw new Error(
        "Vercel deployments require a hosted database. Set LIBSQL_URL to a libSQL/Turso URL instead of a local file path.",
      );
    }

    if (url.startsWith("file:")) {
      mkdirSync(localDataDir, { recursive: true });
    }

    globalThis.vaexilDbClient = createClient({
      url,
      authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
    });
  }

  return globalThis.vaexilDbClient;
}

export async function ensureDb() {
  if (!globalThis.vaexilDbReady) {
    globalThis.vaexilDbReady = migrateDb();
  }

  return globalThis.vaexilDbReady;
}

async function migrateDb() {
  const db = getDb();

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
          suggestion_type TEXT NOT NULL DEFAULT 'new_marker',
          target_marker_id TEXT,
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
          submitter_note TEXT,
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
        CREATE TABLE IF NOT EXISTS recon_source_packets (
          map_id TEXT PRIMARY KEY,
          game_id TEXT NOT NULL,
          status TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          last_reviewed TEXT,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(map_id) REFERENCES recon_maps(id),
          FOREIGN KEY(game_id) REFERENCES recon_games(id)
        );
      `,
      args: [],
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS recon_source_cross_checks (
          map_id TEXT PRIMARY KEY,
          game_id TEXT NOT NULL,
          status TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          last_reviewed TEXT,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(map_id) REFERENCES recon_maps(id),
          FOREIGN KEY(game_id) REFERENCES recon_games(id)
        );
      `,
      args: [],
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS recon_marker_details (
          marker_id TEXT PRIMARY KEY,
          map_id TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          last_reviewed TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(marker_id) REFERENCES recon_markers(id),
          FOREIGN KEY(map_id) REFERENCES recon_maps(id)
        );
      `,
      args: [],
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_suggestions_status
        ON community_suggestions(status);
      `,
      args: [],
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_votes_suggestion
        ON suggestion_votes(suggestion_id);
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
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_recon_source_packets_game
        ON recon_source_packets(game_id);
      `,
      args: [],
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_recon_source_cross_checks_game
        ON recon_source_cross_checks(game_id);
      `,
      args: [],
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_recon_marker_details_map
        ON recon_marker_details(map_id);
      `,
      args: [],
    },
  ]);

  await ensureReconMarkerSuggestionColumns(db);
}

async function ensureColumn(
  db: Client,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const result = await db.execute(`PRAGMA table_info(${tableName});`);
  const hasColumn = result.rows.some((row) => row.name === columnName);

  if (!hasColumn) {
    await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${definition};`);
  }
}

async function ensureReconMarkerSuggestionColumns(db: Client) {
  await ensureColumn(
    db,
    "recon_marker_suggestions",
    "suggestion_type",
    "suggestion_type TEXT NOT NULL DEFAULT 'new_marker'",
  );
  await ensureColumn(
    db,
    "recon_marker_suggestions",
    "target_marker_id",
    "target_marker_id TEXT",
  );
  await ensureColumn(
    db,
    "recon_marker_suggestions",
    "submitter_note",
    "submitter_note TEXT",
  );
}
