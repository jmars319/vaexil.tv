export const supportedGameIds = new Set([
  "sniper-elite-v2-remastered",
  "sniper-elite-3",
  "sniper-elite-4",
]);

export function categoryMapFor(config, categoryTitle) {
  const shared = {
    "Mission Start": ["starting_location", "entrance"],
    "Vantage Point": ["sniper", "weapon"],
    Weapon: ["weapon", "weapon"],
    Explosives: ["explosives", "explosive"],
    "Supply Crate": ["supply_pouch", "supply"],
    Miscellaneous: ["poi", "poi"],
    Safe: ["key_or_code", "key"],
  };

  const byGame = {
    "sniper-elite-v2-remastered": {
      "Gold Bar": ["gold_bar", "item"],
      "Wine Bottle": ["wine_bottle", "item"],
      "Ammo Box": ["ammunition", "ammo"],
    },
    "sniper-elite-3": {
      "Collectible Card": ["collectible_card", "document"],
      "Long Shot": ["long_shot", "target"],
      "Sniper Nest": ["sniper_nest", "weapon"],
      "War Diary": ["war_diary", "document"],
      "Weapon Part": ["weapon_part", "weapon"],
      Generator: ["fuse_box", "fuse-box"],
      "Main Objective": ["main_objective", "objective"],
      "Optional Objective": ["optional_objective", "objective"],
    },
    "sniper-elite-4": {
      "Deadeye Target": ["deadeye_target", "target"],
      Document: ["misc_document", "document"],
      "Duty Roster": ["duty_roster", "document"],
      "Last Letter": ["last_letter", "document"],
      "Letter from Home": ["letter_from_home", "document"],
      "Letter to Home": ["letter_to_home", "document"],
      "Sniper Report": ["sniper_report", "document"],
      "Ammo Box": ["ammo_box", "ammo"],
      Challenge: ["medal_related", "medal"],
      Generator: ["generator", "fuse-box"],
      "Primary Objective": ["main_objective", "objective"],
      "Optional Objective": ["optional_objective", "objective"],
    },
  };

  return byGame[config.gameId]?.[categoryTitle] || shared[categoryTitle] || ["poi", "poi"];
}

function missionBase(config, slug, title, regionSlug = slug) {
  return {
    slug,
    title,
    mapId: `${config.prefix}-${slug}`,
    assetId: `mapgenie-${config.prefix}-${slug}-source`,
    assetPath: `private/recon/maps/${config.gameId}/${slug}-mapgenie-source.jpg`,
    regionSlug,
  };
}

const v2RegionTitles = new Map([
  ["schoneberg-convoy", "schonberg-convoy"],
  ["mittelwerk-facility", "mittlewerk-facility"],
]);

const se4GridBounds = {
  "san-celini-island": {
    west: -1.043354752962216,
    east: -0.9032790693685229,
    south: 1.0051230017872257,
    north: 1.121832610768294,
  },
  "bitanti-village": {
    west: -0.8574733956066893,
    east: -0.72685551668485,
    south: 1.0029565498270046,
    north: 1.1229220718329458,
  },
  "regilino-viaduct": {
    west: -0.674552613618971,
    east: -0.5466073399274762,
    south: 1.0012189770324227,
    north: 1.12259407779581,
  },
  "lorino-dockyard": {
    west: -0.4947719165689364,
    east: -0.3629168601163144,
    south: 0.9935531713694132,
    north: 1.124438551315265,
  },
  "abrunza-monastery": {
    west: -0.9572837858752621,
    east: -0.8202863000110483,
    south: 0.8691737525685568,
    north: 0.9848854091349466,
  },
  "magazzeno-facility": {
    west: -0.7719986706671307,
    east: -0.6375852575530132,
    south: 0.8676795201014613,
    north: 0.9852758601898444,
  },
  "giovi-fiorini-mansion": {
    west: -0.589781524997079,
    east: -0.43024620992613904,
    south: 0.8562828155101556,
    north: 0.9857666057994123,
  },
  "allagra-fortress": {
    west: -0.7863607248853839,
    east: -0.6232648461764256,
    south: 0.7237215367500909,
    north: 0.8510639491886423,
  },
  "target-fuhrer": {
    west: -0.7752461624027376,
    east: -0.6302330732546579,
    south: 0.5239373893049333,
    north: 0.6542586919110818,
  },
  "deathstorm-inception": {
    west: -0.9758040453355932,
    east: -0.792597964883214,
    south: 0.3875627365802927,
    north: 0.5164387802902439,
  },
  "deathstorm-infiltration": {
    west: -0.7752461624027376,
    east: -0.6302330732546579,
    south: 0.3875627365802927,
    north: 0.5164387802902439,
  },
  "deathstorm-obliteration": {
    west: -0.6081367442146188,
    east: -0.42163395355652256,
    south: 0.3875627365802927,
    north: 0.5164387802902439,
  },
};

