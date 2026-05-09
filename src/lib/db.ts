import { createClient, type Client } from "@libsql/client";
import officialSeedItems from "@/data/freelancer-free-items.json";
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
    globalThis.vaexilDbReady = migrateAndSeed();
  }

  return globalThis.vaexilDbReady;
}

async function migrateAndSeed() {
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
  ]);

  await db.execute("DELETE FROM official_items WHERE id LIKE 'seed-sample-%';");

  await db.batch(
    officialSeedItems.map((item) => ({
      sql: `
        INSERT INTO official_items (
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
    })),
  );
}
