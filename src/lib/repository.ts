import { ensureDb, getDb } from "@/lib/db";
import { suggestionReadyVoteThreshold } from "@/lib/config";
import type {
  AnalyticsSummary,
  SuggestionStatus,
} from "@/lib/types";
import type {
  contactSchema,
  reconMarkerSuggestionSchema,
  suggestionSchema,
} from "@/lib/validation";
import {
  mapContactSubmission,
  mapOfficialItem,
  mapReconAsset,
  mapReconGame,
  mapReconMap,
  mapReconMarker,
  mapReconMarkerSuggestion,
  mapSuggestion,
  readString,
  reconMapSelect,
} from "@/lib/repository-row";
import type { z } from "zod";

type SuggestionInput = z.infer<typeof suggestionSchema>;
type ContactInput = z.infer<typeof contactSchema>;
type ReconMarkerSuggestionInput = z.infer<
  typeof reconMarkerSuggestionSchema
>;

const publicSuggestionStatuses: SuggestionStatus[] = [
  "pending",
  "ready_for_review",
  "verified",
];

export async function listOfficialItems() {
  await ensureDb();
  const result = await getDb().execute(`
    SELECT *
    FROM official_items
    ORDER BY map_name ASC, item_name ASC;
  `);

  return result.rows.map(mapOfficialItem);
}

export async function listReconGames() {
  await ensureDb();
  const result = await getDb().execute(`
    SELECT *
    FROM recon_games
    WHERE enabled = 1
    ORDER BY sort_order ASC, title ASC;
  `);

  return result.rows.map(mapReconGame);
}

export async function getReconGameBySlug(slug: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT *
      FROM recon_games
      WHERE slug = ? AND enabled = 1
      LIMIT 1;
    `,
    args: [slug],
  });

  const row = result.rows[0];
  return row ? mapReconGame(row) : null;
}

export async function listPublicReconMapsForGame(gameId: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT ${reconMapSelect}
      FROM recon_maps m
      INNER JOIN recon_games g ON g.id = m.game_id
      INNER JOIN recon_assets a
        ON a.id = m.image_asset_id
        AND a.visibility = 'public'
        AND a.status = 'approved'
      WHERE m.game_id = ?
        AND m.enabled = 1
        AND m.status = 'published'
      ORDER BY m.sort_order ASC, m.title ASC;
    `,
    args: [gameId],
  });

  return result.rows.map(mapReconMap);
}

export async function getPublicReconMap(gameSlug: string, mapSlug: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT ${reconMapSelect}
      FROM recon_maps m
      INNER JOIN recon_games g ON g.id = m.game_id
      INNER JOIN recon_assets a
        ON a.id = m.image_asset_id
        AND a.visibility = 'public'
        AND a.status = 'approved'
      WHERE g.slug = ?
        AND m.slug = ?
        AND g.enabled = 1
        AND m.enabled = 1
        AND m.status = 'published'
      LIMIT 1;
    `,
    args: [gameSlug, mapSlug],
  });

  const row = result.rows[0];
  return row ? mapReconMap(row) : null;
}

export async function listAdminReconMaps() {
  await ensureDb();
  const result = await getDb().execute(`
    SELECT ${reconMapSelect}
    FROM recon_maps m
    INNER JOIN recon_games g ON g.id = m.game_id
    LEFT JOIN recon_assets a ON a.id = m.image_asset_id
    ORDER BY g.sort_order ASC, m.sort_order ASC, m.title ASC;
  `);

  return result.rows.map(mapReconMap);
}

export async function getAdminReconMapBySlug(mapSlug: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT ${reconMapSelect}
      FROM recon_maps m
      INNER JOIN recon_games g ON g.id = m.game_id
      LEFT JOIN recon_assets a ON a.id = m.image_asset_id
      WHERE m.slug = ?
      ORDER BY g.sort_order ASC, m.sort_order ASC
      LIMIT 1;
    `,
    args: [mapSlug],
  });

  const row = result.rows[0];
  return row ? mapReconMap(row) : null;
}

export async function getReconAssetById(assetId: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT *
      FROM recon_assets
      WHERE id = ?
      LIMIT 1;
    `,
    args: [assetId],
  });

  const row = result.rows[0];
  return row ? mapReconAsset(row) : null;
}

export async function listPublishedReconMarkers(mapId: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT *
      FROM recon_markers
      WHERE map_id = ? AND status = 'published'
      ORDER BY category ASC, label ASC;
    `,
    args: [mapId],
  });

  return result.rows.map(mapReconMarker);
}

