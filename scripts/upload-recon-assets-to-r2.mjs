import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, join, relative, sep } from "node:path";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const verify = args.has("--verify");
const force = args.has("--force");
const localPrefix = "private/recon/";
const repoRoot = process.cwd();

function parseEnvLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!match) {
    return null;
  }

  const [, key, rawValue] = match;
  const value = rawValue
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\n/g, "\n");

  return [key, value];
}

async function loadEnvFile(path) {
  try {
    const content = await readFile(path, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;

      const [key, value] = parsed;
      process.env[key] ||= value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

function contentTypeForKey(key) {
  switch (extname(key).toLowerCase()) {
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

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for Recon R2 uploads.`);
  }

  return value;
}

function normalizePrefix(prefix) {
  const trimmed = prefix.trim().replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "" : `${trimmed}/`;
}

await loadEnvFile(join(repoRoot, ".env.local"));
await loadEnvFile(join(homedir(), ".config", "jamarq", "cloudflare.env"));

const bucket = process.env.R2_PRIVATE_BUCKET || requiredEnv("R2_BUCKET");
const r2KeyPrefix = normalizePrefix(
  process.env.R2_RECON_KEY_PREFIX || (process.env.R2_PRIVATE_BUCKET ? "recon/" : ""),
);
const endpoint =
  process.env.R2_ENDPOINT ||
  `https://${requiredEnv("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`;
const client = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
  },
});

const localRoot = join(repoRoot, "private", "recon");
const files = await walk(localRoot);
const summary = {
  scanned: 0,
  uploaded: 0,
  skipped: 0,
  verified: 0,
  dryRunUploads: 0,
};

for (const file of files) {
  const key = relative(repoRoot, file).split(sep).join("/");
  if (!key.startsWith(localPrefix)) {
    continue;
  }
  const r2Key = `${r2KeyPrefix}${key}`;

  summary.scanned += 1;
  const fileStat = await stat(file);
  let existing = null;

  try {
    existing = await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: r2Key,
      }),
    );
  } catch (error) {
    if (
      error?.$metadata?.httpStatusCode !== 404 &&
      error?.name !== "NotFound"
    ) {
      throw error;
    }
  }

  const unchanged =
    !force && existing && Number(existing.ContentLength) === fileStat.size;

  if (unchanged) {
    summary.skipped += 1;
  } else if (!write) {
    summary.dryRunUploads += 1;
  } else {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: r2Key,
        Body: createReadStream(file),
        ContentType: contentTypeForKey(key),
      }),
    );
    summary.uploaded += 1;
  }

  if (verify && (write || unchanged)) {
    const read = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: r2Key,
        Range: "bytes=0-15",
      }),
    );
    if (!read.Body) {
      throw new Error(`R2 verification read returned no body for ${key}.`);
    }
    await read.Body.transformToByteArray();
    summary.verified += 1;
  }
}

console.log(
  [
    `Recon R2 asset upload ${write ? "completed" : "dry run completed"}.`,
    `Bucket: ${bucket}`,
    `R2 key prefix: ${r2KeyPrefix || "(none)"}`,
    `Scanned: ${summary.scanned}`,
    `Uploaded: ${summary.uploaded}`,
    `Skipped unchanged: ${summary.skipped}`,
    `Would upload: ${summary.dryRunUploads}`,
    `Verified reads: ${summary.verified}`,
  ].join("\n"),
);
