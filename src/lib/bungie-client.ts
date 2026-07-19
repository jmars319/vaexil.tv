const BUNGIE_ROOT = "https://www.bungie.net";
const BUNGIE_PLATFORM_ROOT = `${BUNGIE_ROOT}/Platform`;

const DESTINY_COMPONENTS = [
  "Profiles",
  "Characters",
  "CharacterEquipment",
  "Transitory",
].join(",");

const DESTINY_PROFILE_COMPONENTS = [
  "Profiles",
  "Transitory",
].join(",");

const BUCKET_HASHES = {
  kinetic: 1498876634,
  energy: 2465295065,
  power: 953998645,
  helmet: 3448274439,
  arms: 3551918588,
  chest: 14239492,
  legs: 20886954,
  classItem: 1585787867,
  ghost: 4023194814,
} as const;

const SUBCLASS_BUCKET_HASH = 3284755031;

const definitionCache = new Map<string, Promise<BungieDefinition>>();

type BungieResponse<T> = {
  Response?: T;
  ErrorCode?: number;
  ErrorStatus?: string;
  Message?: string;
};

type BungieSearchResult = {
  membershipId: string;
  membershipType: number;
  displayName?: string;
  bungieGlobalDisplayName?: string;
  bungieGlobalDisplayNameCode?: number;
  iconPath?: string;
};

type BungieProfileResponse = {
  profile?: { data?: BungieProfile };
  characters?: { data?: Record<string, BungieCharacter> };
  characterEquipment?: { data?: Record<string, { items?: BungieItem[] }> };
  profileTransitoryData?: { data?: { partyMembers?: { membershipId: string }[] } };
};

type BungieProfile = {
  userInfo?: {
    membershipId?: string;
    membershipType?: number;
    bungieGlobalDisplayName?: string;
    bungieGlobalDisplayNameCode?: number;
    displayName?: string;
  };
};

type BungieCharacter = {
  characterId: string;
  classHash: number;
  light?: number;
  dateLastPlayed: string;
  emblemBackgroundPath?: string;
};

type BungieItem = {
  bucketHash: number;
  itemHash: number;
  overrideStyleItemHash?: number;
};

type BungieDefinition = {
  hash: number;
  displayProperties?: {
    name?: string;
    icon?: string;
  };
  inventory?: {
    tierType?: number;
    tierTypeName?: string;
  };
};

export type DestinyFashionItem = {
  slot: keyof typeof BUCKET_HASHES;
  name: string;
  icon: string;
  isExotic: boolean;
};

export type DestinyFashionMember = {
  membershipId: string;
  membershipType: number;
  displayName: string;
  className: string;
  subclassName: string;
  power: number | null;
  emblemBackgroundPath: string;
  items: DestinyFashionItem[];
};

export type DestinyFashionPayload = {
  platforms: {
    membershipId: string;
    membershipType: number;
    label: string;
    iconPath: string;
  }[];
  selected: DestinyFashionMember;
  fireteam: DestinyFashionMember[];
};

export type DestinyFireteamRosterMember = {
  membershipId: string;
  membershipType: number;
  displayName: string;
  className: string;
  subclassName: string;
  power: number | null;
};

export type DestinyFireteamRosterPayload = {
  fireteam: DestinyFireteamRosterMember[];
};

function getBungieApiKey() {
  return process.env.BUNGIE_API_KEY || "";
}

async function bungieFetch<T>(path: string, init: RequestInit = {}) {
  const apiKey = getBungieApiKey();
  if (!apiKey) {
    throw new Error("BUNGIE_API_KEY is not configured.");
  }

  const response = await fetch(`${BUNGIE_PLATFORM_ROOT}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...init.headers,
    },
    next: { revalidate: init.method === "POST" ? 0 : 300 },
  });

  const body = await response.json().catch(() => null) as BungieResponse<T> | null;
  if (!response.ok || !body) {
    throw new Error(`Bungie request failed with status ${response.status}.`);
  }

  if (body.ErrorCode && body.ErrorCode !== 1) {
    throw new Error(body.Message || body.ErrorStatus || "Bungie request failed.");
  }

  return body.Response as T;
}

function parseBungieName(value: string) {
  const trimmed = value.trim();
  const [displayName, code] = trimmed.split("#");
  const displayNameCode = Number(code);

  if (!displayName || !Number.isInteger(displayNameCode)) {
    throw new Error("Enter a Bungie name in Name#0000 format.");
  }

  return { displayName, displayNameCode };
}

function toImageUrl(path = "") {
  return path ? `${BUNGIE_ROOT}${path}` : "";
}

function getProfileName(profile?: BungieProfile) {
  const userInfo = profile?.userInfo;
  if (!userInfo) {
    return "Unknown Guardian";
  }

  const code = userInfo.bungieGlobalDisplayNameCode;
  if (userInfo.bungieGlobalDisplayName && code) {
    return `${userInfo.bungieGlobalDisplayName}#${String(code).padStart(4, "0")}`;
  }

  return userInfo.bungieGlobalDisplayName || userInfo.displayName || "Unknown Guardian";
}

