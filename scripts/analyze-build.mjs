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

function githubActionsEscape(value) {
  return value
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
}

function warn(message) {
  warnings.push(message);
  if (process.env.GITHUB_ACTIONS === "true") {
    console.warn(`::warning title=Bundle budget::${githubActionsEscape(message)}`);
  }
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function checkByteBudget({ label, value, max, near, format }) {
  if (value > max) {
    const overage = value - max;

    if (overage <= near) {
      warn(`${label} is slightly over budget: ${format(value)} / ${format(max)}; over by ${format(overage)}.`);
    } else {
      fail(`${label} is ${format(value)}; budget is ${format(max)}.`);
    }
    return;
  }

  if (max - value <= near) {
    warn(`${label} is near budget: ${format(value)} / ${format(max)}.`);
  }
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

function collectFilesBySuffix(dirPath, suffix) {
  if (!existsSync(dirPath)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFilesBySuffix(absolutePath, suffix));
    } else if (entry.name.endsWith(suffix)) {
      files.push(absolutePath);
    }
  }
  return files;
}

function traceFileSize(tracePath, tracedFile) {
  try {
    return statSync(path.resolve(path.dirname(tracePath), tracedFile)).size;
  } catch {
    return 0;
  }
}

const staticChunkDir = path.join(root, ".next", "static", "chunks");
const routeStatsPath = path.join(root, ".next", "diagnostics", "route-bundle-stats.json");
const serverAppDir = path.join(root, ".next", "server", "app");

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

  checkByteBudget({
    label: "Static JS total",
    value: totalRawBytes,
    max: budget.maxTotalStaticJsKb * 1024,
    near: budget.nearBudgetKb * 1024,
    format: formatKb,
  });

  if (largestChunk) {
    checkByteBudget({
      label: "Largest JS chunk",
      value: largestChunk.rawBytes,
      max: budget.maxLargestChunkKb * 1024,
      near: budget.nearBudgetKb * 1024,
      format: formatKb,
    });
  }

  const routeStats = JSON.parse(readFileSync(routeStatsPath, "utf8"));
  const largestRoute = routeStats.toSorted((a, b) => b.firstLoadUncompressedJsBytes - a.firstLoadUncompressedJsBytes)[0];
  if (largestRoute) {
    console.log(`[bundle] Largest route first-load JS: ${formatKb(largestRoute.firstLoadUncompressedJsBytes)} (${largestRoute.route})`);
    checkByteBudget({
      label: "Largest route first-load JS",
      value: largestRoute.firstLoadUncompressedJsBytes,
      max: budget.maxRouteFirstLoadKb * 1024,
      near: budget.nearBudgetKb * 1024,
      format: formatKb,
    });
  }

  const traceFiles = collectFilesBySuffix(serverAppDir, ".nft.json");
  const serverTraces = traceFiles.map((tracePath) => {
    const trace = JSON.parse(readFileSync(tracePath, "utf8"));
    const tracedFiles = trace.files ?? [];
    const byteSize = tracedFiles.reduce((sum, tracedFile) => sum + traceFileSize(tracePath, tracedFile), 0);
    return {
      file: path.relative(root, tracePath),
      byteSize,
      bannedFiles: tracedFiles.filter((tracedFile) =>
        (budget.bannedServerTracePatterns ?? []).some((pattern) => tracedFile.includes(pattern)),
      ),
    };
  });

  const largestTrace = serverTraces.toSorted((a, b) => b.byteSize - a.byteSize)[0];
  if (largestTrace) {
    console.log(`[bundle] Largest server trace: ${formatMb(largestTrace.byteSize)} (${largestTrace.file})`);
    const maxServerTraceBytes = budget.maxServerTraceMb * 1024 * 1024;
    const nearServerTraceBytes = budget.nearServerTraceMb * 1024 * 1024;
    checkByteBudget({
      label: "Largest server trace",
      value: largestTrace.byteSize,
      max: maxServerTraceBytes,
      near: nearServerTraceBytes,
      format: formatMb,
    });
  }

  for (const serverTrace of serverTraces) {
    if (serverTrace.bannedFiles.length === 0) {
      continue;
    }

    fail(`${serverTrace.file} traces disallowed deploy assets: ${serverTrace.bannedFiles.slice(0, 5).join(", ")}${serverTrace.bannedFiles.length > 5 ? "..." : ""}`);
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
