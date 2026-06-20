import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const gameArgs = process.argv.slice(2).flatMap((arg, index, args) => {
  if (arg === "--game" && args[index + 1]) return [args[index + 1]];
  if (arg.startsWith("--game=")) return [arg.slice("--game=".length)];
  return [];
});

const gameConfigs = {
  "sniper-elite-5": {
    gameId: "sniper-elite-5",
    gameShort: "se5",
    sourcePath: "sniper-elite-5",
    campaignMapId: 144,
    campaignSourceUrl: "https://guides4gamers.com/sniper-elite-5/maps/campaign-maps/",
    sourceName: "Guides4Gamers Sniper Elite 5 Campaign Maps",
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
    campaignMapId: 237,
    campaignSourceUrl: "https://guides4gamers.com/sniper-elite-resistance/maps/campaign-maps/",
    sourceName: "Guides4Gamers Sniper Elite: Resistance Campaign Maps",
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
    singleMaps: [
      ["lights-camera-achtung", "Lights, Camera, Achtung!", "Target Führer DLC", 238],
      ["vercors-vendetta", "Vercors Vendetta", "DLC Mission", 247],
      ["striking-range", "Striking Range", "DLC Mission", 250],
      ["mud-and-thunder", "Mud and Thunder", "DLC Mission", 273],
    ],
  },
};

const selectedConfigs = gameArgs.length > 0
  ? gameArgs.map((gameId) => {
      const config = gameConfigs[gameId];
      if (!config) throw new Error(`No Guides4Gamers audit config matched ${gameId}`);
      return config;
    })
  : Object.values(gameConfigs);

const categoryBySubcategory = new Map([
  ["Alarm", ["alarm", "alarm"]],
  ["Alarm Sirens", ["alarm_siren", "alarm"]],
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
  ["Vehicle", ["vehicle", "vehicle"]],
  ["Weapon", ["weapon", "weapon"]],
  ["Workbench", ["workbench", "workbench"]],
]);

const categoryByLabel = new Map([
  ["Administration Safe", ["key_or_code", "key"]],
  ["Armored Vehicle", ["vehicle", "vehicle"]],
  ["Armoury Door", ["passage", "entrance"]],
  ["Bolt Cutters", ["bolt_cutters", "bolt-cutters"]],
  ["Crowbar", ["crowbar", "crowbar"]],
  ["Documents", ["classified_document", "document"]],
  ["Erich Windolf", ["kill_list_target", "target"]],
  ["Locked Door", ["passage", "entrance"]],
  ["Maintenance Tunnel Door", ["passage", "entrance"]],
  ["Maintenance Tunnel Door #2", ["passage", "entrance"]],
  ["Poison", ["poison_pickup", "poison"]],
  ["Rat Bomb", ["explosives", "explosive"]],
  ["Vogels Saferoom", ["passage", "entrance"]],
]);

const markerOverrides = new Map([
  ["g4g-se5-atlantic-wall-37260", { x: 80.7, y: 80.4 }],
  ["g4g-se5-atlantic-wall-37590", { x: 78.4, y: 77.2 }],
]);

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function round4(value) {
  return Math.round(value * 10_000) / 10_000;
}

function missionId(config, mission) {
  return `${config.gameShort}-${mission[0]}`;
}

function singleSourceUrl(config, mission) {
  return `https://guides4gamers.com/${config.sourcePath}/maps/${mission[0]}/`;
}

function markerLabel(poi) {
  if (poi.name) return String(poi.name).replace(/^M\d{2}:\s*/i, "").trim();
  return poi.name_sub || "Draft marker";
}

function markerCategoryAndIcon(poi) {
  const labelMapped = categoryByLabel.get(markerLabel(poi));
  if (labelMapped) return labelMapped;
  return categoryBySubcategory.get(poi.name_sub) || ["poi", "poi"];
}

function applyMarkerOverrides(marker) {
  const override = markerOverrides.get(marker.id);
  return override ? { ...marker, ...override } : marker;
}

async function fetchMapPayload(mapId) {
  const url = `https://guides4gamers.com/json/map.2.0.php?id=${mapId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

function expectedCampaignMarkers(config, payload) {
  const cellSize = payload.map.width / 3;
  const output = [];

  for (const [index, mission] of config.missions.entries()) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const minX = col * cellSize;
    const maxX = (col + 1) * cellSize;
    const minY = row * cellSize;
    const maxY = (row + 1) * cellSize;

    for (const [sourceMarkerId, poi] of Object.entries(payload.pois)) {
      if (poi.x < minX || poi.x >= maxX || poi.y < minY || poi.y >= maxY) continue;
      const [category, iconKey] = markerCategoryAndIcon(poi);
      output.push(applyMarkerOverrides({
        id: `g4g-${config.gameShort}-${mission[0]}-${sourceMarkerId}`,
        mapId: missionId(config, mission),
        missionSlug: mission[0],
        sourceMarkerId,
        category,
        iconKey,
        subcategory: poi.name_sub || null,
        label: markerLabel(poi),
        x: round4(((poi.x - minX) / cellSize) * 100),
        y: round4(((poi.y - minY) / cellSize) * 100),
        sourceName: config.sourceName,
        sourceUrl: `${config.campaignSourceUrl}#mark-${sourceMarkerId}`,
      }));
    }
  }

  return output;
}

