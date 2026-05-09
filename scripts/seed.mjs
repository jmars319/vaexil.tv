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
      CREATE UNIQUE INDEX IF NOT EXISTS idx_official_source_suggestion
      ON official_items(source_suggestion_id)
      WHERE source_suggestion_id IS NOT NULL;
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

console.log(`Seeded ${seedItems.length} verified Vaexil.tv guide items.`);
