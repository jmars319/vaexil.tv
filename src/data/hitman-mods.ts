export type HitmanModEntry = {
  title: string;
  sourceUrl: string;
  category: string;
  summary: string;
  note?: string;
};

export type HitmanLoadOrderEntry = HitmanModEntry & {
  loadOrder: number;
  status: "active" | "temporary";
};

export const modFramework: HitmanModEntry = {
  title: "Simple Mod Framework",
  sourceUrl: "https://www.nexusmods.com/hitman3/mods/200",
  category: "Required framework",
  summary:
    "Use SMF to import, order, deploy, and update the rest of the mod stack.",
  note: "Install this first. The listed load order assumes SMF deployment.",
};

export const activeHitmanMods: HitmanLoadOrderEntry[] = [
  {
    loadOrder: 1,
    title: "Hitman World of Assassination Unofficial Community Patch",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/784",
    category: "Bug fixes",
    summary: "Community-maintained bug-fix patch for World of Assassination.",
    status: "active",
  },
  {
    loadOrder: 2,
    title: "Misc Outfit Mesh and Texture fixes 1.5.91",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/84",
    category: "Outfit fixes",
    summary: "Mesh and texture cleanup for outfit issues.",
    status: "active",
  },
  {
    loadOrder: 3,
    title: "Readable UI",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/26",
    category: "Interface",
    summary: "UI readability pass for objective text and minimap clarity.",
    status: "active",
  },
  {
    loadOrder: 4,
    title: "Signature Suit mod compatibility fix for Untouchable",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/646",
    category: "Compatibility",
    summary:
      "Compatibility fix for Signature Suit replacements in Untouchable cutscenes.",
    status: "active",
  },
  {
    loadOrder: 5,
    title: "Hitman 3 Signature Suits Ties Upgraded",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/844",
    category: "Suit detail",
    summary: "Visual upgrade for Signature Suit ties and related suit details.",
    status: "active",
  },
  {
    loadOrder: 6,
    title: "Winter Suit to Black Winter Suit",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/308",
    category: "Suit replacement",
    summary: "Replaces the Winter Suit with the Black Winter Suit.",
    status: "active",
  },
  {
    loadOrder: 7,
    title:
      "Solstice Suit Replaces Futo Suit Signature Suit or Freedom Phantom Suit",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/81",
    category: "Suit replacement",
    summary: "Optional Solstice Suit replacement currently in the stack.",
    note: "Marked temporary because it may leave this list soon.",
    status: "temporary",
  },
  {
    loadOrder: 8,
    title: "The Modest Freelancer Suit",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/459",
    category: "Freelancer suit",
    summary: "Freelancer suit presentation tweak.",
    status: "active",
  },
  {
    loadOrder: 9,
    title: "Should've Gone to Specsavers (Glasses Fix)",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/780",
    category: "Accessory fix",
    summary: "Fix for glasses lens visuals affected by a game patch.",
    status: "active",
  },
  {
    loadOrder: 10,
    title: "Accent Overhaul",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/242",
    category: "Audio",
    summary: "Accent replacement and voice-set pass for selected NPCs.",
    status: "active",
  },
  {
    loadOrder: 11,
    title: "Lighting Ultimate",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/45",
    category: "Lighting",
    summary: "Lighting, sky, weather, and visual consistency pass.",
    status: "active",
  },
  {
    loadOrder: 12,
    title: "Downright Excessive Renaming Project",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/486",
    category: "Text cleanup",
    summary: "Large naming and UI text cleanup project.",
    status: "active",
  },
];

export const problematicHitmanMods: HitmanModEntry[] = [
  {
    title: "Better Silenced Pistol Sounds",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/602",
    category: "Audio",
    summary: "Confirmed bad in the current Vaexil setup.",
    note: "Avoid for now. It broke the game instead of improving it.",
  },
  {
    title: "Better Unsilenced Pistol Sounds",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/603",
    category: "Audio",
    summary: "Confirmed bad in the current Vaexil setup.",
    note: "Avoid for now. It broke the game instead of improving it.",
  },
];
