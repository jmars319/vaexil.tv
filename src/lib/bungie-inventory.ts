import {
  ARMOR_STATS,
  addArmorInvestmentStats,
  createEmptyArmorStats,
  getArmorStatTotal,
  type ArmorSlot,
  type ArmorStats,
} from "@/lib/armor-optimizer";
import {
  getDestinyArmorDefinition,
  getDestinyArmorSet,
  getDestinyArmorStatPlug,
  getDestinyContentUrl,
  type DestinyArmorSetDefinition,
} from "@/lib/destiny-armor-manifest";

const BUNGIE_PLATFORM_ROOT = "https://www.bungie.net/Platform";

const INVENTORY_COMPONENTS = [100, 102, 200, 201, 205, 300, 304, 305];
const ARMOR_BUCKET_BY_HASH = new Map<number, ArmorSlot>([
  [3448274439, "Helmet"],
  [3551918588, "Gauntlets"],
  [14239492, "Chest Armor"],
  [20886954, "Leg Armor"],
  [1585787867, "Class Item"],
]);
const BASE_STAT_SOCKET_INDICES = [6, 7, 8, 9];
const EXOTIC_CLASS_ITEM_SOCKET_INDICES = [10, 11];
const ITEM_STATE_LOCKED = 1;
const ITEM_STATE_MASTERWORK = 4;
const EXOTIC_TIER = 6;

type BungieResponse<T> = {
  Response?: T;
  ErrorCode?: number;
  ErrorStatus?: string;
  Message?: string;
};

type DestinyMembership = {
  membershipId: string;
  membershipType: number;
  crossSaveOverride?: number;
  displayName?: string;
  bungieGlobalDisplayName?: string;
  bungieGlobalDisplayNameCode?: number;
};

type MembershipData = {
  primaryMembershipId?: string;
  destinyMemberships?: DestinyMembership[];
};

type DestinyItem = {
  itemHash: number;
  itemInstanceId?: string;
  bucketHash?: number;
  state?: number;
};

type DestinyCharacter = {
  characterId: string;
  classType?: number;
  dateLastPlayed?: string;
};

type DestinyItemInstance = {
  gearTier?: number | null;
  isEquipped?: boolean;
};

type DestinyItemStats = {
  stats?: Record<string, { statHash?: number; value?: number }>;
};

type DestinyItemSockets = {
  sockets?: { plugHash?: number | null }[];
};

type ProfileInventoryData = {
  profileInventory?: { data?: { items?: DestinyItem[] } };
  characters?: { data?: Record<string, DestinyCharacter> };
  characterInventories?: {
    data?: Record<string, { items?: DestinyItem[] }>;
  };
  characterEquipment?: {
    data?: Record<string, { items?: DestinyItem[] }>;
  };
  itemComponents?: {
    instances?: { data?: Record<string, DestinyItemInstance> };
    stats?: { data?: Record<string, DestinyItemStats> };
    sockets?: { data?: Record<string, DestinyItemSockets> };
  };
};

type LocatedDestinyItem = {
  item: DestinyItem;
  location: string;
  equipped: boolean;
};

export type BungieArmorPiece = {
  id: string;
  instanceId: string;
  itemHash: number;
  name: string;
  iconUrl: string | null;
  slot: ArmorSlot;
  className: string;
  tierTypeName: string;
  gearTier: number | null;
  isExotic: boolean;
  isFeatured: boolean;
  isLocked: boolean;
  isMasterworked: boolean;
  equipped: boolean;
  location: string;
  setHash: number | null;
  setName: string | null;
  baseStats: ArmorStats;
  currentStats: ArmorStats;
  baseStatTotal: number;
  currentStatTotal: number;
  activeStatDelta: ArmorStats;
  baseStatsSource: "manifest" | "live";
  exoticKey: string | null;
};

export type BungieArmorSetSummary = {
  hash: number;
  name: string;
  ownedPieces: number;
  ownedSlots: ArmorSlot[];
  twoPiece: BungieArmorSetPerk | null;
  fourPiece: BungieArmorSetPerk | null;
};

