import {
  BUNGIE_SESSION_COOKIE,
  getExpiredBungieCookieOptions,
} from "@/lib/bungie-session";
import { getArmorOptimizerUrl } from "@/lib/bungie-oauth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const response = NextResponse.redirect(getArmorOptimizerUrl(), 303);
  response.cookies.set(
    BUNGIE_SESSION_COOKIE,
    "",
    getExpiredBungieCookieOptions(),
  );

  return response;
}
