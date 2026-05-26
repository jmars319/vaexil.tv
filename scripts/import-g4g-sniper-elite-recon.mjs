import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const cacheRoot = join("/tmp", "vaexil-g4g-sniper-elite-import");
const today = new Date().toISOString().slice(0, 10);
const dryRun = !process.argv.includes("--write");
const overwriteAssets = process.argv.includes("--overwrite-assets");

const missionGrids = {
  "sniper-elite-5": {
    gameId: "sniper-elite-5",
    gameShort: "se5",
    sourcePath: "sniper-elite-5",
    g4gMapId: 144,
    sourceUrl: "https://guides4gamers.com/sniper-elite-5/maps/campaign-maps/",
    sourceName: "Guides4Gamers Sniper Elite 5 Campaign Maps",
    officialLabel: "Rebellion - Sniper Elite 5",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-5",
    missions: [
      ["atlantic-wall", "The Atlantic Wall", "Mission 1"],
      ["occupied-residence", "Occupied Residence", "Mission 2"],
      ["spy-academy", "Spy Academy", "Mission 3"],
      ["war-factory", "War Factory", "Mission 4"],
      ["festung-guernsey", "Festung Guernsey", "Mission 5"],
      ["liberation", "Liberation", "Mission 6"],
      ["secret-weapons", "Secret Weapons", "Mission 7"],
      ["rubble-and-ruin", "Rubble and Ruin", "Mission 8"],
    ],
    singleMaps: [
      ["wolf-mountain", "Wolf Mountain", "Target Führer DLC", 145],
      ["landing-force", "Landing Force", "DLC Mission", 149],
      ["conqueror", "Conqueror", "DLC Mission", 170],
      ["rough-landing", "Rough Landing", "DLC Mission", 180],
      ["kraken-awakes", "Kraken Awakes", "DLC Mission", 191],
    ],
  },
  "sniper-elite-resistance": {
    gameId: "sniper-elite-resistance",
    gameShort: "ser",
    sourcePath: "sniper-elite-resistance",
    g4gMapId: 237,
    sourceUrl: "https://guides4gamers.com/sniper-elite-resistance/maps/campaign-maps/",
    sourceName: "Guides4Gamers Sniper Elite: Resistance Campaign Maps",
    officialLabel: "Rebellion - Sniper Elite: Resistance",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-resistance",
    missions: [
      ["behind-enemy-lines", "Behind Enemy Lines", "Mission 1"],
      ["dead-drop", "Dead Drop", "Mission 2"],
      ["sonderzuge-sabotage", "Sonderzüge Sabotage", "Mission 3"],
      ["collision-course", "Collision Course", "Mission 4"],
      ["devils-cauldron", "Devil's Cauldron", "Mission 5"],
      ["assault-on-fort-rouge", "Assault on Fort Rouge", "Mission 6"],
      ["lock-stock-and-barrels", "Lock, Stock and Barrels", "Mission 7"],
      ["end-of-the-line", "End of the Line", "Mission 8"],
      ["all-or-nothing", "All or Nothing", "Mission 9"],
    ],
  },
};

const categoryBySubcategory = new Map([
  ["Alarm", ["alarm", "poi"]],
  ["Alarm Sirens", ["alarm_siren", "poi"]],
  ["Ammunition", ["ammunition", "ammo"]],
  ["Armored Vehicle", ["vehicle", "vehicle"]],
  ["Bolt Cutter", ["bolt_cutters", "bolt-cutters"]],
  ["Bolt Cutters", ["bolt_cutters", "bolt-cutters"]],
  ["Bottle of Poison", ["poison_pickup", "poison"]],
  ["Cardboard Pigeon", ["cardboard_pigeon", "pigeon"]],
  ["Classified Document", ["classified_document", "document"]],
  ["Crowbar", ["crowbar", "crowbar"]],
  ["Exfiltrate Location", ["exfiltration", "exit"]],
  ["Explosives", ["explosives", "explosive"]],
  ["Found Weapon", ["weapon", "weapon"]],
  ["Fuse Box", ["fuse_box", "fuse-box"]],
  ["Gnome", ["gnome", "gnome"]],
  ["Hidden Item", ["hidden_item", "item"]],
  ["Key", ["key_or_code", "key"]],
  ["Key / Code", ["key_or_code", "key"]],
  ["Kill List Target", ["kill_list_target", "target"]],
  ["Kill Target", ["kill_list_target", "target"]],
  ["Main Objective", ["main_objective", "objective"]],
  ["Medal Related", ["medal_related", "medal"]],
  ["Medical Item", ["medical_item", "medical"]],
  ["Optional Objective", ["optional_objective", "objective"]],
  ["Passage", ["passage", "entrance"]],
  ["Personal Letter", ["personal_letter", "document"]],
  ["Rat Bomb", ["explosives", "explosive"]],
  ["Satchel Charge", ["satchel_charge", "satchel-charge"]],
  ["Side Objective", ["optional_objective", "objective"]],
  ["Starting Location", ["starting_location", "entrance"]],
  ["Starting location", ["starting_location", "entrance"]],
  ["Stone Eagle", ["stone_eagle", "target"]],
  ["Supply Pouch", ["supply_pouch", "supply"]],
  ["Tank", ["vehicle", "vehicle"]],
  ["Tool", ["tool", "tool"]],
  ["Transition", ["transition", "route-point"]],
  ["Weapon", ["weapon", "weapon"]],
]);

