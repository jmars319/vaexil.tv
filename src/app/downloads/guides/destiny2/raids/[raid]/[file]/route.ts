import { canViewDestinyGuides } from "@/lib/destiny-guide-access";
import { destinyGuidesArePublic } from "@/lib/destiny-guide-visibility";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DownloadRouteContext = {
  params: Promise<{
    raid: string;
    file: string;
  }>;
};

const allowedDownloads = new Set([
  "desert-perpetual-epic/desert-perpetual-epic-complete-guide.pdf",
  "desert-perpetual-normal/desert-perpetual-normal-complete-guide.pdf",
  "last-wish/last-wish-complete-guide.pdf",
  "salvations-edge/salvations-edge-complete-guide.pdf",
]);

function notFoundResponse() {
  return new Response("Not found", { status: 404 });
}

export async function GET(_request: Request, context: DownloadRouteContext) {
  const { raid, file } = await context.params;
  const downloadKey = `${raid}/${file}`;

  if (!allowedDownloads.has(downloadKey) || !(await canViewDestinyGuides())) {
    return notFoundResponse();
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "content/downloads/guides/destiny2/raids",
      raid,
      file,
    );
    const fileBuffer = await readFile(filePath);
    const body = new ArrayBuffer(fileBuffer.byteLength);
    new Uint8Array(body).set(fileBuffer);

    return new Response(body, {
      headers: {
        "Cache-Control": destinyGuidesArePublic()
          ? "public, max-age=3600"
          : "private, no-store",
        "Content-Disposition": `attachment; filename="${file}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch {
    return notFoundResponse();
  }
}