function expectedSingleMarkers(config, mission, payload) {
  return Object.entries(payload.pois).map(([sourceMarkerId, poi]) => {
    const [category, iconKey] = markerCategoryAndIcon(poi);
    return {
      id: `g4g-${config.gameShort}-${mission[0]}-${sourceMarkerId}`,
      mapId: missionId(config, mission),
      missionSlug: mission[0],
      sourceMarkerId,
      category,
      iconKey,
      subcategory: poi.name_sub || null,
      label: markerLabel(poi),
      x: round4((poi.x / payload.map.width) * 100),
      y: round4((poi.y / payload.map.height) * 100),
      sourceName: `${config.sourceName} - ${mission[1]}`,
      sourceUrl: `${singleSourceUrl(config, mission)}#mark-${sourceMarkerId}`,
    };
  });
}

function assertNear(actual, expected, context, failures) {
  if (Math.abs(Number(actual) - Number(expected)) > 0.0001) {
    failures.push(`${context}: expected ${expected}, found ${actual}`);
  }
}

const [maps, markers, icons] = [
  readJson("src/data/recon/maps.json"),
  readJson("src/data/recon/marker-seeds.json"),
  readJson("src/data/recon/icon-manifest.json"),
];
const categoryRegistry = `${readFileSync(path.join(root, "src/data/recon/category-registry.ts"), "utf8")}\n${readFileSync(path.join(root, "src/data/recon/sniper-elite-legacy-categories.ts"), "utf8")}`;
const iconKeys = new Map(icons.map((icon) => [icon.key, icon]));
const failures = [];
const totalCountsByGame = new Map();

for (const config of selectedConfigs) {
  const mapIds = new Set(maps.filter((map) => map.gameId === config.gameId).map((map) => map.id));
  const localMarkers = markers.filter(
    (marker) => marker.gameId === config.gameId && marker.id.startsWith(`g4g-${config.gameShort}-`),
  );
  const localById = new Map(localMarkers.map((marker) => [marker.id, marker]));
  const countsByMap = new Map();

  let expectedMarkers = expectedCampaignMarkers(config, await fetchMapPayload(config.campaignMapId));
  for (const singleMap of config.singleMaps) {
    expectedMarkers.push(...expectedSingleMarkers(config, singleMap, await fetchMapPayload(singleMap[3])));
  }
  const expectedById = new Map(expectedMarkers.map((marker) => [marker.id, marker]));

  for (const expected of expectedMarkers) {
    countsByMap.set(expected.mapId, (countsByMap.get(expected.mapId) || 0) + 1);

    if (!mapIds.has(expected.mapId)) {
      failures.push(`${expected.id}: expected map ${expected.mapId} is not registered`);
    }

    const icon = iconKeys.get(expected.iconKey);
    if (!icon) {
      failures.push(`${expected.id}: expected icon ${expected.iconKey} is not registered`);
    } else if (!existsSync(path.join(root, icon.path.replace(/^\//, "public/")))) {
      failures.push(`${expected.id}: expected icon file is missing at ${icon.path}`);
    }

    if (!categoryRegistry.includes(`key: "${expected.category}"`)) {
      failures.push(`${expected.id}: expected category ${expected.category} is not registered`);
    }

    const local = localById.get(expected.id);
    if (!local) {
      failures.push(`${expected.id}: missing local marker`);
      continue;
    }

    for (const key of ["gameId", "mapId", "sourceMarkerId", "category", "iconKey", "subcategory", "label", "sourceName", "sourceUrl"]) {
      const expectedValue = key === "gameId" ? config.gameId : expected[key];
      if ((local[key] ?? null) !== (expectedValue ?? null)) {
        failures.push(`${expected.id}: ${key} expected ${JSON.stringify(expectedValue)}, found ${JSON.stringify(local[key] ?? null)}`);
      }
    }

    assertNear(local.x, expected.x, `${expected.id} x`, failures);
    assertNear(local.y, expected.y, `${expected.id} y`, failures);

    for (const tag of ["guides4gamers", expected.missionSlug, "draft-import"]) {
      if (!Array.isArray(local.tags) || !local.tags.includes(tag)) {
        failures.push(`${expected.id}: missing tag ${tag}`);
      }
    }
  }

  for (const local of localMarkers) {
    if (!expectedById.has(local.id)) {
      failures.push(`${local.id}: extra local marker not present in live Guides4Gamers payload`);
    }
  }

  totalCountsByGame.set(config.gameId, { count: expectedMarkers.length, countsByMap });
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[g4g-sniper-elite:fail] ${failure}`);
  }
  process.exit(1);
}

for (const [gameId, { count, countsByMap }] of totalCountsByGame) {
  console.log(`[g4g-sniper-elite] Live Guides4Gamers marker audit passed for ${gameId}`);
  console.log(`[g4g-sniper-elite] ${count} markers represented across ${countsByMap.size} maps`);
  for (const [mapId, mapCount] of [...countsByMap].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`[g4g-sniper-elite] ${mapId}: ${mapCount}`);
  }
}
