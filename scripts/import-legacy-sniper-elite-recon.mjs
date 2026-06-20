import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const writeMode = process.argv.includes("--write");
const lastReviewed = "2026-06-05";

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, root), "utf8"));
}

async function writeJson(path, value) {
  const formatted = `${JSON.stringify(value, null, 2)}\n`;
  if (!writeMode) {
    console.log(`[dry-run] would write ${path}`);
    return;
  }
  await writeFile(new URL(path, root), formatted);
}

async function writeText(path, value) {
  if (!writeMode) {
    console.log(`[dry-run] would write ${path}`);
    return;
  }
  await mkdir(new URL(path.replace(/\/[^/]+$/, "/"), root), { recursive: true });
  await writeFile(new URL(path, root), value);
}

function mergeByKey(existing, additions, key) {
  const next = new Map(existing.map((item) => [item[key], item]));
  for (const item of additions) {
    next.set(item[key], item);
  }
  return [...next.values()];
}

function slugTitle(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function xmlEscape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const gameSortOrders = new Map([
  ["hitman-woa", 10],
  ["sniper-elite-3", 20],
  ["sniper-elite-4", 30],
  ["sniper-elite-5", 40],
  ["sniper-elite-resistance", 50],
]);

const configs = [
  {
    id: "sniper-elite-3",
    slug: "sniper-elite-3",
    title: "Sniper Elite 3",
    shortTitle: "Sniper Elite 3",
    description:
      "Curated Recon draft layers for Sniper Elite 3 campaign and DLC missions.",
    sortOrder: 30,
    prefix: "se3",
    official: {
      label: "Rebellion - Sniper Elite 3",
      url: "https://shop.rebellion.com/products/sniper-elite-3",
      note: "Official product context for the North Africa campaign and game scope.",
    },
    sources: [
      {
        label: "Sniper Elite Wiki - Sniper Elite III",
        url: "https://sniperelite.fandom.com/wiki/Sniper_Elite_III",
        coverage: "mission_list_and_broad_context",
        note: "Used to confirm campaign and DLC mission names; community wiki text and images are not reused.",
      },
      {
        label: "Gamepressure Sniper Elite III guide",
        url: "https://www.gamepressure.com/sniperelite3/",
        coverage: "map_statistics_and_collectible_scope",
        note: "Used for mission map/statistics and collectible category coverage only. Map images, route prose, and labels are not reused.",
      },
      {
        label: "PowerPyx Sniper Elite 3 strategy guide",
        url: "https://www.powerpyx.com/guides/sniper_elite_3.html",
        coverage: "collectible_count_and_optional_objective_scope",
        note: "Used to cross-check collectible categories and total coverage. Guide prose, video content, and positions are not reused.",
      },
      {
        label: "PS4Trophies Sniper Elite 3 collectible guide",
        url: "https://www.ps4trophiesgaming.com/sniper-elite-3/sniper-elite-3-collectibles-trophy-guides/",
        coverage: "mission_collectible_count_spot_check",
        note: "Used for count/category sanity checks only. Video routes and location descriptions are not reused.",
      },
      {
        label: "GameMappers Sniper Elite 3 map article",
        url: "https://gamemappers.com/sniper-elite-3-map/",
        coverage: "map_category_and_completion_scope",
        note: "Used as a MapGenie-backed category/scope reference only. Coordinates, screenshots, UI, and marker text are not reused.",
      },
      {
        label: "Wand Sniper Elite 3 game page",
        url: "https://wand.com/games/sniper-elite-3",
        coverage: "game_tool_and_overlay_coverage_only",
        note: "Confirms Wand game support and overlay tooling. No public Wand map endpoint or app data is reused.",
      },
    ],
    poiCandidates: [
      ["War diary sweep", "war_diary"],
      ["Collectible card sweep", "collectible_card"],
      ["Sniper nest and long-shot review", "sniper_nest"],
      ["Weapon part review", "weapon_part"],
      ["Optional objective review", "optional_objective"],
    ],
    missions: [
      ["siege-of-tobruk", "Siege of Tobruk", "Mission 1"],
      ["gaberoun", "Gaberoun", "Mission 2"],
      ["halfaya-pass", "Halfaya Pass", "Mission 3"],
      ["fort-rifugio", "Fort Rifugio", "Mission 4"],
      ["siwa-oasis", "Siwa Oasis", "Mission 5"],
      ["kasserine-pass", "Kasserine Pass", "Mission 6"],
      ["ponts-du-fahs-airfield", "Ponts Du Fahs Airfield", "Mission 7"],
      ["ratte-factory", "Ratte Factory", "Mission 8"],
      ["hunt-the-grey-wolf", "Hunt The Grey Wolf", "DLC Mission"],
      ["in-shadows", "In Shadows", "DLC Mission"],
      ["belly-of-the-beast", "Belly of the Beast", "DLC Mission"],
      ["confrontation", "Confrontation", "DLC Mission"],
    ],
  },
  {
    id: "sniper-elite-4",
    slug: "sniper-elite-4",
    title: "Sniper Elite 4",
    shortTitle: "Sniper Elite 4",
    description:
      "Curated Recon draft layers for Sniper Elite 4 campaign and DLC missions.",
    sortOrder: 40,
    prefix: "se4",
    official: {
      label: "Rebellion - Sniper Elite 4",
      url: "https://shop.rebellion.com/products/sniper-elite-4",
      note: "Official product context for the Italy campaign, large campaign levels, and DLC edition scope.",
    },
    sources: [
      {
        label: "Sniper Elite Wiki - Sniper Elite 4",
        url: "https://sniperelite.fandom.com/wiki/Sniper_Elite_4",
        coverage: "mission_list_and_broad_context",
        note: "Used to confirm campaign and DLC mission names; community wiki text and images are not reused.",
      },
      {
        label: "Gamepressure Sniper Elite 4 guide",
        url: "https://www.gamepressure.com/sniper-elite-4/",
        coverage: "mission_map_and_collectible_scope",
        note: "Used for mission structure, objective categories, and collectible categories only. Map images, route prose, labels, and screenshots are not reused.",
      },
      {
        label: "GameMappers Sniper Elite 4 map article",
        url: "https://gamemappers.com/sniper-elite-4-map/",
        coverage: "map_category_and_completion_scope",
        note: "Used as a MapGenie-backed category/scope reference only. Coordinates, screenshots, UI, and marker text are not reused.",
      },
      {
        label: "SniperElite4Maps website",
        url: "https://sniperelite4maps.de/h/",
        coverage: "independent_category_and_visual_reference",
        note: "Used for category coverage and manual visual-review planning only. Map files, marker coordinates, UI, and text are not reused.",
      },
      {
        label: "SniperElite4Maps GitHub repository",
        url: "https://github.com/lordfiSh/sniperelite4maps",
        coverage: "source_posture_and_issue_reference",
        note: "Used to record source availability and unresolved issue posture only. Code, map assets, marker data, and descriptions are not reused.",
      },
      {
        label: "Wand Sniper Elite 4 game page",
        url: "https://wand.com/games/sniper-elite-4",
        coverage: "game_tool_and_overlay_coverage_only",
        note: "Confirms Wand game support and overlay tooling. No public Wand map endpoint or app data is reused.",
      },
    ],
    poiCandidates: [
      ["Document and letter sweep", "misc_document"],
      ["Sniper report review", "sniper_report"],
      ["Deadeye target review", "deadeye_target"],
      ["Generator and objective systems review", "generator"],
      ["Ammo and weapon cache review", "ammo_box"],
    ],
    missions: [
      ["san-celini-island", "San Celini Island", "Mission 1"],
      ["bitanti-village", "Bitanti Village", "Mission 2"],
      ["regilino-viaduct", "Regilino Viaduct", "Mission 3"],
      ["lorino-dockyard", "Lorino Dockyard", "Mission 4"],
      ["abrunza-monastery", "Abrunza Monastery", "Mission 5"],
      ["magazzeno-facility", "Magazzeno Facility", "Mission 6"],
      ["giovi-fiorini-mansion", "Giovi Fiorini Mansion", "Mission 7"],
      ["allagra-fortress", "Allagra Fortress", "Mission 8"],
      ["target-fuhrer", "Target Führer", "DLC Mission"],
      ["deathstorm-inception", "Deathstorm Part 1: Inception", "DLC Mission"],
      ["deathstorm-infiltration", "Deathstorm Part 2: Infiltration", "DLC Mission"],
      ["deathstorm-obliteration", "Deathstorm Part 3: Obliteration", "DLC Mission"],
    ],
  },
];

function mapId(config, mission) {
  return `${config.prefix}-${mission[0]}`;
}

function assetId(config, mission) {
  return `draft-schematic-${mapId(config, mission)}`;
}

function assetPath(config, mission) {
  return `private/recon/maps/${config.slug}/${mission[0]}-draft.svg`;
}

function mapViewId(config, mission) {
  return `${mapId(config, mission)}-surface`;
}

function sortByGameAndOrder(items) {
  return items.sort((a, b) => {
    const aGame = gameSortOrders.get(a.gameId || a.id) ?? 999;
    const bGame = gameSortOrders.get(b.gameId || b.id) ?? 999;
    if (aGame !== bGame) return aGame - bGame;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || `${a.id}`.localeCompare(`${b.id}`);
  });
}

function sourceReferences(config, mission) {
  return [
    ...config.sources.map((source) => ({
      label: source.label,
      url: source.url,
      note: source.note,
    })),
    {
      label: "First-hand Vaexil gameplay review",
      url: "",
      note: `Required before any ${mission[1]} marker becomes verified or published.`,
    },
  ];
}

function sourcePacket(config, mission) {
  const title = mission[1];
  return {
    mapId: mapId(config, mission),
    gameId: config.id,
    status: "research_draft",
    lastReviewed,
    officialSources: [config.official],
    referenceSources: sourceReferences(config, mission),
    verifiedNamedAreas: [],
    approximateAreas: [
      `${title} private neutral draft surface plate`,
      "Mission start, objective, extraction, and route-review candidates",
      "Collectible, document, weapon, resource, and challenge-review candidates",
      "Interior, elevated, tunnel, or vertical spaces that may need future split views",
    ],
    poiCandidates: config.poiCandidates.map(([label, category]) => ({
      label: `${title} ${label}`,
      category,
      confidence: "unverified",
      notes: "Source-packet review candidate only; create coordinates after private source import, scratch comparison, or first-hand gameplay review.",
    })),
    uncertaintyNotes: [
      "This legacy Sniper Elite map is admin-draft scaffolding only and currently uses a neutral Vaexil-created placeholder plate.",
      "No third-party source map, marker coordinate payload, guide prose, screenshots, icons, or public UI has been imported for this title.",
      "Exact marker placement requires a later private source-map approval, scratch-only visual comparison, or first-hand gameplay coordinate pass.",
      "If a compatible private source plate is approved later, keep it under private/recon and keep resulting markers draft/unverified until manually reviewed.",
    ],
    avoidCopying: [
      "Rebellion screenshots, in-game map art, UI icons, and marketing images.",
      "Gamepressure map images, numbering systems, route prose, screenshots, and guide text.",
      "GameMappers, MapGenie, SniperElite4Maps, Wand, PowerPyx, PS4Trophies, and similar marker coordinates, app data, screenshots, UI, guide prose, and route descriptions.",
      "Any third-party source-map image unless it is explicitly recorded as owner-approved private review material.",
    ],
  };
}

function sourceCrossCheck(config, mission) {
  const id = mapId(config, mission);
  return {
    mapId: id,
    gameId: config.id,
    status: "source_gap",
    lastReviewed,
    localMarkerCount: 0,
    localWorkbenchCount: 0,
    summary: `${mission[1]} has a draft map shell, source packet, and private neutral review view. Exact marker coordinates still need private source approval or first-hand gameplay review.`,
    sources: config.sources.map((source) => ({
      label: source.label,
      url: source.url,
      coverage: source.coverage,
      notes: source.note,
    })),
    visualReview: {
      status: "source_limited",
      lastCompared: lastReviewed,
      summary:
        "No committed third-party source plate or marker coordinate import exists for this legacy title. Use the listed sources only for manual comparison planning and category/count sanity checks.",
      findings: [
        "A neutral Vaexil-created placeholder is attached for protected admin coordinate capture.",
        "Public Recon still exposes no third-party map images, screenshots, UI, guide prose, or marker data.",
        "Legacy-title source availability is weaker than current SE5/Resistance Guides4Gamers imports, so first-hand review is the publication gate.",
      ],
      manualReviewFocus: [
        "Confirm the mission boundary, orientation, and major named zones before entering markers.",
        "Review core objectives, starts, exits, collectibles, and challenge targets before resource or enemy-density layers.",
        "Flag any interior, tunnel, elevation, or multi-stage area that needs a separate map view.",
      ],
    },
    checks: [
      {
        label: "Mission coverage",
        status: "match",
        localValue: "draft map record created",
        sourceValue: "campaign/DLC source list includes this mission",
        notes: "Mission inclusion is based on the recorded official/product and mission-list references.",
      },
      {
        label: "Private source-map import",
        status: "source_gap",
        localValue: "neutral Vaexil placeholder only",
        sourceValue: "third-party references available",
        notes: "No compatible source-map import was committed in this pass; do not enter exact coordinates from third-party sources until approval and review notes exist.",
      },
      {
        label: "Marker coordinate import",
        status: "source_gap",
        localValue: "0 draft markers",
        sourceValue: "manual review required",
        notes: "Marker seeds are intentionally deferred until a source-safe coordinate workflow is available for this map.",
      },
    ],
    warnings: [
      "Legacy map detail is research-scaffold level, not marker-coordinate parity with SE5/Resistance yet.",
      "Do not publish this map or any marker until a first-hand gameplay or approved private source review pass is recorded.",
    ],
    nextSteps: [
      "Run a scratch-only visual comparison pass against the recorded sources.",
      "Capture normalized coordinates in the admin tool from gameplay or approved private source plates.",
      "Update this cross-check with marker counts and manual position-review notes before any confidence upgrade.",
    ],
  };
}

function placeholderSvg(config, mission) {
  const title = xmlEscape(mission[1]);
  const game = xmlEscape(config.shortTitle);
  const subtitle = xmlEscape(mission[2]);
  const missionSlug = slugTitle(mission[1]);
  return `<svg width="2048" height="1280" viewBox="0 0 2048 1280" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${game} ${title} Recon private draft placeholder</title>
  <desc id="desc">A neutral Vaexil-created drafting grid for ${game} ${title}. It is not copied game map art and is used only for protected admin review.</desc>
  <rect width="2048" height="1280" fill="#071014"/>
  <path d="M0 160H2048M0 320H2048M0 480H2048M0 640H2048M0 800H2048M0 960H2048M0 1120H2048M256 0V1280M512 0V1280M768 0V1280M1024 0V1280M1280 0V1280M1536 0V1280M1792 0V1280" stroke="#1F2E39" stroke-width="2"/>
  <path d="M0 80H2048M0 240H2048M0 400H2048M0 560H2048M0 720H2048M0 880H2048M0 1040H2048M0 1200H2048M128 0V1280M384 0V1280M640 0V1280M896 0V1280M1152 0V1280M1408 0V1280M1664 0V1280M1920 0V1280" stroke="#12202A" stroke-width="1"/>
  <rect x="96" y="96" width="1856" height="1088" rx="22" stroke="#2DD4BF" stroke-width="4" stroke-dasharray="20 18"/>
  <path d="M352 832C470 560 655 365 910 308C1148 255 1360 346 1528 528C1648 658 1721 791 1768 956C1575 1021 1356 1050 1112 1026C838 999 585 931 352 832Z" fill="#0B1A22" stroke="#38BDF8" stroke-width="5"/>
  <path d="M514 790C667 690 819 608 1000 588C1210 565 1407 617 1608 735M746 428C876 538 983 660 1038 812M1318 395C1262 546 1200 697 1112 1026" stroke="#3B5871" stroke-width="4"/>
  <circle cx="514" cy="790" r="16" fill="#22D3EE"/>
  <circle cx="1000" cy="588" r="16" fill="#22D3EE"/>
  <circle cx="1608" cy="735" r="16" fill="#22D3EE"/>
  <text x="144" y="190" fill="#E2E8F0" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700">${game}</text>
  <text x="144" y="250" fill="#94A3B8" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">${title}</text>
  <text x="144" y="304" fill="#64748B" font-family="Arial, Helvetica, sans-serif" font-size="26">${subtitle} / ${missionSlug}</text>
  <text x="144" y="1090" fill="#94A3B8" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="5">RECON PRIVATE DRAFT ONLY</text>
  <text x="144" y="1134" fill="#64748B" font-family="Arial, Helvetica, sans-serif" font-size="23">Neutral placeholder for coordinate capture. Replace with a reviewed Vaexil-authored schematic before publishing.</text>
  <text x="1510" y="1134" fill="#64748B" font-family="Arial, Helvetica, sans-serif" font-size="22">0,0 top-left / 100,100 bottom-right</text>
</svg>
`;
}

const games = await readJson("src/data/recon/games.json");
const maps = await readJson("src/data/recon/maps.json");
const assets = await readJson("src/data/recon/asset-manifest.json");
const mapViews = await readJson("src/data/recon/map-views.json");
const sourcePackets = await readJson("src/data/recon/source-packets.json");
const sourceCrossChecks = await readJson("src/data/recon/source-cross-checks.json");

const newGames = configs.map((config) => ({
  id: config.id,
  slug: config.slug,
  title: config.title,
  shortTitle: config.shortTitle,
  description: config.description,
  enabled: true,
  sortOrder: config.sortOrder,
}));

const newMaps = [];
const newAssets = [];
const newMapViews = [];
const newSourcePackets = [];
const newSourceCrossChecks = [];

for (const config of configs) {
  for (const [index, mission] of config.missions.entries()) {
    const id = mapId(config, mission);
    const asset = assetId(config, mission);
    const sortOrder = index < 8
      ? (index + 1) * 10
      : 200 + (index - 7) * 10;

    newMaps.push({
      id,
      gameId: config.id,
      slug: mission[0],
      title: mission[1],
      subtitle: mission[2],
      description:
        "Draft Recon structure with a private neutral source-review placeholder for admin-only coordinate planning.",
      imageAssetId: asset,
      width: 2048,
      height: 1280,
      minZoom: 0.5,
      maxZoom: 3,
      floorSupport: false,
      enabled: true,
      status: "draft",
      sortOrder,
    });

    newAssets.push({
      id: asset,
      gameId: config.id,
      mapId: id,
      type: "base_map",
      path: assetPath(config, mission),
      width: 2048,
      height: 1280,
      sourceName: "Vaexil.tv",
      sourceUrl: "",
      license: "Vaexil-created placeholder",
      attribution: "Vaexil.tv",
      imported: false,
      status: "placeholder",
      visibility: "private",
      notes:
        "Private neutral legacy Sniper Elite draft placeholder only. Not a game map, not sourced from third-party map art, and not public static content.",
    });

    newMapViews.push({
      id: mapViewId(config, mission),
      mapId: id,
      label: "Surface / mission review",
      shortLabel: "Surface",
      kind: "surface",
      floor: "surface",
      assetId: asset,
      sortOrder: 10,
      notes:
        "Private neutral draft surface view for legacy Sniper Elite admin review. Replace with a reviewed Vaexil-authored or approved private source plate before position work.",
    });

    newSourcePackets.push(sourcePacket(config, mission));
    newSourceCrossChecks.push(sourceCrossCheck(config, mission));

    if (!existsSync(new URL(assetPath(config, mission), root))) {
      await writeText(assetPath(config, mission), placeholderSvg(config, mission));
    }
  }
}

const nextGames = mergeByKey(games, newGames, "id").map((game) => ({
  ...game,
  sortOrder: gameSortOrders.get(game.id) ?? game.sortOrder,
}));

await writeJson("src/data/recon/games.json", sortByGameAndOrder(nextGames));
await writeJson("src/data/recon/maps.json", sortByGameAndOrder(mergeByKey(maps, newMaps, "id")));
await writeJson(
  "src/data/recon/asset-manifest.json",
  sortByGameAndOrder(mergeByKey(assets, newAssets, "id")),
);
await writeJson(
  "src/data/recon/map-views.json",
  sortByGameAndOrder(mergeByKey(mapViews, newMapViews, "id")),
);
await writeJson(
  "src/data/recon/source-packets.json",
  sortByGameAndOrder(mergeByKey(sourcePackets, newSourcePackets, "mapId")),
);
await writeJson(
  "src/data/recon/source-cross-checks.json",
  sortByGameAndOrder(mergeByKey(sourceCrossChecks, newSourceCrossChecks, "mapId")),
);

console.log(
  `${writeMode ? "Wrote" : "Prepared"} ${newGames.length} games, ${newMaps.length} maps, ${newAssets.length} assets, ${newSourcePackets.length} source packets, and ${newSourceCrossChecks.length} cross-check records.`,
);
