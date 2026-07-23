import manifestJson from "@/data/destiny-armor-manifest.json";
import type { ArmorInvestmentStat } from "@/lib/armor-optimizer";
import "server-only";

const BUNGIE_ROOT = "https://www.bungie.net";

export type DestinyArmorDefinition = {
  hash: number;
  name: string;
  icon: string | null;
  itemTypeDisplayName: string;
  bucketHash: number;
  classType: number;
  tierType: number;
  tierTypeName: string;
  isFeatured: boolean;
  investmentStats: ArmorInvestmentStat[];
};

export type DestinyArmorStatPlugDefinition = {
  hash: number;
  name: string;
  investmentStats: ArmorInvestmentStat[];
};

type DestinyArmorSetPerkReference = {
  requiredSetCount: number;
  sandboxPerkHash: number;
};

type DestinyArmorSetManifestDefinition = {
  hash: number;
  name: string;
  setItems: number[];
  setPerks: DestinyArmorSetPerkReference[];
};

type DestinySetPerkDefinition = {
  hash: number;
  name: string;
  description: string;
  icon: string | null;
};

type DestinyArmorManifest = {
  version: string;
  generatedAt: string;
  armor: DestinyArmorDefinition[];
  statPlugs: DestinyArmorStatPlugDefinition[];
  armorSets: DestinyArmorSetManifestDefinition[];
  setPerks: DestinySetPerkDefinition[];
};

export type DestinyArmorSetDefinition = {
  hash: number;
  name: string;
  twoPiece: DestinySetPerkDefinition | null;
  fourPiece: DestinySetPerkDefinition | null;
};

const manifest = manifestJson as DestinyArmorManifest;
const armorByHash = new Map(
  manifest.armor.map((definition) => [definition.hash, definition]),
);
const statPlugByHash = new Map(
  manifest.statPlugs.map((definition) => [definition.hash, definition]),
);
const setPerkByHash = new Map(
  manifest.setPerks.map((definition) => [definition.hash, definition]),
);
const setByItemHash = new Map<number, DestinyArmorSetDefinition>();

for (const set of manifest.armorSets) {
  const definition: DestinyArmorSetDefinition = {
    hash: set.hash,
    name: set.name,
    twoPiece:
      setPerkByHash.get(
        set.setPerks.find((perk) => perk.requiredSetCount === 2)
          ?.sandboxPerkHash ?? 0,
      ) ?? null,
    fourPiece:
      setPerkByHash.get(
        set.setPerks.find((perk) => perk.requiredSetCount === 4)
          ?.sandboxPerkHash ?? 0,
      ) ?? null,
  };

  for (const itemHash of set.setItems) {
    setByItemHash.set(itemHash, definition);
  }
}

export function getDestinyArmorDefinition(itemHash: number) {
  return armorByHash.get(itemHash) ?? null;
}

export function getDestinyArmorStatPlug(plugHash: number) {
  return statPlugByHash.get(plugHash) ?? null;
}

export function getDestinyArmorSet(itemHash: number) {
  return setByItemHash.get(itemHash) ?? null;
}

export function getDestinyContentUrl(path: string | null) {
  return path ? `${BUNGIE_ROOT}${path}` : null;
}

export function getDestinyArmorManifestMetadata() {
  return {
    version: manifest.version,
    generatedAt: manifest.generatedAt,
  };
}
