import {
  exchangeAuthorizationCode,
  getArmorOptimizerUrl,
} from "@/lib/bungie-oauth";
import {
  BUNGIE_OAUTH_STATE_COOKIE,
  BUNGIE_SESSION_COOKIE,
  getBungieSessionCookieOptions,
  getExpiredBungieCookieOptions,
  oauthStatesMatch,
  sealBungieSession,
} from "@/lib/bungie-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectWithClearedState(status: string) {
  const response = NextResponse.redirect(getArmorOptimizerUrl(status));
  response.cookies.set(
    BUNGIE_OAUTH_STATE_COOKIE,
    "",
    getExpiredBungieCookieOptions(),
  );
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const state = request.nextUrl.searchParams.get("state")?.trim();
  const expectedState = request.cookies.get(BUNGIE_OAUTH_STATE_COOKIE)?.value;

  if (request.nextUrl.searchParams.has("error")) {
    return redirectWithClearedState("denied");
  }

  if (!code || !oauthStatesMatch(expectedState, state)) {
    return redirectWithClearedState("invalid-state");
  }

  try {
    const session = await exchangeAuthorizationCode(code);
    const response = redirectWithClearedState("connected");
    response.cookies.set(
      BUNGIE_SESSION_COOKIE,
      sealBungieSession(session),
      getBungieSessionCookieOptions(session.refreshExpiresAt),
    );

    return response;
  } catch {
    return redirectWithClearedState("exchange-failed");
  }
}
