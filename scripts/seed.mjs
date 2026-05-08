import { createClient } from "@libsql/client";
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

const seedItems = [
  [
    "seed-sample-alpha",
    "Sample Item Alpha",
    "Fictional sample",
    "Example Map One",
    "Placeholder location description for layout and filtering only.",
    "Seed data only. Replace with verified stream/community findings before treating this as guide content.",
    0,
  ],
  [
    "seed-sample-beta",
    "Sample Item Beta",
    "Fictional sample",
    "Example Map Two",
    "Another fictional row used to confirm the table reads well on mobile.",
    "This is not real Hitman Freelancer data and should not be published as fact.",
    0,
  ],
  [
    "seed-sample-gamma",
    "Sample Item Gamma",
    "Fictional sample",
    "Example Map Three",
    "Short placeholder location text for testing the search experience.",
    "Seeded placeholder. Awaiting verified guide entries.",
    0,
  ],
];

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
      CREATE UNIQUE INDEX IF NOT EXISTS idx_official_source_suggestion
      ON official_items(source_suggestion_id)
      WHERE source_suggestion_id IS NOT NULL;
    `,
    args: [],
  },
]);

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
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    args: item,
  });
}

console.log("Seeded Vaexil.tv placeholder guide data.");
