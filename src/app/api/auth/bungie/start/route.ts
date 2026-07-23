import { getBungieAuthorizationUrl } from "@/lib/bungie-oauth";
import { assertBungieInventoryConfigured } from "@/lib/bungie-inventory";
import {
  BUNGIE_OAUTH_STATE_COOKIE,
  assertBungieSessionConfigured,
  generateOauthState,
  getOauthStateCookieOptions,
} from "@/lib/bungie-session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    assertBungieInventoryConfigured();
    assertBungieSessionConfigured();
    const state = generateOauthState();
    const response = NextResponse.redirect(getBungieAuthorizationUrl(state));
    response.cookies.set(
      BUNGIE_OAUTH_STATE_COOKIE,
      state,
      getOauthStateCookieOptions(),
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Bungie authentication is not configured." },
      { status: 503 },
    );
  }
}
