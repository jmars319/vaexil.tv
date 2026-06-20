import { readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

import { getReconAssetContentType } from "@/lib/recon-asset-storage";

function reconLocalRoot(path: string) {
  const rootSegments = path.startsWith("private/recon/")
    ? ["private", "recon"]
    : ["public", "recon"];

  return resolve(/* turbopackIgnore: true */ process.cwd(), ...rootSegments);
}

export async function readReconAssetFromLocal(path: string) {
  const localRoot = reconLocalRoot(path);
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
    source: "local" as const,
  };
}