export const configs = [
  {
    gameId: "sniper-elite-v2-remastered",
    prefix: "sev2r",
    sourceSlug: "sniper-elite-v2-germany",
    sourceName: "MapGenie Sniper Elite V2 Germany Map",
    mapGenieUrl: "https://mapgenie.io/sniper-elite-v2/maps/germany",
    tileZoom: 13,
    officialLabel: "Rebellion - Sniper Elite V2 Remastered",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-v2-remastered",
    assignment: "region",
    secondarySources: [
      {
        label: "GameMappers Sniper Elite V2 map article",
        url: "https://gamemappers.com/sniper-elite-v2-map/",
        coverage: "mapgenie_category_scope_reference",
        note: "MapGenie-backed source context only; no GameMappers UI, prose, screenshots, or marker text is imported separately.",
      },
    ],
    missions: [
      ["prologue", "Prologue"],
      ["schoneberg-convoy", "Schöneberg Convoy"],
      ["mittelwerk-facility", "Mittelwerk Facility"],
      ["kaiser-friedrich-museum", "Kaiser-Friedrich Museum"],
      ["opernplatz", "Opernplatz"],
      ["st-olibartus-church", "St. Olibartus Church"],
      ["tiergarten-flak-tower", "Tiergarten Flak Tower"],
      ["karlshorst-command-post", "Karlshorst Command Post"],
      ["kreuzberg-headquarters", "Kreuzberg Headquarters"],
      ["kopenick-launch-site", "Köpenick Launch Site"],
      ["brandenburg-gate", "Brandenburg Gate"],
    ].map(([slug, title]) =>
      missionBase(
        { prefix: "sev2r", gameId: "sniper-elite-v2-remastered" },
        slug,
        title,
        v2RegionTitles.get(slug) || slug,
      ),
    ),
  },
  {
    gameId: "sniper-elite-3",
    prefix: "se3",
    sourceSlug: "sniper-elite-3-afrika",
    sourceName: "MapGenie Sniper Elite 3 Afrika Map",
    mapGenieUrl: "https://mapgenie.io/sniper-elite-3/maps/afrika",
    officialLabel: "Rebellion - Sniper Elite 3",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-3",
    assignment: "region",
    secondarySources: [
      {
        label: "GameMappers Sniper Elite 3 map article",
        url: "https://gamemappers.com/sniper-elite-3-map/",
        coverage: "mapgenie_category_scope_reference",
        note: "MapGenie-backed source context only; no GameMappers UI, prose, screenshots, or marker text is imported separately.",
      },
      {
        label: "PowerPyx Sniper Elite 3 strategy guide",
        url: "https://www.powerpyx.com/guides/sniper_elite_3.html",
        coverage: "collectible_count_reference",
        note: "Count/category sanity check only; no guide prose, screenshots, routes, video content, or positions are imported.",
      },
    ],
    missions: [
      ["siege-of-tobruk", "Siege of Tobruk"],
      ["gaberoun", "Gaberoun"],
      ["halfaya-pass", "Halfaya Pass"],
      ["fort-rifugio", "Fort Rifugio"],
      ["siwa-oasis", "Siwa Oasis"],
      ["kasserine-pass", "Kasserine Pass"],
      ["ponts-du-fahs-airfield", "Ponts Du Fahs Airfield"],
      ["ratte-factory", "Ratte Factory"],
      ["hunt-the-grey-wolf", "Hunt The Grey Wolf"],
      ["in-shadows", "In Shadows"],
      ["belly-of-the-beast", "Belly of the Beast"],
      ["confrontation", "Confrontation"],
    ].map(([slug, title]) =>
      missionBase({ prefix: "se3", gameId: "sniper-elite-3" }, slug, title),
    ),
  },
  {
    gameId: "sniper-elite-4",
    prefix: "se4",
    sourceSlug: "sniper-elite-4-italia",
    sourceName: "MapGenie Sniper Elite 4 Italia Map",
    mapGenieUrl: "https://mapgenie.io/sniper-elite-4/maps/italia",
    officialLabel: "Rebellion - Sniper Elite 4",
    officialUrl: "https://shop.rebellion.com/products/sniper-elite-4",
    assignment: "bounds",
    secondarySources: [
      {
        label: "sniperelite4maps.de",
        url: "https://sniperelite4maps.de/h/",
        coverage: "secondary_visual_and_category_reference",
        note: "Secondary campaign/DLC map source for manual visual/category comparison only; map files, app data, coordinates, UI, icons, and text are not imported.",
      },
      {
        label: "sniperelite4maps GitHub repository",
        url: "https://github.com/lordfiSh/sniperelite4maps",
        coverage: "secondary_source_package_reference",
        note: "Repository/source package availability is recorded for review only; code, map assets, marker data, descriptions, and UI are not reused.",
      },
    ],
    missions: [
      ["san-celini-island", "San Celini Island"],
      ["bitanti-village", "Bitanti Village"],
      ["regilino-viaduct", "Regilino Viaduct"],
      ["lorino-dockyard", "Lorino Dockyard"],
      ["abrunza-monastery", "Abrunza Monastery"],
      ["magazzeno-facility", "Magazzeno Facility"],
      ["giovi-fiorini-mansion", "Giovi Fiorini Mansion"],
      ["allagra-fortress", "Allagra Fortress"],
      ["target-fuhrer", "Target Führer"],
      ["deathstorm-inception", "Deathstorm Part 1: Inception"],
      ["deathstorm-infiltration", "Deathstorm Part 2: Infiltration"],
      ["deathstorm-obliteration", "Deathstorm Part 3: Obliteration"],
    ].map(([slug, title]) => ({
      ...missionBase({ prefix: "se4", gameId: "sniper-elite-4" }, slug, title),
      bounds: se4GridBounds[slug],
    })),
  },
];
