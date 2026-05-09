import { recordPageView } from "@/lib/repository";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path : "";
    const referrer = typeof body.referrer === "string" ? body.referrer : "";

    await recordPageView({ path, referrer });
  } catch (error) {
    console.error("Vaexil analytics endpoint failed.", error);
  }

  return NextResponse.json({ ok: true });
}