const medalNotes = new Map([
  ["37965", "Long-shot draft: set up for a 525 m shot toward the mansion-side hill in Occupied Residence. Verify exact target and sightline in-game before publishing."],
  ["37966", "Long-shot draft: set up in the cathedral tower for a 675 m shot toward the southern fortifications in Spy Academy. Verify exact target and window in-game before publishing."],
  ["37967", "Long-shot draft: set up for a 457 m shot toward the refinery roof in War Factory. Verify exact rooftop target in-game before publishing."],
  ["37968", "Long-shot draft: use the western tower sightline in Festung Guernsey and verify the guard target near the Stone Eagle tower before publishing."],
  ["37969", "Long-shot draft: set up for a 560 m shot toward the destroyed church tower in Liberation. Verify the northwest tower target in-game before publishing."],
  ["37970", "Long-shot draft: set up for a 500 m shot toward the dam-side guard tower in Secret Weapons. Verify exact tower target in-game before publishing."],
  ["37971", "Long-shot draft: set up for a 575 m shot toward the anti-air site in Rubble and Ruin. Verify exact soldier and sightline in-game before publishing."],
  ["37963", "Medal draft: track Abelard Moller at distance for the Wolf Mountain long-shot medal. Verify vehicle timing and target range in-game before publishing."],
  ["37972", "Long-shot draft: set up for a 412 m Wolf Mountain shot from an upper-floor room toward the teahouse soldier. Verify target timing in-game before publishing."],
  ["38717", "Long-shot draft: set up for a 500 m Landing Force shot from the tower top toward the fort-tower sniper. Verify climb route and sightline in-game before publishing."],
  ["43162", "Long-shot draft: set up for a 400 m Conqueror shot from the castle tower roof toward the destroyed-town patrol. Verify the southwest sightline in-game before publishing."],
  ["47189", "Long-shot draft: set up for a 400 m Rough Landing shot from the Forest Clearing route toward a bridge soldier. Verify the bridge target in-game before publishing."],
  ["37708", "Medal draft: destroy Moller's courtyard car for the related Occupied Residence medal. Verify the car state and trigger in-game before publishing."],
  ["37857", "Medal draft: one of the five Spy Academy practice-range targets. Verify the target order and sightline in-game before publishing."],
  ["37858", "Medal draft: one of the five Spy Academy practice-range targets. Verify the target order and sightline in-game before publishing."],
  ["37859", "Medal draft: one of the five Spy Academy practice-range targets. Verify the target order and sightline in-game before publishing."],
  ["37860", "Medal draft: one of the five Spy Academy practice-range targets. Verify the target order and sightline in-game before publishing."],
  ["37861", "Medal draft: one of the five Spy Academy practice-range targets. Verify the target order and sightline in-game before publishing."],
  ["37862", "Medal draft: practice-range firing point for the Spy Academy Show Off target set. Verify weapon pickup and target sequence in-game before publishing."],
  ["37958", "Medal draft: use the War Factory crane incident setup tied to the train objective. Verify the operator timing in-game before publishing."],
  ["37960", "Medal draft: searchlight sabotage target tied to a nearby fuse box. Verify the fuse-box route in-game before publishing."],
  ["37961", "Medal draft: searchlight sabotage target tied to a nearby fuse box. Verify the fuse-box route in-game before publishing."],
  ["37962", "Medal draft: searchlight sabotage target tied to a nearby fuse box. Verify the fuse-box route in-game before publishing."],
  ["37586", "Medal draft: Wolf Mountain Moller elimination setup involving a vehicle explosion. Verify safe timing and exact target path in-game before publishing."],
  ["68738", "Long-shot draft: set up for a 430 m Dead Drop shot toward the basilica balcony sniper. Verify exact balcony target in-game before publishing."],
  ["68744", "Long-shot draft: Sonderzuge Sabotage requires a shorter 200 m long-shot setup; verify the available target and sightline in-game before publishing."],
  ["68742", "Long-shot draft: set up for a 400 m Collision Course shot toward the bungalow balcony target. Verify the partial tree cover in-game before publishing."],
  ["68743", "Long-shot draft: set up for a 485 m Devil's Cauldron shot toward the lighthouse sniper. Verify the exact firing point in-game before publishing."],
  ["68741", "Long-shot draft: set up for a 400 m Assault on Fort Rouge shot toward a watchtower target. Verify the hill/watchtower option in-game before publishing."],
  ["68740", "Long-shot draft: set up for a 350 m Lock, Stock and Barrels shot toward the windmill sniper. Verify the northwest sightline in-game before publishing."],
  ["68739", "Long-shot draft: set up for a 425 m End of the Line shot toward the searchlight watchtower. Verify the northeast target in-game before publishing."],
  ["68718", "Medal draft: gnome-related photo-mode achievement reference. Verify exact interaction and framing in-game before publishing."],
]);

