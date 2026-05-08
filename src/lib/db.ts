import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const localDataDir = join(process.cwd(), ".data");

const officialSeedItems = [
  {
    id: "seed-sample-alpha",
    itemName: "Sample Item Alpha",
    category: "Fictional sample",
    mapName: "Example Map One",
    locationDescription:
      "Placeholder location description for layout and filtering only.",
    notes:
      "Seed data only. Replace with verified stream/community findings before treating this as guide content.",
    verified: 0,
  },
  {
    id: "seed-sample-beta",
    itemName: "Sample Item Beta",
    category: "Fictional sample",
    mapName: "Example Map Two",
    locationDescription:
      "Another fictional row used to confirm the table reads well on mobile.",
    notes:
      "This is not real Hitman Freelancer data and should not be published as fact.",
    verified: 0,
  },
  {
    id: "seed-sample-gamma",
    itemName: "Sample Item Gamma",
    category: "Fictional sample",
    mapName: "Example Map Three",
    locationDescription:
      "Short placeholder location text for testing the search experience.",
    notes: "Seeded placeholder. Awaiting verified guide entries.",
    verified: 0,
  },
];

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
  ]);

  const existing = await db.execute("SELECT COUNT(*) AS count FROM official_items;");
  const count = Number(existing.rows[0]?.count || 0);

  if (count === 0) {
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
          VALUES (?, ?, ?, ?, ?, ?, ?);
        `,
        args: [
          item.id,
          item.itemName,
          item.category,
          item.mapName,
          item.locationDescription,
          item.notes,
          item.verified,
        ],
      })),
    );
  }
}
