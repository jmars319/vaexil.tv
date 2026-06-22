import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const today = new Date().toISOString().slice(0, 10);

// Scratch output boundary
const outputRoot =
  process.env.RECON_VISUAL_REVIEW_DIR ||
  join(tmpdir(), `vaexil-recon-visual-cross-check-${today}`);
const referencesDir = join(outputRoot, "references");
const sheetsDir = join(outputRoot, "sheets");
const tileDir = join(outputRoot, "sniperelite5maps-tiles");
const includeSniperElite5Maps = !process.argv.includes("--no-sniperelite5maps");

// External reference contract
const se5MapsSlugs = new Map([
  ["se5-atlantic-wall", "m01-the-atlantic-wall"],
  ["se5-occupied-residence", "m02-occupied-residence"],
  ["se5-spy-academy", "m03-spy-academy"],
  ["se5-war-factory", "m04-war-factory"],
  ["se5-festung-guernsey", "m05-festung-guernsey"],
  ["se5-liberation", "m06-liberation"],
  ["se5-secret-weapons", ["m07", "secret", "weapons"].join("-")],
  ["se5-rubble-and-ruin", "m08-rubble-and-ruin"],
  ["se5-wolf-mountain", "dlc1-wolf-mountain"],
  ["se5-landing-force", "dlc2-landing-force"],
  ["se5-conqueror", "dlc3-conqueror"],
  ["se5-rough-landing", "dlc4-rough-landing"],
  ["se5-kraken-awakes", "dlc5-kraken-awakes"],
]);

const exputerSe5Images = new Map([
  [
    "se5-atlantic-wall",
    "https://exputer.com/wp-content/uploads/2022/06/The-Atlantic-Wall-Map-Sniper-Elite-5.png",
  ],
  [
    "se5-occupied-residence",
    "https://exputer.com/wp-content/uploads/2022/06/Occupied-Residence-Map-Sniper-Elite-5.png",
  ],
  [
    "se5-spy-academy",
    "https://exputer.com/wp-content/uploads/2022/06/Spy-Academy-Sniper-Elite-5-Map.png",
  ],
  [
    "se5-war-factory",
    "https://exputer.com/wp-content/uploads/2022/06/Sniper-Elite-5-War-Factory-Map.png",
  ],
  [
    "se5-festung-guernsey",
    "https://exputer.com/wp-content/uploads/2022/06/Festung-Guernsey-Map-Sniper-Elite-5.png",
  ],
  [
    "se5-liberation",
    "https://exputer.com/wp-content/uploads/2022/06/Liberation-Map-Sniper-Elite-5.png",
  ],
  [
    "se5-secret-weapons",
    "https://exputer.com/wp-content/uploads/2022/06/Secret-weapons-map-in-sniper-elite-5.png",
  ],
  [
    "se5-rubble-and-ruin",
    "https://exputer.com/wp-content/uploads/2022/06/Rubble-and-Ruin-Map-Sniper-Elite-5.png",
  ],
  [
    "se5-wolf-mountain",
    "https://exputer.com/wp-content/uploads/2022/06/Wolf-Mountain-Map-Sniper-Elite-5.png",
  ],
]);

const mapMasterSerIds = new Map([
  ["ser-behind-enemy-lines", 228],
  ["ser-dead-drop", 229],
  ["ser-sonderzuge-sabotage", 230],
  ["ser-collision-course", 231],
  ["ser-devils-cauldron", 232],
  ["ser-assault-on-fort-rouge", 233],
  ["ser-lock-stock-and-barrels", 234],
  ["ser-end-of-the-line", 235],
  ["ser-all-or-nothing", 236],
  ["ser-lights-camera-achtung", 237],
  ["ser-vercors-vendetta", 279],
  ["ser-striking-range", 354],
]);

