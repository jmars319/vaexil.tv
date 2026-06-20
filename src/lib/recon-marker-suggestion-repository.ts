import { ensureDb, getDb } from "@/lib/db";
import { mapReconMarkerSuggestion } from "@/lib/repository-row";
import type { reconMarkerSuggestionSchema } from "@/lib/validation";
import type { z } from "zod";

type ReconMarkerSuggestionInput = z.infer<
  typeof reconMarkerSuggestionSchema
>;

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
  options?: { publicOnly?: boolean },
) {
  await ensureDb();

  const publicJoin = options?.publicOnly
    ? "INNER JOIN recon_games g ON g.id = m.game_id"
    : "";
  const publicWhere = options?.publicOnly
    ? "AND m.enabled = 1 AND m.status = 'published' AND g.enabled = 1"
    : "";
  const mapResult = await getDb().execute({
    sql: `
      SELECT m.id
      FROM recon_maps m
      ${publicJoin}
      WHERE m.id = ? AND m.game_id = ?
        ${publicWhere}
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
        id, suggestion_type, target_marker_id, game_id, map_id, mode, variant,
        category, label, description, x, y, floor, icon_key, source_url,
        submitter_note, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');
    `,
    args: [
      id,
      input.suggestionType,
      input.targetMarkerId || null,
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
      input.submitterNote || null,
    ],
  });

  return id;
}
