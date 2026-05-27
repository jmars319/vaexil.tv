import type {
  ReconSourceCrossCheck,
} from "@/data/recon/source-cross-checks";
import {
  getStaticReconSourceCrossCheck,
  listStaticReconSourceCrossChecks,
} from "@/data/recon/source-cross-checks";
import type { ReconSourcePacket } from "@/data/recon/source-packets";
import {
  getStaticReconSourcePacket,
  listStaticReconSourcePackets,
} from "@/data/recon/source-packets";
import { ensureDb, getDb } from "@/lib/db";

function parsePayload<T>(value: unknown) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function getReconSourcePacket(mapId: string) {
  await ensureDb();

  const result = await getDb().execute({
    sql: `
      SELECT payload_json
      FROM recon_source_packets
      WHERE map_id = ?
      LIMIT 1;
    `,
    args: [mapId],
  });

  const packet = parsePayload<ReconSourcePacket>(result.rows[0]?.payload_json);
  return packet || getStaticReconSourcePacket(mapId);
}

export async function listReconSourcePackets() {
  await ensureDb();

  const result = await getDb().execute(`
    SELECT payload_json
    FROM recon_source_packets
    ORDER BY game_id ASC, map_id ASC;
  `);
  const packets = result.rows
    .map((row) => parsePayload<ReconSourcePacket>(row.payload_json))
    .filter((packet): packet is ReconSourcePacket => Boolean(packet));

  return packets.length > 0 ? packets : listStaticReconSourcePackets();
}

export async function getReconSourceCrossCheck(mapId: string) {
  await ensureDb();

  const result = await getDb().execute({
    sql: `
      SELECT payload_json
      FROM recon_source_cross_checks
      WHERE map_id = ?
      LIMIT 1;
    `,
    args: [mapId],
  });

  const check = parsePayload<ReconSourceCrossCheck>(
    result.rows[0]?.payload_json,
  );
  return check || getStaticReconSourceCrossCheck(mapId);
}

export async function listReconSourceCrossChecks() {
  await ensureDb();

  const result = await getDb().execute(`
    SELECT payload_json
    FROM recon_source_cross_checks
    ORDER BY game_id ASC, map_id ASC;
  `);
  const checks = result.rows
    .map((row) => parsePayload<ReconSourceCrossCheck>(row.payload_json))
    .filter((check): check is ReconSourceCrossCheck => Boolean(check));

  return checks.length > 0 ? checks : listStaticReconSourceCrossChecks();
}