// JSON file boundary
async function readJson(path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      "user-agent": "Vaexil Recon private visual review pack",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Reference download boundary
async function downloadReference(mapId, label, url, extension) {
  const fileName = `${mapId}-${slugify(label)}${extension}`;
  const target = join(referencesDir, fileName);
  const buffer = await fetchBuffer(url);
  await writeFile(target, buffer);
  return {
    label,
    url,
    path: target,
    relativePath: `references/${fileName}`,
  };
}

function hasMagick() {
  return spawnSync("magick", ["-version"], { stdio: "ignore" }).status === 0;
}

// SE5 tile stitch workflow
async function buildSniperElite5MapsReference(mapId, slug) {
  if (!includeSniperElite5Maps || !hasMagick()) return null;

  const sourceUrl = `https://sniperelite5maps.de/scripts/mapdata/${slug}.js`;
  const js = (await fetchBuffer(sourceUrl)).toString("utf8");
  const tilePath = js.match(/tilePath:\s*['"]([^'"]+)['"]/)?.[1];
  const minZoom = Number(js.match(/minZoom:\s*(\d+)/)?.[1] || 1);
  const neutralZoom = Number(js.match(/neutralZoom:\s*(\d+)/)?.[1] || 4);
  const dimensions = js
    .match(/dimensions:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/)
    ?.slice(1)
    .map(Number);

  if (!tilePath || !dimensions) {
    throw new Error(`Could not parse SniperElite5Maps metadata for ${mapId}`);
  }

  const zoom = Math.max(minZoom, neutralZoom - 2);
  const scale = 2 ** (neutralZoom - zoom);
  const width = Math.ceil(dimensions[0] / scale);
  const height = Math.ceil(dimensions[1] / scale);
  const cols = Math.ceil(width / 256);
  const rows = Math.ceil(height / 256);
  const mapTileDir = join(tileDir, mapId);
  await mkdir(mapTileDir, { recursive: true });

  const tileJobs = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const relative = tilePath
        .replace("{z}", String(zoom))
        .replace("{x}", String(x))
        .replace("{y}", String(y));
      const url = `https://sniperelite5maps.de/${relative}`;
      const target = join(mapTileDir, `${y}-${x}.png`);
      tileJobs.push({ target, url });
    }
  }

  const tilePaths = [];
  for (let index = 0; index < tileJobs.length; index += 8) {
    const batch = tileJobs.slice(index, index + 8);
    const downloaded = await Promise.all(
      batch.map(async (job) => {
        await writeFile(job.target, await fetchBuffer(job.url));
        return job.target;
      }),
    );
    tilePaths.push(...downloaded);
  }

  const stitched = join(referencesDir, `${mapId}-sniperelite5maps-reference.png`);
  const raw = join(mapTileDir, `${mapId}-stitched-raw.png`);
  const montage = spawnSync(
    "magick",
    [
      "montage",
      ...tilePaths,
      "-tile",
      `${cols}x${rows}`,
      "-geometry",
      "+0+0",
      raw,
    ],
    { stdio: "inherit" },
  );
  if (montage.status !== 0) {
    throw new Error(`ImageMagick montage failed for ${mapId}`);
  }

  const crop = spawnSync(
    "magick",
    [raw, "-crop", `${width}x${height}+0+0`, "+repage", stitched],
    { stdio: "inherit" },
  );
  if (crop.status !== 0) {
    throw new Error(`ImageMagick crop failed for ${mapId}`);
  }

  return {
    label: "SniperElite5Maps stitched scratch reference",
    url: "https://sniperelite5maps.de/",
    path: stitched,
    relativePath: `references/${basename(stitched)}`,
  };
}

