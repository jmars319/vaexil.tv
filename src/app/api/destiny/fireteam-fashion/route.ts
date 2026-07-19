import { getDestinyFashionPayload } from "@/lib/bungie-client";
import { canViewDestinyGuides } from "@/lib/destiny-guide-access";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readOptionalNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  if (!(await canViewDestinyGuides())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const bungieName = url.searchParams.get("bungieName")?.trim() ?? "";
  const platform = readOptionalNumber(url.searchParams.get("platform"));

  if (!bungieName) {
    return NextResponse.json(
      { error: "Enter a Bungie name in Name#0000 format." },
      { status: 400 },
    );
  }

  try {
    const payload = await getDestinyFashionPayload(bungieName, platform);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Bungie data.";
    const status = message.includes("BUNGIE_API_KEY") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
