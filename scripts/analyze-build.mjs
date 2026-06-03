import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "scripts", "maintainability.config.json"), "utf8"));
const budget = config.bundleBudget;
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function collectJsFiles(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(absolutePath));
    } else if (entry.name.endsWith(".js")) {
      files.push(absolutePath);
    }
  }
  return files;
}

const staticChunkDir = path.join(root, ".next", "static", "chunks");
const routeStatsPath = path.join(root, ".next", "diagnostics", "route-bundle-stats.json");

if (!existsSync(staticChunkDir) || !existsSync(routeStatsPath)) {
  fail("Built Next assets were not found. Run `npm run build` before `npm run budget:bundle`.");
} else {
  const chunks = collectJsFiles(staticChunkDir).map((filePath) => {
    const source = readFileSync(filePath);
    return {
      file: path.relative(root, filePath),
      rawBytes: statSync(filePath).size,
      gzipBytes: gzipSync(source).length,
    };
  });

  const largestChunk = chunks.toSorted((a, b) => b.rawBytes - a.rawBytes)[0];
  const totalRawBytes = chunks.reduce((sum, chunk) => sum + chunk.rawBytes, 0);
  const totalGzipBytes = chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0);

  console.log(`[bundle] Static JS total: ${formatKb(totalRawBytes)} raw / ${formatKb(totalGzipBytes)} gzip`);
  if (largestChunk) {
    console.log(`[bundle] Largest JS chunk: ${formatKb(largestChunk.rawBytes)} raw / ${formatKb(largestChunk.gzipBytes)} gzip (${largestChunk.file})`);
  }

  if (totalRawBytes > budget.maxTotalStaticJsKb * 1024) {
    fail(`Static JS total is ${formatKb(totalRawBytes)}; budget is ${budget.maxTotalStaticJsKb.toFixed(2)} KiB.`);
  } else if ((budget.maxTotalStaticJsKb * 1024) - totalRawBytes <= budget.nearBudgetKb * 1024) {
    warn(`Static JS total is near budget: ${formatKb(totalRawBytes)} / ${budget.maxTotalStaticJsKb.toFixed(2)} KiB.`);
  }

  if (largestChunk && largestChunk.rawBytes > budget.maxLargestChunkKb * 1024) {
    fail(`Largest JS chunk is ${formatKb(largestChunk.rawBytes)}; budget is ${budget.maxLargestChunkKb.toFixed(2)} KiB.`);
  } else if (largestChunk && (budget.maxLargestChunkKb * 1024) - largestChunk.rawBytes <= budget.nearBudgetKb * 1024) {
    warn(`Largest JS chunk is near budget: ${formatKb(largestChunk.rawBytes)} / ${budget.maxLargestChunkKb.toFixed(2)} KiB.`);
  }

  const routeStats = JSON.parse(readFileSync(routeStatsPath, "utf8"));
  const largestRoute = routeStats.toSorted((a, b) => b.firstLoadUncompressedJsBytes - a.firstLoadUncompressedJsBytes)[0];
  if (largestRoute) {
    console.log(`[bundle] Largest route first-load JS: ${formatKb(largestRoute.firstLoadUncompressedJsBytes)} (${largestRoute.route})`);
    if (largestRoute.firstLoadUncompressedJsBytes > budget.maxRouteFirstLoadKb * 1024) {
      fail(`Largest route first-load JS is ${formatKb(largestRoute.firstLoadUncompressedJsBytes)}; budget is ${budget.maxRouteFirstLoadKb.toFixed(2)} KiB.`);
    } else if ((budget.maxRouteFirstLoadKb * 1024) - largestRoute.firstLoadUncompressedJsBytes <= budget.nearBudgetKb * 1024) {
      warn(`Largest route first-load JS is near budget: ${formatKb(largestRoute.firstLoadUncompressedJsBytes)} / ${budget.maxRouteFirstLoadKb.toFixed(2)} KiB.`);
    }
  }
}

for (const warning of warnings) {
  console.warn(`[bundle:warn] ${warning}`);
}

if (warnings.length > 0 && budget.failOnWarnings) {
  fail("Bundle warnings are treated as failures.");
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[bundle:fail] ${failure}`);
  }
  process.exit(1);
}

console.log("[bundle] Budget passed");
