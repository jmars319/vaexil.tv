import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ARMOR_STATS,
  addArmorInvestmentStats,
  computeArmorStatCeilings,
  computeArmorTargetBuilds,
  createEmptyArmorStats,
  getArmorSlotFromDefinitionBucket,
  getArmorStatTotal,
  getSuggestedMajorModCount,
} from "../src/lib/armor-optimizer.ts";
import { toggleArmorSetRequirement } from "../src/lib/armor-constraint-selection.ts";

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

function multiStatPiece(id, slot, values) {
  return {
    id,
    slot,
    isExotic: false,
    exoticKey: null,
    setHash: null,
    baseStats: {
      weapons: values.weapons ?? 0,
      health: values.health ?? 0,
      class: values.class ?? 0,
      grenade: values.grenade ?? 0,
      super: values.super ?? 0,
      melee: values.melee ?? 0,
    },
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
assert.equal(getSuggestedMajorModCount(150, 200), 5);
assert.equal(getSuggestedMajorModCount(180, 200), 2);
assert.equal(getSuggestedMajorModCount(200, 200), 0);
assert.equal(getSuggestedMajorModCount(230, 200), 0);
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

assert.deepEqual(toggleArmorSetRequirement([], { setHash: 1, count: 2 }), [
  { setHash: 1, count: 2 },
]);
assert.deepEqual(
  toggleArmorSetRequirement([{ setHash: 1, count: 2 }], {
    setHash: 1,
    count: 2,
  }),
  [],
);
assert.deepEqual(
  toggleArmorSetRequirement(
    [
      { setHash: 1, count: 2 },
      { setHash: 2, count: 2 },
    ],
    { setHash: 3, count: 4 },
  ),
  [{ setHash: 3, count: 4 }],
  "a 4-piece selection clears every 2-piece selection",
);
assert.deepEqual(
  toggleArmorSetRequirement([{ setHash: 3, count: 4 }], {
    setHash: 2,
    count: 2,
  }),
  [{ setHash: 2, count: 2 }],
  "a 2-piece selection clears an active 4-piece selection",
);
assert.deepEqual(
  toggleArmorSetRequirement(
    [
      { setHash: 1, count: 2 },
      { setHash: 2, count: 2 },
    ],
    { setHash: 3, count: 2 },
  ),
  [
    { setHash: 2, count: 2 },
    { setHash: 3, count: 2 },
  ],
  "a third 2-piece selection replaces the oldest one",
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

const targetChoicePieces = [
  multiStatPiece("helmet-weapons", "Helmet", { weapons: 80 }),
  multiStatPiece("helmet-health", "Helmet", { weapons: 20, health: 60 }),
  multiStatPiece("arms-target", "Gauntlets", { weapons: 30, health: 10 }),
  multiStatPiece("chest-target", "Chest Armor", { weapons: 30, health: 10 }),
  multiStatPiece("legs-target", "Leg Armor", { weapons: 30, health: 10 }),
  multiStatPiece("class-target", "Class Item", { weapons: 30, health: 10 }),
];
const noTargets = createEmptyArmorStats();
const healthTarget = { ...noTargets, health: 100 };
const unconstrainedWeapons = computeArmorTargetBuilds(
  targetChoicePieces,
  { exotic: "any", sets: [] },
  noTargets,
).find((build) => build.stat === "weapons");
const healthConstrainedWeapons = computeArmorTargetBuilds(
  targetChoicePieces,
  { exotic: "any", sets: [] },
  healthTarget,
).find((build) => build.stat === "weapons");
assert.equal(unconstrainedWeapons.withMajorMods, 200);
assert.ok(unconstrainedWeapons.itemIds.includes("helmet-weapons"));
assert.equal(healthConstrainedWeapons.withMajorMods, 190);
assert.ok(healthConstrainedWeapons.itemIds.includes("helmet-health"));
assert.ok(healthConstrainedWeapons.finalStats.health >= 100);

const sharedModPieces = [
  multiStatPiece("helmet-shared", "Helmet", {
    weapons: 40,
    health: 10,
    super: 20,
  }),
  multiStatPiece("arms-shared", "Gauntlets", {
    weapons: 30,
    health: 10,
    super: 20,
  }),
  multiStatPiece("chest-shared", "Chest Armor", {
    weapons: 30,
    health: 10,
    super: 20,
  }),
  multiStatPiece("legs-shared", "Leg Armor", {
    weapons: 30,
    health: 10,
    super: 15,
  }),
  multiStatPiece("class-shared", "Class Item", {
    weapons: 30,
    health: 10,
    super: 15,
  }),
];
const sharedTargets = {
  ...createEmptyArmorStats(),
  weapons: 200,
  super: 100,
};
const sharedHealthBuild = computeArmorTargetBuilds(
  sharedModPieces,
  { exotic: "any", sets: [] },
  sharedTargets,
).find((build) => build.stat === "health");
assert.equal(sharedHealthBuild.withMajorMods, 50);
assert.equal(sharedHealthBuild.finalStats.weapons, 200);
assert.equal(sharedHealthBuild.finalStats.super, 100);
assert.equal(sharedHealthBuild.modCounts.weapons, 4);
assert.equal(sharedHealthBuild.modCounts.super, 1);
assert.equal(getArmorStatTotal(sharedHealthBuild.modCounts), 5);

const conflictingTargets = {
  ...createEmptyArmorStats(),
  weapons: 200,
  super: 110,
};
const conflictingBuilds = computeArmorTargetBuilds(
  sharedModPieces,
  { exotic: "any", sets: [] },
  conflictingTargets,
);
const conflictingWeapons = conflictingBuilds.find(
  (build) => build.stat === "weapons",
);
const conflictingSuper = conflictingBuilds.find(
  (build) => build.stat === "super",
);
assert.equal(conflictingWeapons.potential, 190);
assert.equal(conflictingWeapons.withMajorMods, null);
assert.equal(conflictingSuper.potential, 100);
assert.equal(conflictingSuper.withMajorMods, null);
assert.ok(conflictingBuilds.every((build) => build.base === null));

const impossibleTargets = {
  ...createEmptyArmorStats(),
  weapons: 200,
  health: 200,
};
assert.ok(
  computeArmorTargetBuilds(
    sharedModPieces,
    { exotic: "any", sets: [] },
    impossibleTargets,
  ).every((build) => build.base === null),
);

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
