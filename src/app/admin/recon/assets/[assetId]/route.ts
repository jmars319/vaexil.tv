import { isAdminAuthenticated } from "@/lib/admin";
import { getReconAssetById } from "@/lib/repository";
import { readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ReconAssetRouteContext = {
  params: Promise<{ assetId: string }>;
};

const contentTypes: Record<string, string> = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(_request: Request, context: ReconAssetRouteContext) {
  if (!(await isAdminAuthenticated())) {
    return new Response("Not found", { status: 404 });
  }

  const { assetId } = await context.params;
  const asset = await getReconAssetById(assetId);
  if (!asset || asset.visibility !== "private") {
    return new Response("Not found", { status: 404 });
  }

  if (!asset.path.startsWith("private/recon/")) {
    return new Response("Not found", { status: 404 });
  }

  const privateRoot = resolve(process.cwd(), "private", "recon");
  const assetPath = resolve(
    privateRoot,
    asset.path.replace(/^private\/recon\//, ""),
  );
  const relativeAssetPath = relative(privateRoot, assetPath);

  if (
    relativeAssetPath.startsWith("..") ||
    relativeAssetPath.includes(`..${sep}`)
  ) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(assetPath);
    return new Response(file, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          contentTypes[extname(assetPath).toLowerCase()] ||
          "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
