import { ensureDb, getDb } from "@/lib/db";
import { suggestionReadyVoteThreshold } from "@/lib/config";
import type {
  CommunitySuggestion,
  OfficialGuideItem,
  SuggestionStatus,
} from "@/lib/types";
import type { suggestionSchema } from "@/lib/validation";
import type { Row } from "@libsql/client";
import type { z } from "zod";

type SuggestionInput = z.infer<typeof suggestionSchema>;

const publicSuggestionStatuses: SuggestionStatus[] = [
  "pending",
  "ready_for_review",
  "verified",
];

function readString(row: Row, key: string) {
  const value = row[key];
  return value == null ? "" : String(value);
}

function readNullableString(row: Row, key: string) {
  const value = row[key];
  return value == null || value === "" ? null : String(value);
}

function readStatus(row: Row): SuggestionStatus {
  const value = readString(row, "status");
  if (
    value === "pending" ||
    value === "ready_for_review" ||
    value === "verified" ||
    value === "rejected" ||
    value === "published"
  ) {
    return value;
  }

  return "pending";
}

function mapOfficialItem(row: Row): OfficialGuideItem {
  return {
    id: readString(row, "id"),
    itemName: readString(row, "item_name"),
    category: readString(row, "category"),
    mapName: readString(row, "map_name"),
    locationDescription: readString(row, "location_description"),
    notes: readString(row, "notes"),
    verified: Number(row.verified || 0) === 1,
    createdAt: readString(row, "created_at"),
  };
}

function mapSuggestion(row: Row): CommunitySuggestion {
  return {
    id: readString(row, "id"),
    itemName: readString(row, "item_name"),
    category: readString(row, "category"),
    mapName: readString(row, "map_name"),
    locationDescription: readString(row, "location_description"),
    notes: readString(row, "notes"),
    sourceUrl: readNullableString(row, "source_url"),
    status: readStatus(row),
    voteCount: Number(row.vote_count || 0),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

export async function listOfficialItems() {
  await ensureDb();
  const result = await getDb().execute(`
    SELECT *
    FROM official_items
    ORDER BY map_name ASC, item_name ASC;
  `);

  return result.rows.map(mapOfficialItem);
}

export async function listSuggestions(options?: { includeClosed?: boolean }) {
  await ensureDb();
  const allowedStatuses = options?.includeClosed
    ? ["pending", "ready_for_review", "verified", "rejected", "published"]
    : publicSuggestionStatuses;

  const placeholders = allowedStatuses.map(() => "?").join(", ");
  const result = await getDb().execute({
    sql: `
      SELECT
        s.*,
        COUNT(v.id) AS vote_count
      FROM community_suggestions s
      LEFT JOIN suggestion_votes v ON v.suggestion_id = s.id
      WHERE s.status IN (${placeholders})
      GROUP BY s.id
      ORDER BY
        CASE s.status
          WHEN 'ready_for_review' THEN 0
          WHEN 'verified' THEN 1
          WHEN 'pending' THEN 2
          WHEN 'published' THEN 3
          ELSE 4
        END,
        vote_count DESC,
        s.created_at DESC;
    `,
    args: allowedStatuses,
  });

  return result.rows.map(mapSuggestion);
}

export async function createSuggestion(input: SuggestionInput) {
  await ensureDb();
  const id = crypto.randomUUID();

  await getDb().execute({
    sql: `
      INSERT INTO community_suggestions (
        id,
        item_name,
        category,
        map_name,
        location_description,
        notes,
        source_url,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending');
    `,
    args: [
      id,
      input.itemName,
      input.category,
      input.mapName,
      input.locationDescription,
      input.notes,
      input.sourceUrl || null,
    ],
  });

  return id;
}

export async function addVote(suggestionId: string, voterKey: string) {
  await ensureDb();
  const db = getDb();

  const existingSuggestion = await db.execute({
    sql: `
      SELECT id, status
      FROM community_suggestions
      WHERE id = ?
      LIMIT 1;
    `,
    args: [suggestionId],
  });

  const currentStatus = existingSuggestion.rows[0]?.status;
  if (
    currentStatus !== "pending" &&
    currentStatus !== "ready_for_review" &&
    currentStatus !== "verified"
  ) {
    return { counted: false, voteCount: 0 };
  }

  const before = await countVotes(suggestionId);

  await db.execute({
    sql: `
      INSERT OR IGNORE INTO suggestion_votes (id, suggestion_id, voter_key)
      VALUES (?, ?, ?);
    `,
    args: [crypto.randomUUID(), suggestionId, voterKey],
  });

  const voteCount = await countVotes(suggestionId);

  if (
    voteCount >= suggestionReadyVoteThreshold &&
    currentStatus === "pending"
  ) {
    await db.execute({
      sql: `
        UPDATE community_suggestions
        SET status = 'ready_for_review', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'pending';
      `,
      args: [suggestionId],
    });
  }

  return { counted: voteCount > before, voteCount };
}

async function countVotes(suggestionId: string) {
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) AS count FROM suggestion_votes WHERE suggestion_id = ?;",
    args: [suggestionId],
  });

  return Number(result.rows[0]?.count || 0);
}

export async function rejectSuggestionById(suggestionId: string) {
  await ensureDb();
  await getDb().execute({
    sql: `
      UPDATE community_suggestions
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status != 'published';
    `,
    args: [suggestionId],
  });
}

export async function verifySuggestionById(suggestionId: string) {
  await ensureDb();
  await getDb().execute({
    sql: `
      UPDATE community_suggestions
      SET status = 'verified', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status IN ('pending', 'ready_for_review');
    `,
    args: [suggestionId],
  });
}

export async function publishSuggestionById(suggestionId: string) {
  await ensureDb();
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT *
      FROM community_suggestions
      WHERE id = ? AND status = 'verified'
      LIMIT 1;
    `,
    args: [suggestionId],
  });

  const suggestion = result.rows[0];
  if (!suggestion) {
    throw new Error("Only verified suggestions can be published.");
  }

  const officialId = `published-${suggestionId}`;

  await db.batch([
    {
      sql: `
        INSERT OR IGNORE INTO official_items (
          id,
          item_name,
          category,
          map_name,
          location_description,
          notes,
          verified,
          source_suggestion_id
        )
        VALUES (?, ?, ?, ?, ?, ?, 1, ?);
      `,
      args: [
        officialId,
        readString(suggestion, "item_name"),
        readString(suggestion, "category"),
        readString(suggestion, "map_name"),
        readString(suggestion, "location_description"),
        readString(suggestion, "notes"),
        suggestionId,
      ],
    },
    {
      sql: `
        UPDATE community_suggestions
        SET status = 'published',
          published_item_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?;
      `,
      args: [officialId, suggestionId],
    },
  ]);
}