type BungieArmorSetPerk = {
  name: string;
  description: string;
  iconUrl: string | null;
};

export type BungieInventorySummary = {
  guardian: {
    displayName: string;
    membershipId: string;
    membershipType: number;
  };
  totals: {
    vault: number;
    characterInventory: number;
    equipped: number;
    instancedItems: number;
    itemsWithStats: number;
    armor: number;
    exotics: number;
    armorSets: number;
  };
  characters: {
    characterId: string;
    className: string;
    inventory: number;
    equipped: number;
    lastPlayed: string | null;
  }[];
  armor: BungieArmorPiece[];
  armorSets: BungieArmorSetSummary[];
  defaultClass: string;
  importedAt: string;
};

function getBungieApiKey() {
  const apiKey = process.env.BUNGIE_API_KEY?.trim() ?? "";
  if (!apiKey) {
    throw new Error("BUNGIE_API_KEY is not configured.");
  }

  return apiKey;
}

export function assertBungieInventoryConfigured() {
  void getBungieApiKey();
}

async function authenticatedBungieFetch<T>(path: string, accessToken: string) {
  const response = await fetch(`${BUNGIE_PLATFORM_ROOT}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-API-Key": getBungieApiKey(),
    },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as BungieResponse<T> | null;

  if (!response.ok || !body) {
    throw new Error(`Bungie inventory request failed with status ${response.status}.`);
  }

  if (body.ErrorCode && body.ErrorCode !== 1) {
    throw new Error(body.Message || body.ErrorStatus || "Bungie inventory request failed.");
  }

  if (!body.Response) {
    throw new Error("Bungie returned an empty inventory response.");
  }

  return body.Response;
}

function selectDestinyMembership(data: MembershipData) {
  const memberships = data.destinyMemberships ?? [];
  if (memberships.length === 0) {
    throw new Error("No Destiny 2 membership is linked to this Bungie account.");
  }

  return (
    memberships.find(
      (membership) => membership.membershipId === data.primaryMembershipId,
    ) ??
    memberships.find(
      (membership) =>
        membership.crossSaveOverride &&
        membership.crossSaveOverride === membership.membershipType,
    ) ??
    memberships[0]
  );
}

function getGuardianName(membership: DestinyMembership) {
  const code = membership.bungieGlobalDisplayNameCode;
  if (membership.bungieGlobalDisplayName && Number.isInteger(code)) {
    return `${membership.bungieGlobalDisplayName}#${String(code).padStart(4, "0")}`;
  }

  return membership.bungieGlobalDisplayName || membership.displayName || "Guardian";
}

function sumCharacterItems(
  data: Record<string, { items?: DestinyItem[] }> | undefined,
) {
  return Object.values(data ?? {}).reduce(
    (total, inventory) => total + (inventory.items?.length ?? 0),
    0,
  );
}

function getClassName(classType?: number) {
  return classType === 0
    ? "Titan"
    : classType === 1
      ? "Hunter"
      : classType === 2
        ? "Warlock"
        : "Any Class";
}

function getLocatedItems(
  vaultItems: DestinyItem[],
  characterInventories: Record<string, { items?: DestinyItem[] }>,
  characterEquipment: Record<string, { items?: DestinyItem[] }>,
  characterById: Map<string, DestinyCharacter>,
) {
  const locatedItems: LocatedDestinyItem[] = vaultItems.map((item) => ({
    item,
    location: "Vault",
    equipped: false,
  }));

  for (const [characterId, inventory] of Object.entries(characterInventories)) {
    const className = getClassName(characterById.get(characterId)?.classType);
    locatedItems.push(
      ...(inventory.items ?? []).map((item) => ({
        item,
        location: `${className} inventory`,
        equipped: false,
      })),
    );
  }

  for (const [characterId, inventory] of Object.entries(characterEquipment)) {
    const className = getClassName(characterById.get(characterId)?.classType);
    locatedItems.push(
      ...(inventory.items ?? []).map((item) => ({
        item,
        location: `${className} equipped`,
        equipped: true,
      })),
    );
  }

  return locatedItems;
}

