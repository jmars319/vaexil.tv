import type { Row } from "@libsql/client";
import {
  listStaticReconMarkerDetailsForMap,
  type StaticReconMarkerDetail,
} from "@/data/recon/marker-details";
import { ensureDb, getDb } from "@/lib/db";
import type {
  ReconMarkerDetail,
  ReconMarkerDetailPayload,
  ReconStatus,
} from "@/lib/types";

function parsePayload(value: unknown) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  try {
    return JSON.parse(value) as ReconMarkerDetailPayload;
  } catch {
    return null;
  }
}

function readStatus(row: Row): ReconStatus {
  const status = String(row.status || "");
  if (
    status === "draft" ||
    status === "pending" ||
    status === "ready_for_review" ||
    status === "verified" ||
    status === "published" ||
    status === "rejected" ||
    status === "archived"
  ) {
    return status;
  }

  return "draft";
}

function mapRow(row: Row): ReconMarkerDetail | null {
  const payload = parsePayload(row.payload_json);
  if (!payload) {
    return null;
  }

  return {
    markerId: String(row.marker_id || payload.markerId),
    mapId: String(row.map_id || payload.mapId),
    payload,
    status: readStatus(row),
    lastReviewed: row.last_reviewed == null ? null : String(row.last_reviewed),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

function mapStaticDetail(detail: StaticReconMarkerDetail): ReconMarkerDetail {
  return {
    markerId: detail.markerId,
    mapId: detail.mapId,
    payload: detail,
    status: detail.status,
    lastReviewed: detail.lastReviewed || null,
    createdAt: "",
    updatedAt: "",
  };
}

export async function listReconMarkerDetails(mapId: string) {
  await ensureDb();

  const result = await getDb().execute({
    sql: `
      SELECT *
      FROM recon_marker_details
      WHERE map_id = ?
      ORDER BY marker_id ASC;
    `,
    args: [mapId],
  });

  const details = result.rows
    .map(mapRow)
    .filter((detail): detail is ReconMarkerDetail => Boolean(detail));

  if (details.length > 0) {
    return details;
  }

  const staticDetails = await listStaticReconMarkerDetailsForMap(mapId);
  return staticDetails.map(mapStaticDetail);
}
