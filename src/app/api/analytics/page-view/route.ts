import { recordPageView } from "@/lib/repository";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 2_000;

function readContentLength(request: Request) {
  const value = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(value) ? value : 0;
}

function cleanPath(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const path = value.trim().slice(0, 500);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\0")) {
    return "";
  }

  return path;
}

function cleanReferrer(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 500) : "";
}

export async function POST(request: Request) {
  try {
    if (readContentLength(request) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const path = cleanPath(body.path);
    const referrer = cleanReferrer(body.referrer);

    if (path) {
      await recordPageView({ path, referrer });
    }
  } catch (error) {
    console.error("Vaexil analytics endpoint failed.", error);
  }

  return NextResponse.json({ ok: true });
}