async function searchPlayer(bungieName: string) {
  const { displayName, displayNameCode } = parseBungieName(bungieName);

  return bungieFetch<BungieSearchResult[]>("/Destiny2/SearchDestinyPlayerByBungieName/-1/", {
    method: "POST",
    body: JSON.stringify({ displayName, displayNameCode }),
  });
}

async function getProfile(
  membershipType: number,
  membershipId: string,
  components = DESTINY_COMPONENTS,
) {
  const params = new URLSearchParams({ components });
  return bungieFetch<BungieProfileResponse>(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?${params}`,
  );
}

async function getLinkedProfiles(membershipId: string) {
  return bungieFetch<{ profiles?: BungieSearchResult[] }>(
    `/Destiny2/-1/Profile/${membershipId}/LinkedProfiles/?getAllMemberships=true`,
  );
}

async function getDefinition(entityType: string, hash: number) {
  const key = `${entityType}:${hash}`;
  let promise = definitionCache.get(key);

  if (!promise) {
    promise = bungieFetch<BungieDefinition>(`/Destiny2/Manifest/${entityType}/${hash}/`);
    definitionCache.set(key, promise);
  }

  return promise;
}

function getLastPlayedCharacter(profileResponse: BungieProfileResponse) {
  const characters = Object.values(profileResponse.characters?.data ?? {});
  return characters.sort(
    (a, b) => new Date(b.dateLastPlayed).getTime() - new Date(a.dateLastPlayed).getTime(),
  )[0];
}

function findEquippedItem(items: BungieItem[], slot: keyof typeof BUCKET_HASHES) {
  return items.find((item) => item.bucketHash === BUCKET_HASHES[slot]);
}

function findEquippedSubclass(items: BungieItem[]) {
  return items.find((item) => item.bucketHash === SUBCLASS_BUCKET_HASH);
}

async function getFashionMember(seed: BungieSearchResult) {
  const linked = await getLinkedProfiles(seed.membershipId).catch(() => null);
  const profileSeed = linked?.profiles?.[0] ?? seed;
  const profileResponse = await getProfile(profileSeed.membershipType, profileSeed.membershipId);
  const character = getLastPlayedCharacter(profileResponse);

  if (!character) {
    throw new Error("No Destiny 2 character was found for this player.");
  }

  const equippedItems = profileResponse.characterEquipment?.data?.[character.characterId]?.items ?? [];
  const subclassItem = findEquippedSubclass(equippedItems);
  const [classDefinition, subclassDefinition] = await Promise.all([
    getDefinition("DestinyClassDefinition", character.classHash),
    subclassItem
      ? getDefinition("DestinyInventoryItemDefinition", subclassItem.itemHash)
      : Promise.resolve(null),
  ]);
  const slots = Object.keys(BUCKET_HASHES) as (keyof typeof BUCKET_HASHES)[];
  const items = await Promise.all(
    slots.map(async (slot) => {
      const item = findEquippedItem(equippedItems, slot);
      if (!item) {
        return null;
      }

      const definition = await getDefinition(
        "DestinyInventoryItemDefinition",
        item.overrideStyleItemHash || item.itemHash,
      );

      return {
        slot,
        name: definition.displayProperties?.name || "Unknown item",
        icon: toImageUrl(definition.displayProperties?.icon),
        isExotic:
          definition.inventory?.tierType === 6 ||
          definition.inventory?.tierTypeName?.toLowerCase() === "exotic",
      } satisfies DestinyFashionItem;
    }),
  );

  return {
    membershipId: profileSeed.membershipId,
    membershipType: profileSeed.membershipType,
    displayName: getProfileName(profileResponse.profile?.data),
    className: classDefinition.displayProperties?.name || "Guardian",
    subclassName: subclassDefinition?.displayProperties?.name || "Subclass unknown",
    power: Number.isFinite(character.light) ? character.light ?? null : null,
    emblemBackgroundPath: toImageUrl(character.emblemBackgroundPath),
    items: items.filter((item): item is DestinyFashionItem => Boolean(item?.icon)),
  } satisfies DestinyFashionMember;
}

async function getRosterMember(seed: BungieSearchResult) {
  const linked = await getLinkedProfiles(seed.membershipId).catch(() => null);
  const profileSeed = linked?.profiles?.[0] ?? seed;
  const profileResponse = await getProfile(profileSeed.membershipType, profileSeed.membershipId);
  const character = getLastPlayedCharacter(profileResponse);

  if (!character) {
    throw new Error("No Destiny 2 character was found for this player.");
  }

  const equippedItems = profileResponse.characterEquipment?.data?.[character.characterId]?.items ?? [];
  const subclassItem = findEquippedSubclass(equippedItems);
  const [classDefinition, subclassDefinition] = await Promise.all([
    getDefinition("DestinyClassDefinition", character.classHash),
    subclassItem
      ? getDefinition("DestinyInventoryItemDefinition", subclassItem.itemHash)
      : Promise.resolve(null),
  ]);

  return {
    membershipId: profileSeed.membershipId,
    membershipType: profileSeed.membershipType,
    displayName: getProfileName(profileResponse.profile?.data),
    className: classDefinition.displayProperties?.name || "Guardian",
    subclassName: subclassDefinition?.displayProperties?.name || "Subclass unknown",
    power: Number.isFinite(character.light) ? character.light ?? null : null,
  } satisfies DestinyFireteamRosterMember;
}

export async function getDestinyFashionPayload(
  bungieName: string,
  selectedMembershipType?: number,
): Promise<DestinyFashionPayload> {
  const platforms = await searchPlayer(bungieName);
  if (platforms.length === 0) {
    throw new Error("No Destiny player was found for that Bungie name.");
  }

  const selectedPlatform =
    platforms.find((platform) => platform.membershipType === selectedMembershipType) ?? platforms[0];

  const selectedProfile = await getProfile(
    selectedPlatform.membershipType,
    selectedPlatform.membershipId,
  );
  const partySeeds = selectedProfile.profileTransitoryData?.data?.partyMembers ?? [];
  const fireteamSeeds = partySeeds.length > 0
    ? partySeeds.map((member) => ({
      membershipId: member.membershipId,
      membershipType: -1,
    }))
    : [selectedPlatform];

  const selected = await getFashionMember(selectedPlatform);
  const fireteam = await Promise.all(fireteamSeeds.map(getFashionMember));

  return {
    platforms: platforms.map((platform) => ({
      membershipId: platform.membershipId,
      membershipType: platform.membershipType,
      label: platform.displayName || platform.bungieGlobalDisplayName || "Platform",
      iconPath: toImageUrl(platform.iconPath),
    })),
    selected,
    fireteam,
  };
}

export async function getDestinyFireteamRoster(
  bungieName: string,
  selectedMembershipType?: number,
): Promise<DestinyFireteamRosterPayload> {
  const platforms = await searchPlayer(bungieName);
  if (platforms.length === 0) {
    throw new Error("No Destiny player was found for that Bungie name.");
  }

  const selectedPlatform =
    platforms.find((platform) => platform.membershipType === selectedMembershipType) ?? platforms[0];
  const selectedProfile = await getProfile(
    selectedPlatform.membershipType,
    selectedPlatform.membershipId,
    DESTINY_PROFILE_COMPONENTS,
  );
  const partySeeds = selectedProfile.profileTransitoryData?.data?.partyMembers ?? [];
  const fireteamSeeds = partySeeds.length > 0
    ? partySeeds.map((member) => ({
      membershipId: member.membershipId,
      membershipType: -1,
    }))
    : [selectedPlatform];

  const fireteam = await Promise.all(fireteamSeeds.map(getRosterMember));

  const uniqueFireteam = fireteam.filter(
    (member, index, list) =>
      list.findIndex((item) => item.membershipId === member.membershipId) === index,
  );

  return { fireteam: uniqueFireteam };
}
