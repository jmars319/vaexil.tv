import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";

const reconAssetPrefixes = ["private/recon/", "public/recon/"] as const;

type ReconAssetStore = "local" | "r2";

type ReconAssetRead = {
  body: Uint8Array;
  contentType: string;
  source: ReconAssetStore;
};

let r2Client: S3Client | null = null;

export function getReconAssetContentType(path: string) {
  const extension = extname(path).toLowerCase();

  switch (extension) {
    case ".svg":
      return "image/svg+xml; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function isReconAssetKey(path: string) {
  return (
    !path.startsWith("/") &&
    !path.split("/").includes("..") &&
    reconAssetPrefixes.some((prefix) => path.startsWith(prefix))
  );
}

function assertReconAssetKey(path: string) {
  if (!isReconAssetKey(path)) {
    throw new Error("Invalid Recon asset key.");
  }
}

function getStoreMode(): ReconAssetStore {
  return process.env.RECON_ASSET_STORE === "r2" ? "r2" : "local";
}

function getR2Client() {
  const endpoint =
    process.env.R2_ENDPOINT ||
    (process.env.CLOUDFLARE_ACCOUNT_ID
      ? `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : "");
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 asset storage is missing endpoint or credentials.");
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2Client;
}

async function readFromR2(path: string): Promise<ReconAssetRead> {
  const bucket = process.env.R2_BUCKET;

  if (!bucket) {
    throw new Error("R2_BUCKET is required for R2 asset storage.");
  }

  const result = await getR2Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: path,
    }),
  );

  if (!result.Body) {
    throw new Error("R2 asset object did not include a response body.");
  }

  const body = await result.Body.transformToByteArray();

  return {
    body,
    contentType: result.ContentType || getReconAssetContentType(path),
    source: "r2",
  };
}

async function readFromLocal(path: string): Promise<ReconAssetRead> {
  const localRoot = path.startsWith("private/recon/")
    ? resolve(process.cwd(), "private", "recon")
    : resolve(process.cwd(), "public", "recon");
  const localPath = path.replace(/^private\/recon\/|^public\/recon\//, "");
  const absolutePath = resolve(localRoot, localPath);
  const relativePath = relative(localRoot, absolutePath);

  if (
    relativePath.startsWith("..") ||
    relativePath === "" ||
    relativePath.split(sep).includes("..")
  ) {
    throw new Error("Recon asset path escaped the project directory.");
  }

  return {
    body: await readFile(absolutePath),
    contentType: getReconAssetContentType(path),
    source: "local",
  };
}

export async function readReconAsset(path: string) {
  assertReconAssetKey(path);

  if (getStoreMode() !== "r2") {
    return readFromLocal(path);
  }

  try {
    return await readFromR2(path);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    return readFromLocal(path);
  }
}