function jsonUrl(path) {
  return new URL(path, root);
}

async function readJson(path) {
  return JSON.parse(await readFile(jsonUrl(path), "utf8"));
}

async function writeJson(path, value) {
  const formatted = `${JSON.stringify(value, null, 2)}\n`;
  if (dryRun) {
    console.log(`[dry-run] would write ${path}`);
    return;
  }
  await writeFile(jsonUrl(path), formatted);
}

function round4(value) {
  return Math.round(value * 10_000) / 10_000;
}

function missionId(config, mission) {
  return `${config.gameShort}-${mission[0]}`;
}

function assetId(config, mission) {
  return `guides4gamers-${config.gameShort}-${mission[0]}-surface`;
}

function assetPath(config, mission) {
  return `private/recon/maps/${config.sourcePath}/${mission[0]}-guides4gamers-surface.jpg`;
}

function singleSourceUrl(config, mission) {
  return `https://guides4gamers.com/${config.sourcePath}/maps/${mission[0]}/`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function downloadFile(url, path) {
  if (existsSync(path)) return;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  await mkdir(dirname(path), { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(path, bytes);
}

async function downloadTiles(config, payload, scaleLevel = 2) {
  const map = payload.map;
  const fullSize = map.width / scaleLevel;
  const tileCount = Math.ceil(fullSize / 512);
  const tileDir = join(cacheRoot, config.sourcePath, `map-${map.id}-${map.version}`, `level-${scaleLevel}`);
  const baseUrl = `https://tiles.guides4gamers.com/sites/${payload.site.id}/maps/${map.id}-${map.version}/slices/${scaleLevel}`;
  const tasks = [];

  for (let y = 0; y < tileCount; y += 1) {
    for (let x = 0; x < tileCount; x += 1) {
      const path = join(tileDir, `${x}x${y}.jpg`);
      const url = `${baseUrl}/${x}x${y}.jpg`;
      tasks.push(() => downloadFile(url, path));
    }
  }

  const concurrency = 8;
  let index = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (index < tasks.length) {
        const task = tasks[index];
        index += 1;
        await task();
      }
    }),
  );

  return { tileDir, tileCount, fullSize };
}

function buildComposite(config, payload, tileInfo, scaleLevel = 2) {
  const fullPath = join(
    cacheRoot,
    config.sourcePath,
    `map-${payload.map.id}-${payload.map.version}`,
    `campaign-map-level-${scaleLevel}.jpg`,
  );
  if (existsSync(fullPath)) return fullPath;

  const tiles = [];
  for (let y = 0; y < tileInfo.tileCount; y += 1) {
    for (let x = 0; x < tileInfo.tileCount; x += 1) {
      tiles.push(join(tileInfo.tileDir, `${x}x${y}.jpg`));
    }
  }

  execFileSync("magick", [
    "montage",
    ...tiles,
    "-tile",
    `${tileInfo.tileCount}x${tileInfo.tileCount}`,
    "-geometry",
    "512x512+0+0",
    fullPath,
  ]);

  return fullPath;
}