function getLiveStats(component: DestinyItemStats | undefined) {
  const stats = createEmptyArmorStats();
  addArmorInvestmentStats(
    stats,
    Object.entries(component?.stats ?? {}).map(([hash, stat]) => ({
      statTypeHash: stat.statHash ?? Number(hash),
      value: Number(stat.value) || 0,
    })),
  );
  return stats;
}

function getBaseStats(
  investmentStats: { statTypeHash: number; value: number }[],
  sockets: DestinyItemSockets | undefined,
  includeExoticClassItemSockets: boolean,
) {
  const stats = createEmptyArmorStats();
  addArmorInvestmentStats(stats, investmentStats);

  const socketIndices = includeExoticClassItemSockets
    ? [...BASE_STAT_SOCKET_INDICES, ...EXOTIC_CLASS_ITEM_SOCKET_INDICES]
    : BASE_STAT_SOCKET_INDICES;
  for (const index of socketIndices) {
    const plugHash = sockets?.sockets?.[index]?.plugHash;
    if (!plugHash) {
      continue;
    }

    const plug = getDestinyArmorStatPlug(plugHash);
    if (plug) {
      addArmorInvestmentStats(stats, plug.investmentStats);
    }
  }

  return stats;
}

function getStatDelta(current: ArmorStats, base: ArmorStats) {
  const delta = createEmptyArmorStats();
  for (const stat of ARMOR_STATS) {
    delta[stat.key] = current[stat.key] - base[stat.key];
  }
  return delta;
}

function toSetPerk(
  perk: DestinyArmorSetDefinition["twoPiece"],
): BungieArmorSetPerk | null {
  return perk
    ? {
        name: perk.name,
        description: perk.description,
        iconUrl: getDestinyContentUrl(perk.icon),
      }
    : null;
}

function buildArmorInventory(
  locatedItems: LocatedDestinyItem[],
  instances: Record<string, DestinyItemInstance>,
  stats: Record<string, DestinyItemStats>,
  sockets: Record<string, DestinyItemSockets>,
) {
  const armor: BungieArmorPiece[] = [];
  const armorSetDefinitions = new Map<number, DestinyArmorSetDefinition>();
  const seenInstances = new Set<string>();

  for (const located of locatedItems) {
    const { item } = located;
    const instanceId = item.itemInstanceId;
    const slot = item.bucketHash ? ARMOR_BUCKET_BY_HASH.get(item.bucketHash) : null;
    if (!instanceId || !slot || seenInstances.has(instanceId)) {
      continue;
    }

    const definition = getDestinyArmorDefinition(item.itemHash);
    if (!definition) {
      continue;
    }

    seenInstances.add(instanceId);
    const isExotic = definition.tierType === EXOTIC_TIER;
    const liveStats = getLiveStats(stats[instanceId]);
    const reconstructedStats = getBaseStats(
      definition.investmentStats,
      sockets[instanceId],
      isExotic && slot === "Class Item",
    );
    const hasReconstructedStats = getArmorStatTotal(reconstructedStats) > 0;
    const baseStats = hasReconstructedStats ? reconstructedStats : liveStats;
    const currentStats = getArmorStatTotal(liveStats) > 0 ? liveStats : baseStats;
    const armorSet = getDestinyArmorSet(item.itemHash);
    if (armorSet) {
      armorSetDefinitions.set(armorSet.hash, armorSet);
    }

    armor.push({
      id: instanceId,
      instanceId,
      itemHash: item.itemHash,
      name: definition.name,
      iconUrl: getDestinyContentUrl(definition.icon),
      slot,
      className: getClassName(definition.classType),
      tierTypeName: definition.tierTypeName,
      gearTier: instances[instanceId]?.gearTier ?? null,
      isExotic,
      isFeatured: definition.isFeatured,
      isLocked: Boolean((item.state ?? 0) & ITEM_STATE_LOCKED),
      isMasterworked: Boolean((item.state ?? 0) & ITEM_STATE_MASTERWORK),
      equipped: located.equipped || Boolean(instances[instanceId]?.isEquipped),
      location: located.location,
      setHash: armorSet?.hash ?? null,
      setName: armorSet?.name ?? null,
      baseStats,
      currentStats,
      baseStatTotal: getArmorStatTotal(baseStats),
      currentStatTotal: getArmorStatTotal(currentStats),
      activeStatDelta: getStatDelta(currentStats, baseStats),
      baseStatsSource: hasReconstructedStats ? "manifest" : "live",
      exoticKey: isExotic ? `${slot}:${definition.name}` : null,
    });
  }

  armor.sort(
    (left, right) =>
      left.slot.localeCompare(right.slot) ||
      right.baseStatTotal - left.baseStatTotal ||
      left.name.localeCompare(right.name),
  );

  const armorSets: BungieArmorSetSummary[] = [];
  for (const definition of armorSetDefinitions.values()) {
    const ownedPieces = armor.filter((piece) => piece.setHash === definition.hash);
    armorSets.push({
      hash: definition.hash,
      name: definition.name,
      ownedPieces: ownedPieces.length,
      ownedSlots: [...new Set(ownedPieces.map((piece) => piece.slot))],
      twoPiece: toSetPerk(definition.twoPiece),
      fourPiece: toSetPerk(definition.fourPiece),
    });
  }
  armorSets.sort((left, right) => left.name.localeCompare(right.name));

  return { armor, armorSets };
}

