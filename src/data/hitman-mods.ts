export type HitmanModEntry = {
  title: string;
  creator: string;
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
  creator: "Atampy26",
  sourceUrl: "https://www.nexusmods.com/hitman3/mods/200",
  category: "Required framework",
  summary:
    "The standard HITMAN 3 mod manager for importing framework zips, handling compatibility, managing updates, and deploying the stack with Apply.",
  note: "Install this first. The listed load order assumes SMF deployment.",
};

export const activeHitmanMods: HitmanLoadOrderEntry[] = [
  {
    loadOrder: 1,
    title: "Hitman World of Assassination Unofficial Community Patch",
    creator: "OceanMinnow",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/784",
    category: "Bug fixes",
    summary:
      "Community patch focused on objective bug fixes, with subjective or controversial fixes exposed as toggles where possible.",
    status: "active",
  },
  {
    loadOrder: 2,
    title: "Misc Outfit Mesh and Texture fixes 1.5.91",
    creator: "HMBM47",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/84",
    category: "Outfit fixes",
    summary:
      "Mesh and texture repair pass for 47 and NPC outfits, including clipping, missing body parts, crash fixes, and broken material details.",
    status: "active",
  },
  {
    loadOrder: 3,
    title: "Readable UI",
    creator: "Atampy26",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/26",
    category: "Interface",
    summary:
      "Improves objective text size, minimap readability, NPC dot visibility, and removes most all-caps UI text.",
    status: "active",
  },
  {
    loadOrder: 4,
    title: "Signature Suit mod compatibility fix for Untouchable",
    creator: "musicalmushr00m",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/646",
    category: "Compatibility",
    summary:
      "Prevents most Signature Suit replacement mods from crashing or blocking Untouchable cutscenes. Does not include a suit swap.",
    status: "active",
  },
  {
    loadOrder: 5,
    title: "Hitman 3 Signature Suits Ties Upgraded",
    creator: "LtOmG",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/844",
    category: "Suit detail",
    summary:
      "Upgrades tie presentation on Signature suits and selected coats, with related button-detail adjustments.",
    status: "active",
  },
  {
    loadOrder: 6,
    title: "Winter Suit to Black Winter Suit",
    creator: "BodhiBegins",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/308",
    category: "Suit replacement",
    summary:
      "Simple suit replacement that swaps the Winter Suit for the Black Winter Suit.",
    status: "active",
  },
  {
    loadOrder: 7,
    title:
      "Solstice Suit Replaces Futo Suit Signature Suit or Freedom Phantom Suit",
    creator: "georgikens",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/81",
    category: "Suit replacement",
    summary:
      "Replaces one selected suit slot with the unreleased Solstice Suit. Kept here as a temporary current-stack entry.",
    note: "Marked temporary because it may leave this list soon.",
    status: "temporary",
  },
  {
    loadOrder: 8,
    title: "The Modest Freelancer Suit",
    creator: "AnthonyFuller",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/459",
    category: "Freelancer suit",
    summary:
      "Removes the Level 100 emblem from the back of The Master Freelancer Suit.",
    status: "active",
  },
  {
    loadOrder: 9,
    title: "Should've Gone to Specsavers (Glasses Fix)",
    creator: "AnthonyFuller",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/780",
    category: "Accessory fix",
    summary:
      "Restores glasses lens materials that were accidentally turned into sunglass-style lenses in patch 3.190.0.",
    status: "active",
  },
  {
    loadOrder: 10,
    title: "Accent Overhaul",
    creator: "KevinRuddMP",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/242",
    category: "Audio",
    summary:
      "Reassigns many NPC voice sets so international locations use more fitting accents and, in Hokkaido, more Japanese dialogue.",
    status: "active",
  },
  {
    loadOrder: 11,
    title: "Lighting Ultimate",
    creator: "musicalmushr00m",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/45",
    category: "Lighting",
    summary:
      "Lighting overhaul aimed at clearer visibility, better accessibility, and stronger visual consistency across locations.",
    status: "active",
  },
  {
    loadOrder: 12,
    title: "Downright Excessive Renaming Project",
    creator: "VoodooHillbilly",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/486",
    category: "Text cleanup",
    summary:
      "Large localization pass that shortens, standardizes, and cleans up suit, firearm, gear, and capitalization text.",
    status: "active",
  },
];

export const problematicHitmanMods: HitmanModEntry[] = [
  {
    title: "Better Silenced Pistol Sounds",
    creator: "Jackleno567",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/602",
    category: "Audio",
    summary:
      "Raises suppressed pistol audio to sound louder and more realistic, but is not compatible with the current Vaexil setup.",
    note: "Avoid for now. It broke the game instead of improving it.",
  },
  {
    title: "Better Unsilenced Pistol Sounds",
    creator: "Jackleno567",
    sourceUrl: "https://www.nexusmods.com/hitman3/mods/603",
    category: "Audio",
    summary:
      "Applies a similar louder, more realistic audio treatment to unsuppressed pistols, but is not compatible with the current Vaexil setup.",
    note: "Avoid for now. It broke the game instead of improving it.",
  },
];
