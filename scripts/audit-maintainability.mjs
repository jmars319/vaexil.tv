import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readdir, readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const updateSnapshots = process.argv.includes("--update-snapshots");
const configPath = path.join(root, "scripts", "maintainability.config.json");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

const config = readJson(configPath);
const failures = [];
const warnings = [];

function reportFailure(message) {
  failures.push(message);
}

function reportWarning(message) {
  warnings.push(message);
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function gitLsFiles() {
  return execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const trackedFiles = gitLsFiles();

function isUnderAnyRoot(filePath, roots) {
  return roots.some((sourceRoot) => {
    if (filePath === sourceRoot) {
      return true;
    }
    return filePath.startsWith(`${sourceRoot}/`);
  });
}

function globToRegex(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "<<<GLOBSTAR>>>")
    .replace(/\*/g, "[^/]*")
    .replace(/<<<GLOBSTAR>>>/g, ".*");
  return new RegExp(`^${escaped}$`);
}

const generatedArtifactRegexes = config.generatedArtifactPatterns.map(globToRegex);

for (const filePath of trackedFiles) {
  if (
    existsSync(path.join(root, filePath)) &&
    generatedArtifactRegexes.some((pattern) => pattern.test(filePath))
  ) {
    reportFailure(`Generated/runtime artifact is tracked: ${filePath}`);
  }
}

function lineBudgetFor(filePath) {
  if (filePath.endsWith(".css")) {
    return config.maxStyleFileLines;
  }
  if (filePath.endsWith(".md")) {
    return config.maxDocFileLines;
  }
  if (filePath.startsWith("scripts/")) {
    return config.maxScriptFileLines;
  }
  if (/\.(ts|tsx|js|mjs|cjs)$/.test(filePath)) {
    return config.maxImplementationFileLines;
  }
  return null;
}

for (const filePath of trackedFiles) {
  if (!isUnderAnyRoot(filePath, config.sourceRoots)) {
    continue;
  }

  const budget = lineBudgetFor(filePath);
  if (!budget) {
    continue;
  }

  const absolutePath = path.join(root, filePath);
  const lineCount = readFileSync(absolutePath, "utf8").split("\n").length;
  if (lineCount > budget) {
    reportFailure(`${filePath} has ${lineCount} lines; budget is ${budget}.`);
  } else if (budget - lineCount <= config.nearBudgetLineWindow) {
    reportWarning(`${filePath} is near its line budget: ${lineCount}/${budget}.`);
  }
}

const bannedImportPatterns = [
  /from\s+["'][^"']*(?:node_modules|\.next|dist|build|coverage)\//,
  /import\(["'][^"']*(?:node_modules|\.next|dist|build|coverage)\//,
  /require\(["'][^"']*(?:node_modules|\.next|dist|build|coverage)\//,
];

for (const filePath of trackedFiles) {
  if (!isUnderAnyRoot(filePath, config.sourceRoots) || !/\.(ts|tsx|js|mjs|cjs)$/.test(filePath)) {
    continue;
  }

  const source = readFileSync(path.join(root, filePath), "utf8");
  if (bannedImportPatterns.some((pattern) => pattern.test(source))) {
    reportFailure(`${filePath} imports from generated, dependency, or build output paths.`);
  }
}

async function walk(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...await walk(absolutePath));
    } else {
      results.push(absolutePath);
    }
  }
  return results;
}

function routeFromAppFile(appDir, filePath) {
  const relative = normalizePath(path.relative(appDir, filePath));
  const withoutFile = relative
    .replace(/(?:^|\/)(?:page|route)\.(?:ts|tsx|js|jsx)$/, "")
    .replace(/\/$/, "");
  const segments = withoutFile
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("("));
  const route = `/${segments.join("/")}`.replace(/\/$/, "");
  return route || "/";
}

async function collectRoutes() {
  const appDir = path.join(root, config.appDir);
  const files = await walk(appDir);
  const routes = [];

  for (const filePath of files) {
    const relative = normalizePath(path.relative(appDir, filePath));
    const metadataRoutes = new Map([
      ["favicon.ico", "/favicon.ico"],
      ["manifest.ts", "/manifest.webmanifest"],
      ["robots.ts", "/robots.txt"],
      ["sitemap.ts", "/sitemap.xml"],
    ]);

    if (metadataRoutes.has(relative)) {
      routes.push({
        route: metadataRoutes.get(relative),
        kind: "metadata",
        methods: ["GET"],
      });
      continue;
    }

    if (!/(?:page|route)\.(?:ts|tsx|js|jsx)$/.test(filePath)) {
      continue;
    }

    const route = routeFromAppFile(appDir, filePath);
    const isApiRoute = /\/route\.(?:ts|tsx|js|jsx)$/.test(normalizePath(filePath));
    let methods = ["PAGE"];
    if (isApiRoute) {
      const source = await readFile(filePath, "utf8");
      methods = Array.from(source.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g))
        .map((match) => match[1])
        .sort();
      if (methods.length === 0) {
        methods = ["ROUTE"];
      }
    }

    routes.push({
      route,
      kind: isApiRoute ? "route" : "page",
      methods,
    });
  }

  return routes.sort((a, b) => `${a.route}:${a.kind}`.localeCompare(`${b.route}:${b.kind}`));
}

function collectEnvKeys() {
  const envExamplePath = path.join(root, ".env.example");
  if (!existsSync(envExamplePath)) {
    return [];
  }

  return readFileSync(envExamplePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0].trim())
    .filter(Boolean)
    .sort();
}

