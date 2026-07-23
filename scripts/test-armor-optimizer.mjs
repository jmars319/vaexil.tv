import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ARMOR_STATS,
  addArmorInvestmentStats,
  computeArmorStatCeilings,
  createEmptyArmorStats,
  getArmorSlotFromDefinitionBucket,
  getArmorStatTotal,
} from "../src/lib/armor-optimizer.ts";

function stats(weapons, health = 0) {
  return {
    weapons,
    health,
    class: 0,
    grenade: 0,
    super: 0,
    melee: 0,
  };
}

function piece(id, slot, weapons, options = {}) {
  return {
    id,
    slot,
    isExotic: options.exoticKey != null,
    exoticKey: options.exoticKey ?? null,
    setHash: options.setHash ?? null,
    baseStats: stats(weapons),
  };
}

const pieces = [
  piece("helmet-a", "Helmet", 10, { setHash: 1 }),
  piece("helmet-exotic", "Helmet", 60, { exoticKey: "Helmet:Alpha" }),
  piece("arms-a", "Gauntlets", 20, { setHash: 1 }),
  piece("arms-b", "Gauntlets", 35, { setHash: 2 }),
  piece("chest-a", "Chest Armor", 30, { setHash: 1 }),
  piece("chest-b", "Chest Armor", 45, { setHash: 2 }),
  piece("legs-a", "Leg Armor", 40, { setHash: 1 }),
  piece("legs-b", "Leg Armor", 25, { setHash: 2 }),
  piece("class-a", "Class Item", 50, { setHash: 1 }),
  piece("class-b", "Class Item", 15, { setHash: 2 }),
];

function weaponsCeiling(constraints) {
  return computeArmorStatCeilings(pieces, constraints).find(
    (ceiling) => ceiling.stat === "weapons",
  );
}

assert.deepEqual(
  ARMOR_STATS.map((stat) => stat.key),
  ["weapons", "health", "class", "grenade", "super", "melee"],
);

const accumulated = createEmptyArmorStats();
addArmorInvestmentStats(accumulated, [
  { statTypeHash: 2996146975, value: 18 },
  { statTypeHash: 392767087, value: 12 },
  { statTypeHash: 2135857333, value: 7 },
  { statTypeHash: 3493869314, value: 5 },
  { statTypeHash: 999, value: 100 },
]);
assert.deepEqual(accumulated, {
  weapons: 18,
  health: 12,
  class: 7,
  grenade: 0,
  super: 0,
  melee: 5,
});
assert.equal(getArmorStatTotal(accumulated), 42);
assert.equal(getArmorSlotFromDefinitionBucket(3448274439), "Helmet");
assert.equal(getArmorSlotFromDefinitionBucket(3551918588), "Gauntlets");
assert.equal(getArmorSlotFromDefinitionBucket(14239492), "Chest Armor");
assert.equal(getArmorSlotFromDefinitionBucket(20886954), "Leg Armor");
assert.equal(getArmorSlotFromDefinitionBucket(1585787867), "Class Item");
assert.equal(
  getArmorSlotFromDefinitionBucket(138197802),
  null,
  "the current Vault container is not an armor definition slot",
);

assert.equal(weaponsCeiling({ exotic: "any", sets: [] }).base, 230);
assert.equal(weaponsCeiling({ exotic: "any", sets: [] }).withMajorMods, 200);
assert.equal(weaponsCeiling({ exotic: "none", sets: [] }).base, 180);
assert.equal(
  weaponsCeiling({ exotic: "Helmet:Alpha", sets: [] }).base,
  230,
);
assert.equal(
  weaponsCeiling({ exotic: "Helmet:Alpha", sets: [{ setHash: 1, count: 4 }] })
    .base,
  200,
);
assert.equal(
  weaponsCeiling({ exotic: "any", sets: [{ setHash: 2, count: 4 }] }).base,
  180,
);
assert.equal(
  weaponsCeiling({
    exotic: "any",
    sets: [
      { setHash: 1, count: 2 },
      { setHash: 2, count: 2 },
    ],
  }).base,
  230,
);
assert.equal(
  weaponsCeiling({ exotic: "any", sets: [{ setHash: 999, count: 2 }] }).base,
  null,
);
assert.equal(weaponsCeiling({ exotic: "Helmet:Missing", sets: [] }).base, null);

const manifest = JSON.parse(
  await readFile(
    new URL("../src/data/destiny-armor-manifest.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(typeof manifest.version, "string");
assert.ok(manifest.armor.length > 5_000);
assert.ok(manifest.statPlugs.length > 500);
assert.ok(manifest.armorSets.length > 25);
assert.ok(manifest.setPerks.length > 50);

console.log("Armor optimizer invariants passed.");
