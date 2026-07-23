import { getBungieInventorySummary } from "@/lib/bungie-inventory";
import { ensureFreshBungieSession } from "@/lib/bungie-oauth";
import {
  BUNGIE_SESSION_COOKIE,
  getBungieSessionCookieOptions,
  getExpiredBungieCookieOptions,
  sealBungieSession,
  unsealBungieSession,
} from "@/lib/bungie-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorizedResponse() {
  const response = NextResponse.json(
    { connected: false, error: "Connect a Bungie account to import inventory." },
    { status: 401 },
  );
  response.cookies.set(
    BUNGIE_SESSION_COOKIE,
    "",
    getExpiredBungieCookieOptions(),
  );
  return response;
}

export async function GET(request: NextRequest) {
  let currentSession;

  try {
    const sealedSession = request.cookies.get(BUNGIE_SESSION_COOKIE)?.value;
    currentSession = unsealBungieSession(sealedSession);
  } catch {
    return NextResponse.json(
      { connected: false, error: "Bungie authentication is not configured." },
      { status: 503 },
    );
  }

  if (!currentSession || currentSession.refreshExpiresAt <= Date.now()) {
    return unauthorizedResponse();
  }

  try {
    const { session, refreshed } = await ensureFreshBungieSession(currentSession);
    return await respondWithInventory(session, refreshed);
  } catch {
    return unauthorizedResponse();
  }
}

async function respondWithInventory(
  session: NonNullable<ReturnType<typeof unsealBungieSession>>,
  refreshed: boolean,
) {
  try {
    const inventory = await getBungieInventorySummary(session.accessToken);
    const response = NextResponse.json({ connected: true, inventory });

    if (refreshed) {
      response.cookies.set(
        BUNGIE_SESSION_COOKIE,
        sealBungieSession(session),
        getBungieSessionCookieOptions(session.refreshExpiresAt),
      );
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message.includes("not configured") ||
      message.includes("must contain at least")
    ) {
      return NextResponse.json(
        { connected: false, error: "Bungie authentication is not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { connected: true, error: "Bungie inventory is temporarily unavailable." },
      { status: 502 },
    );
  }
}