// Contact sheet workflow
async function createSheet(mapId, references) {
  if (!hasMagick() || references.length < 2) return null;

  const target = join(sheetsDir, `${mapId}-visual-review.jpg`);
  const result = spawnSync(
    "magick",
    [
      "montage",
      ...references.map((item) => item.path),
      "-thumbnail",
      "900x900",
      "-tile",
      `${references.length}x1`,
      "-geometry",
      "+16+16",
      "-background",
      "#0f172a",
      "-bordercolor",
      "#0f172a",
      target,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    return null;
  }

  return {
    path: target,
    relativePath: `sheets/${basename(target)}`,
  };
}

// Private source asset boundary
function localSourceAssetFor(mapId, assets) {
  return assets.find(
    (asset) =>
      asset.mapId === mapId &&
      asset.imported &&
      asset.visibility === "private" &&
      asset.path.includes("guides4gamers-surface"),
  );
}

// Review pack workflow
async function main() {
  await mkdir(referencesDir, { recursive: true });
  await mkdir(sheetsDir, { recursive: true });

  const [maps, assets, sourceCrossChecks] = await Promise.all([
    readJson("src/data/recon/maps.json"),
    readJson("src/data/recon/asset-manifest.json"),
    readJson("src/data/recon/source-cross-checks.json"),
  ]);
  const checksByMapId = new Map(sourceCrossChecks.map((check) => [check.mapId, check]));

  const records = [];
  for (const map of maps.filter((item) =>
    ["sniper-elite-5", "sniper-elite-resistance"].includes(item.gameId),
  )) {
    console.log(`Preparing visual review pack for ${map.id}`);
    const references = [];
    const localAsset = localSourceAssetFor(map.id, assets);
    if (localAsset) {
      const extension = extname(localAsset.path) || ".jpg";
      const fileName = `${map.id}-vaexil-private-source${extension}`;
      const target = join(referencesDir, fileName);
      await copyFile(join(root, localAsset.path), target);
      references.push({
        label: "Vaexil private Guides4Gamers source plate",
        url: localAsset.sourceUrl,
        path: target,
        relativePath: `references/${fileName}`,
      });
    }

    if (exputerSe5Images.has(map.id)) {
      references.push(
        await downloadReference(
          map.id,
          "eXputer secondary map image",
          exputerSe5Images.get(map.id),
          ".png",
        ),
      );
    }

    if (se5MapsSlugs.has(map.id)) {
      const stitched = await buildSniperElite5MapsReference(
        map.id,
        se5MapsSlugs.get(map.id),
      );
      if (stitched) references.push(stitched);
    }

    if (mapMasterSerIds.has(map.id)) {
      const mapMasterId = mapMasterSerIds.get(map.id);
      references.push(
        await downloadReference(
          map.id,
          "MapMaster secondary map image",
          `https://mapmaster.io/storage/games_v2/36/maps/${mapMasterId}/logo.webp`,
          ".webp",
        ),
      );
    }

    const sheet = await createSheet(map.id, references);
    const check = checksByMapId.get(map.id);
    records.push({
      mapId: map.id,
      title: map.title,
      gameId: map.gameId,
      sourceCheckStatus: check?.status || "missing",
      visualReviewStatus: check?.visualReview?.status || "missing",
      visualReviewSummary: check?.visualReview?.summary || "",
      references: references.map((item) => ({
        label: item.label,
        url: item.url,
        path: item.relativePath,
      })),
      sheet: sheet?.relativePath || null,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    outputRoot,
    note:
      "Scratch-only Vaexil Recon visual review pack. Do not commit copied third-party images or derived contact sheets.",
    records,
  };
  await writeFile(join(outputRoot, "SUMMARY.json"), `${JSON.stringify(summary, null, 2)}\n`);

  const lines = [
    "# Vaexil Recon Visual Cross-Check Scratch Pack",
    "",
    "This directory is scratch-only. It may contain copied third-party map images used for private visual comparison. Do not commit these files or publish them.",
    "",
    "| Map | Source status | Visual status | References | Sheet |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const record of records) {
    const refs = record.references
      .map((reference) => `[${reference.label}](${reference.path})`)
      .join("<br>");
    const sheet = record.sheet ? `[sheet](${record.sheet})` : "n/a";
    lines.push(
      `| ${record.title} | ${record.sourceCheckStatus} | ${record.visualReviewStatus} | ${refs} | ${sheet} |`,
    );
  }

  await writeFile(join(outputRoot, "INDEX.md"), `${lines.join("\n")}\n`);

  console.log(`Wrote Recon visual review scratch pack to ${outputRoot}`);
}

await main();
