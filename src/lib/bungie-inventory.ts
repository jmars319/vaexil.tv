const BUNGIE_PLATFORM_ROOT = "https://www.bungie.net/Platform";

const INVENTORY_COMPONENTS = [100, 102, 200, 201, 205, 300, 304, 305];

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
};

type DestinyCharacter = {
  characterId: string;
  classType?: number;
  dateLastPlayed?: string;
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
    instances?: { data?: Record<string, unknown> };
    stats?: { data?: Record<string, unknown> };
    sockets?: { data?: Record<string, unknown> };
  };
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
  };
  characters: {
    characterId: string;
    className: string;
    inventory: number;
    equipped: number;
    lastPlayed: string | null;
  }[];
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
        : "Guardian";
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
    },
    characters: characters.map((character) => ({
      characterId: character.characterId,
      className: getClassName(character.classType),
      inventory: characterInventories[character.characterId]?.items?.length ?? 0,
      equipped: characterEquipment[character.characterId]?.items?.length ?? 0,
      lastPlayed: character.dateLastPlayed || null,
    })),
    importedAt: new Date().toISOString(),
  };
}
