import {
  getArmorOptimizerUrl,
  refreshBungieSession,
} from "@/lib/bungie-oauth";
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

function clearSessionAndRedirect() {
  const response = NextResponse.redirect(getArmorOptimizerUrl("expired"), 303);
  response.cookies.set(
    BUNGIE_SESSION_COOKIE,
    "",
    getExpiredBungieCookieOptions(),
  );
  return response;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const sealedSession = request.cookies.get(BUNGIE_SESSION_COOKIE)?.value;
    const currentSession = unsealBungieSession(sealedSession);

    if (!currentSession) {
      return clearSessionAndRedirect();
    }

    const session = await refreshBungieSession(currentSession);
    const response = NextResponse.redirect(getArmorOptimizerUrl("connected"), 303);
    response.cookies.set(
      BUNGIE_SESSION_COOKIE,
      sealBungieSession(session),
      getBungieSessionCookieOptions(session.refreshExpiresAt),
    );
    return response;
  } catch {
    return clearSessionAndRedirect();
  }
}