export async function getBungieInventorySummary(
  accessToken: string,
): Promise<BungieInventorySummary> {
  const membershipData = await authenticatedBungieFetch<MembershipData>(
    "/User/GetMembershipsForCurrentUser/",
    accessToken,
  );
  const membership = selectDestinyMembership(membershipData);
  const params = new URLSearchParams({
    components: INVENTORY_COMPONENTS.join(","),
  });
  const profile = await authenticatedBungieFetch<ProfileInventoryData>(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?${params}`,
    accessToken,
  );
  const vaultItems = profile.profileInventory?.data?.items ?? [];
  const characterInventories = profile.characterInventories?.data ?? {};
  const characterEquipment = profile.characterEquipment?.data ?? {};
  const characters = Object.values(profile.characters?.data ?? {});
  const characterById = new Map(
    characters.map((character) => [character.characterId, character]),
  );
  const locatedItems = getLocatedItems(
    vaultItems,
    characterInventories,
    characterEquipment,
    characterById,
  );
  const { armor, armorSets } = buildArmorInventory(
    locatedItems,
    profile.itemComponents?.instances?.data ?? {},
    profile.itemComponents?.stats?.data ?? {},
    profile.itemComponents?.sockets?.data ?? {},
  );
  const mappedCharacters = characters.map((character) => ({
    characterId: character.characterId,
    className: getClassName(character.classType),
    inventory: characterInventories[character.characterId]?.items?.length ?? 0,
    equipped: characterEquipment[character.characterId]?.items?.length ?? 0,
    lastPlayed: character.dateLastPlayed || null,
  }));
  const defaultClass = [...mappedCharacters]
    .filter((character) => character.className !== "Any Class")
    .sort(
      (left, right) =>
        Date.parse(right.lastPlayed ?? "") - Date.parse(left.lastPlayed ?? ""),
    )[0]?.className ?? "Titan";

  return {
    guardian: {
      displayName: getGuardianName(membership),
      membershipId: membership.membershipId,
      membershipType: membership.membershipType,
    },
    totals: {
      vault: vaultItems.length,
      characterInventory: sumCharacterItems(characterInventories),
      equipped: sumCharacterItems(characterEquipment),
      instancedItems: Object.keys(profile.itemComponents?.instances?.data ?? {}).length,
      itemsWithStats: Object.keys(profile.itemComponents?.stats?.data ?? {}).length,
      armor: armor.length,
      exotics: armor.filter((piece) => piece.isExotic).length,
      armorSets: armorSets.length,
    },
    characters: mappedCharacters,
    armor,
    armorSets,
    defaultClass,
    importedAt: new Date().toISOString(),
  };
}
