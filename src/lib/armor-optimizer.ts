export const ARMOR_STATS = [
  { key: "weapons", label: "Weapons", hashes: [2996146975] },
  { key: "health", label: "Health", hashes: [392767087] },
  { key: "class", label: "Class", hashes: [1943323491, 2135857333] },
  { key: "grenade", label: "Grenade", hashes: [1735777505] },
  { key: "super", label: "Super", hashes: [144602215] },
  { key: "melee", label: "Melee", hashes: [4244567218, 3493869314] },
] as const;

export const ARMOR_SLOTS = [
  "Helmet",
  "Gauntlets",
  "Chest Armor",
  "Leg Armor",
  "Class Item",
] as const;

export type ArmorStatKey = (typeof ARMOR_STATS)[number]["key"];
export type ArmorSlot = (typeof ARMOR_SLOTS)[number];
export type ArmorStats = Record<ArmorStatKey, number>;

export type ArmorInvestmentStat = {
  statTypeHash: number;
  value: number;
};

export type OptimizerArmorPiece = {
  id: string;
  slot: ArmorSlot;
  isExotic: boolean;
  exoticKey: string | null;
  setHash: number | null;
  baseStats: ArmorStats;
};

export type ArmorSetRequirement = {
  setHash: number;
  count: 2 | 4;
};

export type ArmorOptimizationConstraints = {
  exotic: "any" | "none" | string;
  sets: ArmorSetRequirement[];
};

export type ArmorStatCeiling = {
  stat: ArmorStatKey;
  base: number | null;
  withMajorMods: number | null;
  itemIds: string[];
};

const STAT_KEY_BY_HASH = new Map<number, ArmorStatKey>(
  ARMOR_STATS.flatMap((stat) =>
    stat.hashes.map((hash) => [hash, stat.key] as const),
  ),
);

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

export function addArmorInvestmentStats(
  target: ArmorStats,
  investmentStats: ArmorInvestmentStat[],
) {
  for (const stat of investmentStats) {
    const key = STAT_KEY_BY_HASH.get(stat.statTypeHash);
    if (key) {
      target[key] += stat.value;
    }
  }

  return target;
}

export function getArmorStatTotal(stats: ArmorStats) {
  return ARMOR_STATS.reduce((total, stat) => total + stats[stat.key], 0);
}

function normalizeSetRequirements(requirements: ArmorSetRequirement[]) {
  const bySet = new Map<number, 2 | 4>();
  for (const requirement of requirements) {
    const current = bySet.get(requirement.setHash) ?? 0;
    if (requirement.count > current) {
      bySet.set(requirement.setHash, requirement.count);
    }
  }

  return [...bySet].map(([setHash, count]) => ({ setHash, count }));
}

type SearchState = {
  value: number;
  itemIds: string[];
  exoticCount: number;
  selectedExoticFound: boolean;
  setCounts: number[];
};

function getStateKey(state: SearchState) {
  return [
    state.exoticCount,
    state.selectedExoticFound ? 1 : 0,
    ...state.setCounts,
  ].join(":");
}

function maximizeStat(
  pieces: OptimizerArmorPiece[],
  stat: ArmorStatKey,
  constraints: ArmorOptimizationConstraints,
) {
  const setRequirements = normalizeSetRequirements(constraints.sets);
  const candidatesBySlot = new Map<ArmorSlot, OptimizerArmorPiece[]>();

  for (const slot of ARMOR_SLOTS) {
    candidatesBySlot.set(
      slot,
      pieces.filter((piece) => piece.slot === slot),
    );
  }

  let states = new Map<string, SearchState>();
  const initialState: SearchState = {
    value: 0,
    itemIds: [],
    exoticCount: 0,
    selectedExoticFound: false,
    setCounts: setRequirements.map(() => 0),
  };
  states.set(getStateKey(initialState), initialState);

  for (const slot of ARMOR_SLOTS) {
    const candidates = candidatesBySlot.get(slot) ?? [];
    if (candidates.length === 0) {
      return null;
    }

    const nextStates = new Map<string, SearchState>();
    for (const state of states.values()) {
      for (const piece of candidates) {
        if (constraints.exotic === "none" && piece.isExotic) {
          continue;
        }
        if (
          piece.isExotic &&
          constraints.exotic !== "any" &&
          constraints.exotic !== "none" &&
          piece.exoticKey !== constraints.exotic
        ) {
          continue;
        }

        const exoticCount = state.exoticCount + (piece.isExotic ? 1 : 0);
        if (exoticCount > 1) {
          continue;
        }

        const selectedExoticFound =
          state.selectedExoticFound ||
          (piece.isExotic && piece.exoticKey === constraints.exotic);
        const setCounts = state.setCounts.map((count, index) => {
          const requirement = setRequirements[index];
          return piece.setHash === requirement.setHash
            ? Math.min(requirement.count, count + 1)
            : count;
        });
        const nextState: SearchState = {
          value: state.value + piece.baseStats[stat],
          itemIds: [...state.itemIds, piece.id],
          exoticCount,
          selectedExoticFound,
          setCounts,
        };
        const key = getStateKey(nextState);
        const existing = nextStates.get(key);
        if (!existing || nextState.value > existing.value) {
          nextStates.set(key, nextState);
        }
      }
    }

    states = nextStates;
  }

  const requiresSpecificExotic =
    constraints.exotic !== "any" && constraints.exotic !== "none";
  return (
    [...states.values()]
      .filter(
        (state) =>
          (!requiresSpecificExotic || state.selectedExoticFound) &&
          setRequirements.every(
            (requirement, index) =>
              state.setCounts[index] >= requirement.count,
          ),
      )
      .sort((left, right) => right.value - left.value)[0] ?? null
  );
}

export function computeArmorStatCeilings(
  pieces: OptimizerArmorPiece[],
  constraints: ArmorOptimizationConstraints,
): ArmorStatCeiling[] {
  return ARMOR_STATS.map((stat) => {
    const result = maximizeStat(pieces, stat.key, constraints);
    return {
      stat: stat.key,
      base: result?.value ?? null,
      withMajorMods: result ? Math.min(200, result.value + 50) : null,
      itemIds: result?.itemIds ?? [],
    };
  });
}