async function cropMissionPlates(config, payload, fullPath, scaleLevel = 2) {
  const fullSize = payload.map.width / scaleLevel;
  const output = [];

  for (const [index, mission] of config.missions.entries()) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const left = Math.round((col * fullSize) / 3);
    const top = Math.round((row * fullSize) / 3);
    const right = Math.round(((col + 1) * fullSize) / 3);
    const bottom = Math.round(((row + 1) * fullSize) / 3);
    const width = right - left;
    const height = bottom - top;
    const relativeOutput = assetPath(config, mission);
    const outputPath = join(rootPath, relativeOutput);

    if (!existsSync(outputPath) || overwriteAssets) {
      if (dryRun) {
        console.log(`[dry-run] would crop ${relativeOutput}`);
      } else {
        await mkdir(dirname(outputPath), { recursive: true });
        execFileSync("magick", [
          fullPath,
          "-crop",
          `${width}x${height}+${left}+${top}`,
          "+repage",
          "-resize",
          "2048x2048!",
          "-quality",
          "86",
          outputPath,
        ]);
      }
    }

    output.push({
      mission,
      row,
      col,
      crop: { left, top, width, height },
      relativeOutput,
    });
  }

  return output;
}

async function renderSinglePlate(config, mission, payload) {
  const tileInfo = await downloadTiles(config, payload, 1);
  const fullPath = buildComposite(config, payload, tileInfo, 1);
  const relativeOutput = assetPath(config, mission);
  const outputPath = join(rootPath, relativeOutput);

  if (!existsSync(outputPath) || overwriteAssets) {
    if (dryRun) {
      console.log(`[dry-run] would render ${relativeOutput}`);
    } else {
      await mkdir(dirname(outputPath), { recursive: true });
      execFileSync("magick", [
        fullPath,
        "-resize",
        "2048x2048!",
        "-quality",
        "86",
        outputPath,
      ]);
    }
  }
}

function markerDescription(id, poi, missionTitle) {
  if (medalNotes.has(id)) return medalNotes.get(id);

  const templates = {
    ammunition: "Ammunition pickup draft marker. Verify crate/table placement in-game before publishing.",
    explosives: "Explosive pickup draft marker. Verify exact placement and item type in-game before publishing.",
    supply_pouch: "Supply pouch draft marker. Verify exact placement in-game before publishing.",
    medical_item: "Medical pickup draft marker. Verify exact placement in-game before publishing.",
    passage: "Passage/route draft marker. Verify whether this is an exterior, interior, ladder, tunnel, or door route in-game before publishing.",
    transition: "Transition draft marker. Verify the connected area and whether it needs a separate interior view before publishing.",
    vehicle: "Vehicle/tank draft marker. Verify the vehicle role and destruction route in-game before publishing.",
    workbench: "Workbench draft marker. Verify weapon type, room access, and exact placement in-game before publishing.",
    rifle_workbench: "Rifle workbench draft marker. Verify room access and exact placement in-game before publishing.",
    smg_workbench: "SMG workbench draft marker. Verify room access and exact placement in-game before publishing.",
    pistol_workbench: "Pistol workbench draft marker. Verify room access and exact placement in-game before publishing.",
    satchel_charge: "Satchel charge draft marker. Verify pickup placement and nearby objective use in-game before publishing.",
    bolt_cutters: "Bolt cutters draft marker. Verify exact pickup placement and nearby locked route in-game before publishing.",
    crowbar: "Crowbar draft marker. Verify exact pickup placement and nearby crate/door use in-game before publishing.",
    fuse_box: "Fuse box draft marker. Verify linked alarm, searchlight, or objective behavior in-game before publishing.",
    key_or_code: "Key/code draft marker. Verify access target, pickup state, and exact placement in-game before publishing.",
    main_objective: `${missionTitle} objective draft marker. Verify objective interaction and exact location in-game before publishing.`,
    optional_objective: `${missionTitle} optional objective draft marker. Verify objective interaction and exact location in-game before publishing.`,
    starting_location: `${missionTitle} starting-location draft marker. Verify unlock state and spawn placement in-game before publishing.`,
    exfiltration: `${missionTitle} exfiltration draft marker. Verify extraction trigger placement in-game before publishing.`,
    kill_list_target: "Kill-list target draft marker. Verify route, challenge condition, and exact patrol/hold position in-game before publishing.",
    stone_eagle: "Stone Eagle collectible draft marker. Verify line of sight and exact target placement in-game before publishing.",
    personal_letter: "Personal Letter collectible draft marker. Verify room/surface placement in-game before publishing.",
    classified_document: "Classified Document collectible draft marker. Verify room/surface placement in-game before publishing.",
    hidden_item: "Hidden Item collectible draft marker. Verify exact item placement in-game before publishing.",
    cardboard_pigeon: "Cardboard Pigeon draft marker. Verify target visibility and interaction in-game before publishing.",
    gnome: "Gnome draft marker. Verify exact placement and interaction requirements in-game before publishing.",
    poison_pickup: "Poison pickup draft marker. Verify exact placement and allowed use in-game before publishing.",
    alarm: "Alarm draft marker. Verify linked alarm area and disable route in-game before publishing.",
    alarm_siren: "Alarm siren draft marker. Verify alarm coverage and disable route in-game before publishing.",
    weapon: "Weapon pickup draft marker. Verify exact weapon type and placement in-game before publishing.",
    tool: "Tool pickup draft marker. Verify exact utility item and placement in-game before publishing.",
    poi: "Point-of-interest draft marker. Verify exact purpose and placement in-game before publishing.",
  };

  const [category] = categoryBySubcategory.get(poi.name_sub) || ["poi", "poi"];
  return templates[category] || "Private draft marker imported for Vaexil review. Verify in-game before publishing.";
}

