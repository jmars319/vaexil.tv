import { isAdminAuthenticated } from "@/lib/admin";
import { readReconAsset } from "@/lib/recon-asset-storage";
import { getReconAssetById } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ReconAssetRouteContext = {
  params: Promise<{ assetId: string }>;
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

  try {
    const assetObject = await readReconAsset(asset.path);
    const body = new ArrayBuffer(assetObject.body.byteLength);
    new Uint8Array(body).set(assetObject.body);

    return new Response(body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": assetObject.contentType,
        "X-Recon-Asset-Store": assetObject.source,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