export async function listAdminReconMarkers(mapId: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT *
      FROM recon_markers
      WHERE map_id = ?
        AND status IN ('draft', 'pending', 'ready_for_review', 'verified', 'published')
      ORDER BY category ASC, label ASC;
    `,
    args: [mapId],
  });

  return result.rows.map(mapReconMarker);
}

export async function listReconMarkerSuggestions(mapId?: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: `
      SELECT
        s.*,
        g.title AS game_title,
        m.title AS map_title
      FROM recon_marker_suggestions s
      INNER JOIN recon_games g ON g.id = s.game_id
      INNER JOIN recon_maps m ON m.id = s.map_id
      ${mapId ? "WHERE s.map_id = ?" : ""}
      ORDER BY s.created_at DESC
      LIMIT ${mapId ? 250 : 50};
    `,
    args: mapId ? [mapId] : [],
  });

  return result.rows.map(mapReconMarkerSuggestion);
}

export async function createReconMarkerSuggestion(
  input: ReconMarkerSuggestionInput,
) {
  await ensureDb();

  const mapResult = await getDb().execute({
    sql: `
      SELECT id
      FROM recon_maps
      WHERE id = ? AND game_id = ?
      LIMIT 1;
    `,
    args: [input.mapId, input.gameId],
  });

  if (!mapResult.rows[0]) {
    throw new Error("Recon map not found for marker suggestion.");
  }

  const id = crypto.randomUUID();
  await getDb().execute({
    sql: `
      INSERT INTO recon_marker_suggestions (
        id,
        game_id,
        map_id,
        mode,
        variant,
        category,
        label,
        description,
        x,
        y,
        floor,
        icon_key,
        source_url,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');
    `,
    args: [
      id,
      input.gameId,
      input.mapId,
      input.mode,
      input.variant,
      input.category,
      input.label,
      input.description || null,
      input.x,
      input.y,
      input.floor || null,
      input.iconKey,
      input.sourceUrl || null,
    ],
  });

  return id;
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

export async function recordContactSubmission(input: ContactInput) {
  await ensureDb();
  const id = crypto.randomUUID();

  await getDb().execute({
    sql: `
      INSERT INTO contact_submissions (
        id,
        name,
        email,
        organization,
        inquiry_type,
        message
      )
      VALUES (?, ?, ?, ?, ?, ?);
    `,
    args: [
      id,
      input.name,
      input.email,
      input.organization,
      input.inquiryType,
      input.message,
    ],
  });

  return id;
}

export async function updateContactSubmissionEmailStatus(
  id: string,
  emailStatus: "sent" | "failed" | "disabled",
) {
  if (!id) {
    return;
  }

  await ensureDb();
  await getDb().execute({
    sql: `
      UPDATE contact_submissions
      SET email_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    args: [emailStatus, id],
  });
}

export async function listRecentContactSubmissions(limit = 5) {
  await ensureDb();

  const result = await getDb().execute({
    sql: `
      SELECT *
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT ?;
    `,
    args: [limit],
  });

  return result.rows.map(mapContactSubmission);
}

export async function recordPageView(input: {
  path: string;
  referrer?: string;
}) {
  const path = input.path.trim().slice(0, 500);

  if (
    !path ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next")
  ) {
    return;
  }

  await ensureDb();
  await getDb().execute({
    sql: `
      INSERT INTO page_views (id, path, referrer)
      VALUES (?, ?, ?);
    `,
    args: [
      crypto.randomUUID(),
      path,
      input.referrer?.trim().slice(0, 500) || null,
    ],
  });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    topPaths: [],
    recentDays: [],
  };

  try {
    await ensureDb();

    const [sevenDays, thirtyDays, topPaths, recentDays] = await Promise.all([
      getDb().execute({
        sql: `
          SELECT COUNT(*) AS count
          FROM page_views
          WHERE created_at >= datetime('now', '-7 days');
        `,
        args: [],
      }),
      getDb().execute({
        sql: `
          SELECT COUNT(*) AS count
          FROM page_views
          WHERE created_at >= datetime('now', '-30 days');
        `,
        args: [],
      }),
      getDb().execute({
        sql: `
          SELECT path, COUNT(*) AS views
          FROM page_views
          WHERE created_at >= datetime('now', '-30 days')
          GROUP BY path
          ORDER BY views DESC, path ASC
          LIMIT 6;
        `,
        args: [],
      }),
      getDb().execute({
        sql: `
          SELECT date(created_at) AS day, COUNT(*) AS views
          FROM page_views
          WHERE created_at >= datetime('now', '-7 days')
          GROUP BY date(created_at)
          ORDER BY day ASC;
        `,
        args: [],
      }),
    ]);

    return {
      viewsLast7Days: Number(sevenDays.rows[0]?.count || 0),
      viewsLast30Days: Number(thirtyDays.rows[0]?.count || 0),
      topPaths: topPaths.rows.map((row) => ({
        path: readString(row, "path"),
        views: Number(row.views || 0),
      })),
      recentDays: recentDays.rows.map((row) => ({
        day: readString(row, "day"),
        views: Number(row.views || 0),
      })),
    };
  } catch (error) {
    console.error("Failed to load Vaexil analytics summary.", error);
    return empty;
  }
}