function markerCategoryAndIcon(poi) {
  const mapped = categoryBySubcategory.get(poi.name_sub);
  if (!mapped) return ["poi", "poi"];
  return mapped;
}

function markerLabel(poi) {
  if (poi.name) return String(poi.name).replace(/^M\d{2}:\s*/i, "").trim();
  return poi.name_sub || "Draft marker";
}

function generateMarkers(config, payload, existingMarkers) {
  const existingById = new Map(existingMarkers.map((marker) => [marker.id, marker]));
  const cellSize = payload.map.width / 3;
  const output = [];

  for (const [index, mission] of config.missions.entries()) {
    const mapId = missionId(config, mission);
    const col = index % 3;
    const row = Math.floor(index / 3);
    const minX = col * cellSize;
    const maxX = (col + 1) * cellSize;
    const minY = row * cellSize;
    const maxY = (row + 1) * cellSize;
    const pois = Object.entries(payload.pois)
      .filter(([, poi]) => poi.x >= minX && poi.x < maxX && poi.y >= minY && poi.y < maxY)
      .sort((a, b) => {
        const sub = String(a[1].name_sub || "").localeCompare(String(b[1].name_sub || ""));
        if (sub !== 0) return sub;
        return Number(a[0]) - Number(b[0]);
      });

    for (const [sourceId, poi] of pois) {
      const id = `g4g-${config.gameShort}-${mission[0]}-${sourceId}`;
      if (existingById.has(id)) {
        output.push({ ...existingById.get(id), hiddenByDefault: false });
        continue;
      }

      const [category, iconKey] = markerCategoryAndIcon(poi);
      output.push({
        id,
        gameId: config.gameId,
        mapId,
        mode: "campaign",
        variant: "guides4gamers-campaign-cell-draft",
        category,
        subcategory: poi.name_sub || null,
        label: markerLabel(poi),
        description: markerDescription(sourceId, poi, mission[1]),
        x: round4(((poi.x - minX) / cellSize) * 100),
        y: round4(((poi.y - minY) / cellSize) * 100),
        floor: "surface",
        iconKey,
        tags: [
          "guides4gamers",
          mission[0],
          "draft-import",
          "campaign-cell-scale-corrected",
        ],
        sourceName: config.sourceName,
        sourceUrl: `${config.sourceUrl}#mark-${sourceId}`,
        sourceMarkerId: sourceId,
        confidence: "unverified",
        status: "draft",
        hiddenByDefault: false,
      });
    }
  }

  return output;
}

