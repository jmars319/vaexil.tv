export const ARMOR_STATS = [
  { key: "weapons", label: "Weapons", hashes: [2996146975] },
  { key: "health", label: "Health", hashes: [392767087] },
  { key: "class", label: "Class", hashes: [1943323491, 2135857333] },
  { key: "grenade", label: "Grenade", hashes: [1735777505] },
  { key: "super", label: "Super", hashes: [144602215] },
  { key: "melee", label: "Melee", hashes: [4244567218, 3493869314] },
] as const;

export type ArmorStatKey = (typeof ARMOR_STATS)[number]["key"];
export type ArmorStats = Record<ArmorStatKey, number>;

export const ARMOR_STAT_TARGET_PARAMS: Record<ArmorStatKey, string> = {
  weapons: "targetWeapons",
  health: "targetHealth",
  class: "targetClass",
  grenade: "targetGrenade",
  super: "targetSuper",
  melee: "targetMelee",
};

export function createEmptyArmorStats(): ArmorStats {
  return {
    weapons: 0,
    health: 0,
    class: 0,
    grenade: 0,
    super: 0,
    melee: 0,
  };
}