function compareSnapshot(label, actual, snapshotPath) {
  const serialized = `${JSON.stringify(actual, null, 2)}\n`;
  if (updateSnapshots) {
    writeFileSync(snapshotPath, serialized);
    return;
  }

  if (!existsSync(snapshotPath)) {
    reportFailure(`${label} snapshot is missing: ${normalizePath(path.relative(root, snapshotPath))}`);
    return;
  }

  const expected = readFileSync(snapshotPath, "utf8");
  if (expected !== serialized) {
    reportFailure(`${label} snapshot drifted. Run audit with --update-snapshots only for intentional public-surface changes.`);
  }
}

async function checkSnapshots() {
  const contractsDir = path.join(root, "scripts", "contracts");
  if (updateSnapshots) {
    await mkdir(contractsDir, { recursive: true });
  }

  compareSnapshot("Next route/API", await collectRoutes(), path.join(contractsDir, "next-routes.json"));
  compareSnapshot("Environment key", collectEnvKeys(), path.join(contractsDir, "env-keys.json"));
}

function checkWorkflowHygiene() {
  const workflowFiles = trackedFiles.filter((filePath) => filePath.startsWith(".github/workflows/") && filePath.endsWith(".yml"));
  for (const filePath of workflowFiles) {
    const source = readFileSync(path.join(root, filePath), "utf8");
    if (!/timeout-minutes:\s*\d+/.test(source)) {
      reportFailure(`${filePath} is missing an explicit timeout-minutes value.`);
    }
    if (/actions\/checkout@v[1-5]\b/.test(source)) {
      reportFailure(`${filePath} uses an outdated checkout action.`);
    }
  }
}

async function checkAssets() {
  const assetRoots = config.assetRoots ?? [];
  const assetExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf"]);
  for (const filePath of trackedFiles) {
    if (!isUnderAnyRoot(filePath, assetRoots) || !assetExtensions.has(path.extname(filePath).toLowerCase())) {
      continue;
    }

    const fileStat = await stat(path.join(root, filePath));
    if (fileStat.size > config.maxAssetBytes) {
      reportFailure(`${filePath} is ${(fileStat.size / 1024).toFixed(1)} KiB; asset budget is ${(config.maxAssetBytes / 1024).toFixed(1)} KiB.`);
    } else if (config.nearAssetBytes && config.maxAssetBytes - fileStat.size <= config.nearAssetBytes) {
      reportWarning(`${filePath} is near the asset budget: ${(fileStat.size / 1024).toFixed(1)} KiB.`);
    }
  }
}

await checkSnapshots();
checkWorkflowHygiene();
await checkAssets();

if (warnings.length > 0) {
  for (const warning of warnings) {
    console.warn(`[maintainability:warn] ${warning}`);
  }
  if (strict || config.failOnWarnings) {
    reportFailure("Maintainability warnings are treated as failures.");
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[maintainability:fail] ${failure}`);
  }
  process.exit(1);
}

console.log("[maintainability] Audit passed");