function generateSingleMarkers(config, mission, payload, existingMarkers) {
  const existingById = new Map(existingMarkers.map((marker) => [marker.id, marker]));
  const mapId = missionId(config, mission);

  return Object.entries(payload.pois)
    .sort((a, b) => {
      const sub = String(a[1].name_sub || "").localeCompare(String(b[1].name_sub || ""));
      if (sub !== 0) return sub;
      return Number(a[0]) - Number(b[0]);
    })
    .map(([sourceId, poi]) => {
      const id = `g4g-${config.gameShort}-${mission[0]}-${sourceId}`;
      if (existingById.has(id)) {
        return { ...existingById.get(id), hiddenByDefault: false };
      }

      const [category, iconKey] = markerCategoryAndIcon(poi);
      return {
        id,
        gameId: config.gameId,
        mapId,
        mode: "campaign",
        variant: "guides4gamers-map-draft",
        category,
        subcategory: poi.name_sub || null,
        label: markerLabel(poi),
        description: markerDescription(sourceId, poi, mission[1]),
        x: round4((poi.x / payload.map.width) * 100),
        y: round4((poi.y / payload.map.height) * 100),
        floor: "surface",
        iconKey,
        tags: [
          "guides4gamers",
          mission[0],
          "draft-import",
          "single-map-scale-corrected",
        ],
        sourceName: `${config.sourceName} - ${mission[1]}`,
        sourceUrl: `${singleSourceUrl(config, mission)}#mark-${sourceId}`,
        sourceMarkerId: sourceId,
        confidence: "unverified",
        status: "draft",
        hiddenByDefault: false,
      };
    });
}

function generatedMaps(config) {
  return config.missions.map((mission, index) => ({
    id: missionId(config, mission),
    gameId: config.gameId,
    slug: mission[0] === "atlantic-wall" ? "the-atlantic-wall" : mission[0],
    title: mission[1],
    subtitle: mission[2],
    description: "Draft Recon structure with a private imported surface source map for admin-only review.",
    imageAssetId: assetId(config, mission),
    width: 2048,
    height: 2048,
    minZoom: 0.5,
    maxZoom: 3,
    floorSupport: false,
    enabled: true,
    status: "draft",
    sortOrder: (index + 1) * 10,
  }));
}

function generatedAssets(config) {
  return config.missions.map((mission) => ({
    id: assetId(config, mission),
    gameId: config.gameId,
    mapId: missionId(config, mission),
    type: "base_map",
    path: assetPath(config, mission),
    width: 2048,
    height: 2048,
    sourceName: "Guides4Gamers",
    sourceUrl: config.sourceUrl,
    license: "Third-party source map; private draft review use approved by owner",
    attribution: "Guides4Gamers",
    imported: true,
    status: "candidate",
    visibility: "private",
    notes: `Private imported ${mission[1]} source map assembled from Guides4Gamers campaign-map tiles for Recon review. Not approved for public publication or marker-coordinate copying.`,
  }));
}

function generatedViews(config) {
  return config.missions.map((mission) => ({
    id: `${missionId(config, mission)}-surface`,
    mapId: missionId(config, mission),
    label: "Surface",
    shortLabel: "Surface",
    kind: "surface",
    floor: "surface",
    assetId: assetId(config, mission),
    sortOrder: 10,
    notes: "Actual private Guides4Gamers source map for surface review. Interior, bunker, tunnel, or underground detail still requires first-hand Vaexil validation before publication.",
  }));
}

function generatedSingleMaps(config) {
  return (config.singleMaps || []).map((mission, index) => ({
    id: missionId(config, mission),
    gameId: config.gameId,
    slug: mission[0],
    title: mission[1],
    subtitle: mission[2],
    description: "Draft Recon structure with a private imported surface source map for admin-only review.",
    imageAssetId: assetId(config, mission),
    width: 2048,
    height: 2048,
    minZoom: 0.5,
    maxZoom: 3,
    floorSupport: false,
    enabled: true,
    status: "draft",
    sortOrder: (config.missions.length + index + 1) * 10,
  }));
}

