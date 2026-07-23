import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BUNGIE_ROOT = "https://www.bungie.net";
const BUNGIE_PLATFORM_ROOT = `${BUNGIE_ROOT}/Platform`;
const ARMOR_ITEM_TYPE = 2;
const MOD_ITEM_TYPE = 19;
const ARMOR_STAT_HASHES = new Set([
  2996146975, // Weapons
  392767087, // Health
  1943323491, // Class
  2135857333, // Class (alternate)
  1735777505, // Grenade
  144602215, // Super
  4244567218, // Melee
  3493869314, // Melee (alternate)
]);

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(
  scriptDirectory,
  "../src/data/destiny-armor-manifest.json",
);

function requireApiKey() {
  const apiKey = process.env.BUNGIE_API_KEY?.trim() ?? "";
  if (!apiKey) {
    throw new Error("BUNGIE_API_KEY is required to refresh the armor manifest.");
  }

  return apiKey;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Manifest request failed with status ${response.status}.`);
  }

  return response.json();
}

function simplifyInvestmentStats(investmentStats = []) {
  return investmentStats
    .filter(
      (stat) =>
        ARMOR_STAT_HASHES.has(stat.statTypeHash) && Number(stat.value) !== 0,
    )
    .map((stat) => ({
      statTypeHash: stat.statTypeHash,
      value: stat.value,
    }));
}

async function main() {
  const manifestEnvelope = await fetchJson(
    `${BUNGIE_PLATFORM_ROOT}/Destiny2/Manifest/`,
    {
      headers: { "X-API-Key": requireApiKey() },
    },
  );
  const manifest = manifestEnvelope.Response;
  const paths = manifest?.jsonWorldComponentContentPaths?.en;

  if (!manifest?.version || !paths) {
    throw new Error("Bungie returned an incomplete Destiny manifest.");
  }

  const [itemDefinitions, setDefinitions, sandboxPerkDefinitions] =
    await Promise.all([
      fetchJson(`${BUNGIE_ROOT}${paths.DestinyInventoryItemDefinition}`),
      fetchJson(`${BUNGIE_ROOT}${paths.DestinyEquipableItemSetDefinition}`),
      fetchJson(`${BUNGIE_ROOT}${paths.DestinySandboxPerkDefinition}`),
    ]);

  const armor = [];
  const armorHashes = new Set();
  const statPlugs = [];

  for (const definition of Object.values(itemDefinitions)) {
    if (
      definition.itemType === ARMOR_ITEM_TYPE &&
      definition.inventory?.bucketTypeHash &&
      !definition.redacted
    ) {
      armorHashes.add(definition.hash);
      armor.push({
        hash: definition.hash,
        name: definition.displayProperties?.name || "Unknown Armor",
        icon: definition.displayProperties?.icon || null,
        itemTypeDisplayName: definition.itemTypeDisplayName || "Armor",
        bucketHash: definition.inventory.bucketTypeHash,
        classType: definition.classType,
        tierType: definition.inventory.tierType,
        tierTypeName: definition.inventory.tierTypeName || "Unknown",
        isFeatured: Boolean(definition.isFeaturedItem),
        investmentStats: simplifyInvestmentStats(definition.investmentStats),
      });
      continue;
    }

    if (definition.itemType !== MOD_ITEM_TYPE) {
      continue;
    }

    const investmentStats = simplifyInvestmentStats(definition.investmentStats);
    if (investmentStats.length > 0) {
      statPlugs.push({
        hash: definition.hash,
        name: definition.displayProperties?.name || "Armor Stat Plug",
        investmentStats,
      });
    }
  }

  const armorSets = Object.values(setDefinitions)
    .filter(
      (definition) =>
        !definition.redacted &&
        definition.setItems?.some((itemHash) => armorHashes.has(itemHash)),
    )
    .map((definition) => ({
      hash: definition.hash,
      name: definition.displayProperties?.name || "Armor Set",
      setItems: definition.setItems || [],
      setPerks: (definition.setPerks || []).map((perk) => ({
        requiredSetCount: perk.requiredSetCount,
        sandboxPerkHash: perk.sandboxPerkHash,
      })),
    }));

  const setPerkHashes = new Set(
    armorSets.flatMap((set) =>
      set.setPerks.map((perk) => perk.sandboxPerkHash),
    ),
  );
  const setPerks = [...setPerkHashes]
    .map(
      (hash) =>
        sandboxPerkDefinitions[String(hash)] || sandboxPerkDefinitions[hash],
    )
    .filter(Boolean)
    .map((definition) => ({
      hash: definition.hash,
      name: definition.displayProperties?.name || "Set Bonus",
      description: definition.displayProperties?.description || "",
      icon: definition.displayProperties?.icon || null,
    }));

  armor.sort((left, right) => left.hash - right.hash);
  statPlugs.sort((left, right) => left.hash - right.hash);
  armorSets.sort((left, right) => left.hash - right.hash);
  setPerks.sort((left, right) => left.hash - right.hash);

  const output = {
    version: manifest.version,
    generatedAt: new Date().toISOString(),
    armor,
    statPlugs,
    armorSets,
    setPerks,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output)}\n`, "utf8");

  console.log(
    `[destiny-manifest] Wrote ${armor.length} armor definitions, ${statPlugs.length} stat plugs, and ${armorSets.length} armor sets for ${manifest.version}.`,
  );
}

await main();