function generatedSingleAssets(config) {
  return (config.singleMaps || []).map((mission) => ({
    id: assetId(config, mission),
    gameId: config.gameId,
    mapId: missionId(config, mission),
    type: "base_map",
    path: assetPath(config, mission),
    width: 2048,
    height: 2048,
    sourceName: "Guides4Gamers",
    sourceUrl: singleSourceUrl(config, mission),
    license: "Third-party source map; private draft review use approved by owner",
    attribution: "Guides4Gamers",
    imported: true,
    status: "candidate",
    visibility: "private",
    notes: `Private imported ${mission[1]} source map assembled from Guides4Gamers map tiles for Recon review. Not approved for public publication or marker-coordinate copying.`,
  }));
}

function generatedSingleViews(config) {
  return (config.singleMaps || []).map((mission) => ({
    id: `${missionId(config, mission)}-surface`,
    mapId: missionId(config, mission),
    label: "Surface",
    shortLabel: "Surface",
    kind: "surface",
    floor: "surface",
    assetId: assetId(config, mission),
    sortOrder: 10,
    notes: "Actual private Guides4Gamers source map for surface review. Interior, bunker, tunnel, or underground detail still requires first-hand Vaexil validation before publication.",
  }));
}

function generatedSinglePacket(config, mission) {
  return {
    ...generatedPacket(config, mission),
    referenceSources: [
      {
        label: `${config.sourceName} - ${mission[1]}`,
        url: singleSourceUrl(config, mission),
        note: "Private source-map imagery and marker payload are used for admin-only draft review with owner approval; public publication still requires Vaexil validation.",
      },
      {
        label: "First-hand Vaexil gameplay review",
        url: "",
        note: `Required before any ${mission[1]} marker becomes verified or published.`,
      },
    ],
  };
}

function generatedPacket(config, mission) {
  const mapId = missionId(config, mission);
  return {
    mapId,
    gameId: config.gameId,
    status: "research_draft",
    lastReviewed: today,
    officialSources: [
      {
        label: config.officialLabel,
        url: config.officialUrl,
        note: "Official product context for campaign structure and game/platform context.",
      },
    ],
    referenceSources: [
      {
        label: config.sourceName,
        url: config.sourceUrl,
        note: "Private source-map imagery and campaign-cell marker payload are used for admin-only draft review with owner approval; public publication still requires Vaexil validation.",
      },
      {
        label: "First-hand Vaexil gameplay review",
        url: "",
        note: `Required before any ${mission[1]} marker becomes verified or published.`,
      },
    ],
    verifiedNamedAreas: [],
    approximateAreas: [
      `${mission[1]} surface map plate`,
      "Starting and exfiltration review points",
      "Objective, collectible, tool, and supply marker review points",
      "Interior, bunker, tunnel, or underground candidates that may need separate review views",
    ],
    poiCandidates: [
      {
        label: `${mission[1]} objective review`,
        category: "main_objective",
        confidence: "unverified",
        notes: "Draft-only source import; verify objective interaction and exact placement in-game.",
      },
      {
        label: `${mission[1]} collectible sweep`,
        category: "poi",
        confidence: "unverified",
        notes: "Use imported markers as a review checklist, not as public verified guide data.",
      },
      {
        label: `${mission[1]} utility and route review`,
        category: "tool",
        confidence: "unverified",
        notes: "Check tools, passages, and interior routes during first-hand gameplay review.",
      },
    ],
    uncertaintyNotes: [
      "The source map is a private admin-only candidate assembled from Guides4Gamers tiles and must not be published as a public map asset.",
      "Marker positions use the corrected 3x3 campaign-cell transform from the 16,384 pixel source payload into the 2,048 pixel mission plate.",
      "Exact markers remain draft/unverified until first-hand Vaexil gameplay review confirms placement and meaning.",
      "Interior, bunker, underground, and route markers may need separate future views if the surface plate becomes hard to read.",
    ],
    avoidCopying: [
      "Rebellion screenshots, in-game map art, UI icons, and marketing images.",
      "Guides4Gamers guide prose, screenshots, icons, public UI, and full walkthrough text.",
      "Third-party annotated map images, proprietary icons, and guide prose from other sources.",
    ],
  };
}

function replaceGeneratedByGame(existing, generated, predicate) {
  const generatedIds = new Set(generated.map((item) => item.id));
  return [
    ...existing.filter((item) => !generatedIds.has(item.id) && !predicate(item)),
    ...generated,
  ];
}

function sortReconMaps(maps) {
  const order = new Map([
    ["hitman-woa", 10],
    ["sniper-elite-5", 20],
    ["sniper-elite-resistance", 30],
  ]);
  return [...maps].sort((a, b) => {
    const game = (order.get(a.gameId) || 99) - (order.get(b.gameId) || 99);
    if (game !== 0) return game;
    return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
  });
}

function sortById(items) {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

async function main() {
  const [maps, assets, views, packets, markers] = await Promise.all([
    readJson("src/data/recon/maps.json"),
    readJson("src/data/recon/asset-manifest.json"),
    readJson("src/data/recon/map-views.json"),
    readJson("src/data/recon/source-packets.json"),
    readJson("src/data/recon/marker-seeds.json"),
  ]);

  let nextMaps = maps;
  let nextAssets = assets;
  let nextViews = views;
  let nextPackets = packets;
  let nextMarkers = markers.filter(
    (marker) =>
      marker.gameId !== "sniper-elite-5" &&
      marker.gameId !== "sniper-elite-resistance",
  );

  for (const config of Object.values(missionGrids)) {
    const payload = await fetchJson(`https://guides4gamers.com/json/map.2.0.php?id=${config.g4gMapId}`);
    const tileInfo = await downloadTiles(config, payload);
    const fullPath = buildComposite(config, payload, tileInfo);
    await cropMissionPlates(config, payload, fullPath);

    const mapItems = generatedMaps(config);
    const assetItems = generatedAssets(config);
    const viewItems = generatedViews(config);
    const packetItems = config.missions.map((mission) => generatedPacket(config, mission));
    const existingGameMarkers = markers.filter((marker) => marker.gameId === config.gameId);
    const markerItems = generateMarkers(config, payload, existingGameMarkers);
    const singleMapItems = generatedSingleMaps(config);
    const singleAssetItems = generatedSingleAssets(config);
    const singleViewItems = generatedSingleViews(config);
    const singlePacketItems = (config.singleMaps || []).map((mission) =>
      generatedSinglePacket(config, mission),
    );
    const singleMarkerItems = [];

    for (const singleMission of config.singleMaps || []) {
      const singlePayload = await fetchJson(
        `https://guides4gamers.com/json/map.2.0.php?id=${singleMission[3]}`,
      );
      await renderSinglePlate(config, singleMission, singlePayload);
      singleMarkerItems.push(
        ...generateSingleMarkers(config, singleMission, singlePayload, existingGameMarkers),
      );
    }

    nextMaps = replaceGeneratedByGame(
      nextMaps,
      [...mapItems, ...singleMapItems],
      (item) => item.gameId === config.gameId,
    );
    nextAssets = replaceGeneratedByGame(
      nextAssets,
      [...assetItems, ...singleAssetItems],
      (item) =>
        item.gameId === config.gameId &&
        item.imported &&
        item.sourceName === "Guides4Gamers",
    );
    nextViews = replaceGeneratedByGame(
      nextViews,
      [...viewItems, ...singleViewItems],
      (item) => item.mapId.startsWith(`${config.gameShort}-`) && item.kind === "surface",
    );
    nextPackets = [
      ...nextPackets.filter((item) =>
        ![...packetItems, ...singlePacketItems].some((packet) => packet.mapId === item.mapId),
      ),
      ...packetItems,
      ...singlePacketItems,
    ];
    nextMarkers.push(...markerItems, ...singleMarkerItems);
  }

  nextMaps = sortReconMaps(nextMaps);
  nextAssets = sortById(nextAssets);
  nextViews = sortById(nextViews);
  nextPackets = [...nextPackets].sort((a, b) => a.mapId.localeCompare(b.mapId));
  nextMarkers = sortById(nextMarkers);

  await writeJson("src/data/recon/maps.json", nextMaps);
  await writeJson("src/data/recon/asset-manifest.json", nextAssets);
  await writeJson("src/data/recon/map-views.json", nextViews);
  await writeJson("src/data/recon/source-packets.json", nextPackets);
  await writeJson("src/data/recon/marker-seeds.json", nextMarkers);

  console.log(
    `${dryRun ? "Dry run" : "Imported"} ${nextMaps.filter((map) => map.gameId.startsWith("sniper-elite")).length} Sniper Elite maps and ${nextMarkers.filter((marker) => marker.gameId.startsWith("sniper-elite")).length} Sniper Elite draft markers.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
