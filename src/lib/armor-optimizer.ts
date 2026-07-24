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

const ARMOR_SLOT_BY_DEFINITION_BUCKET = new Map<number, ArmorSlot>([
  [3448274439, "Helmet"],
  [3551918588, "Gauntlets"],
  [14239492, "Chest Armor"],
  [20886954, "Leg Armor"],
  [1585787867, "Class Item"],
]);

export type ArmorStatKey = (typeof ARMOR_STATS)[number]["key"];
export type ArmorSlot = (typeof ARMOR_SLOTS)[number];
export type ArmorStats = Record<ArmorStatKey, number>;

export const ARMOR_STAT_TARGET_PARAMS: Record<ArmorStatKey, string> = {
  weapons: "targetWeapons",
  health: "targetHealth",
  class: "targetClass",
  grenade: "targetGrenade",
  super: "targetSuper",
  melee: "targetMelee",
};

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

export type ArmorTargetBuild = ArmorStatCeiling & {
  baseStats: ArmorStats | null;
  finalStats: ArmorStats | null;
  modCounts: ArmorStats | null;
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

function getRequiredMajorModCount(base: number, target: number) {
  return Math.max(0, Math.ceil((target - base) / 10));
}

export function getSuggestedMajorModCount(base: number, target: number) {
  return Math.min(5, getRequiredMajorModCount(base, target));
}

function getUsefulArmorStatTotal(stats: ArmorStats) {
  return ARMOR_STATS.reduce(
    (total, stat) => total + Math.min(200, stats[stat.key]),
    0,
  );
}

export function getArmorSlotFromDefinitionBucket(bucketHash: number) {
  return ARMOR_SLOT_BY_DEFINITION_BUCKET.get(bucketHash) ?? null;
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

export function computeArmorStatCeilings(
  pieces: OptimizerArmorPiece[],
  constraints: ArmorOptimizationConstraints,
): ArmorStatCeiling[] {
  return computeArmorTargetBuilds(
    pieces,
    constraints,
    createEmptyArmorStats(),
  ).map(({ stat, base, withMajorMods, itemIds }) => ({
    stat,
    base,
    withMajorMods,
    itemIds,
  }));
}

type TargetSearchState = {
  objectiveValue: number;
  usefulTotal: number;
  baseStats: ArmorStats;
  itemIds: string[];
  exoticCount: number;
  selectedExoticFound: boolean;
  setCounts: number[];
};

function addArmorStats(left: ArmorStats, right: ArmorStats) {
  const total = createEmptyArmorStats();
  for (const stat of ARMOR_STATS) {
    total[stat.key] = left[stat.key] + right[stat.key];
  }
  return total;
}

function getTargetStateKey(
  state: TargetSearchState,
  progressStats: ArmorStatKey[],
  targets: ArmorStats,
) {
  return [
    state.exoticCount,
    state.selectedExoticFound ? 1 : 0,
    ...state.setCounts,
    ...progressStats.map((stat) => Math.min(targets[stat], state.baseStats[stat])),
  ].join(":");
}

function getConstraintStateKey(state: TargetSearchState) {
  return [
    state.exoticCount,
    state.selectedExoticFound ? 1 : 0,
    ...state.setCounts,
  ].join(":");
}

function pruneDominatedTargetStates(
  states: Map<string, TargetSearchState>,
  progressStats: ArmorStatKey[],
  targets: ArmorStats,
) {
  if (progressStats.length === 0 || states.size < 2) return states;
  const groups = new Map<string, TargetSearchState[]>();
  for (const state of states.values()) {
    const key = getConstraintStateKey(state);
    const group = groups.get(key) ?? [];
    group.push(state);
    groups.set(key, group);
  }

  const pruned = new Map<string, TargetSearchState>();
  for (const group of groups.values()) {
    group.sort(
      (left, right) =>
        right.objectiveValue - left.objectiveValue ||
        right.usefulTotal - left.usefulTotal,
    );
    const frontier: TargetSearchState[] = [];
    for (const candidate of group) {
      const dominated = frontier.some((existing) =>
        progressStats.every(
          (stat) =>
            Math.min(targets[stat], existing.baseStats[stat]) >=
            Math.min(targets[stat], candidate.baseStats[stat]),
        ),
      );
      if (dominated) continue;
      frontier.push(candidate);
      pruned.set(
        getTargetStateKey(candidate, progressStats, targets),
        candidate,
      );
    }
  }
  return pruned;
}

function getTargetCandidatesBySlot(
  pieces: OptimizerArmorPiece[],
  constraints: ArmorOptimizationConstraints,
) {
  const candidatesBySlot = new Map<ArmorSlot, OptimizerArmorPiece[]>();
  for (const slot of ARMOR_SLOTS) {
    candidatesBySlot.set(
      slot,
      pieces.filter((piece) => {
        if (piece.slot !== slot) return false;
        if (constraints.exotic === "none") return !piece.isExotic;
        return !(
          piece.isExotic &&
          constraints.exotic !== "any" &&
          piece.exoticKey !== constraints.exotic
        );
      }),
    );
  }
  return candidatesBySlot;
}

function getRemainingMaximums(
  candidatesBySlot: Map<ArmorSlot, OptimizerArmorPiece[]>,
) {
  const maximums = Array.from({ length: ARMOR_SLOTS.length + 1 }, () =>
    createEmptyArmorStats(),
  );

  for (let index = ARMOR_SLOTS.length - 1; index >= 0; index -= 1) {
    const slotMaximums = createEmptyArmorStats();
    const candidates = candidatesBySlot.get(ARMOR_SLOTS[index]) ?? [];
    for (const piece of candidates) {
      for (const stat of ARMOR_STATS) {
        slotMaximums[stat.key] = Math.max(
          slotMaximums[stat.key],
          piece.baseStats[stat.key],
        );
      }
    }
    maximums[index] = addArmorStats(slotMaximums, maximums[index + 1]);
  }

  return maximums;
}

function canStillMeetTargets(
  baseStats: ArmorStats,
  remainingMaximums: ArmorStats,
  targets: ArmorStats,
) {
  let minimumMods = 0;
  for (const stat of ARMOR_STATS) {
    const maximumBase = baseStats[stat.key] + remainingMaximums[stat.key];
    minimumMods += getRequiredMajorModCount(
      maximumBase,
      targets[stat.key],
    );
    if (minimumMods > ARMOR_SLOTS.length) return false;
  }
  return true;
}

function allocateMajorMods(
  baseStats: ArmorStats,
  targets: ArmorStats,
  objective: ArmorStatKey,
) {
  const finalStats = createEmptyArmorStats();
  for (const stat of ARMOR_STATS) {
    finalStats[stat.key] = Math.min(200, baseStats[stat.key]);
  }
  const modCounts = createEmptyArmorStats();
  let remainingMods = ARMOR_SLOTS.length;

  for (const stat of ARMOR_STATS) {
    if (stat.key === objective || targets[stat.key] === 0) continue;
    const needed = getRequiredMajorModCount(
      baseStats[stat.key],
      targets[stat.key],
    );
    if (needed > remainingMods) return null;
    modCounts[stat.key] = needed;
    remainingMods -= needed;
  }

  while (remainingMods > 0 && finalStats[objective] < 200) {
    modCounts[objective] += 1;
    finalStats[objective] = Math.min(200, finalStats[objective] + 10);
    remainingMods -= 1;
  }

  for (const stat of ARMOR_STATS) {
    if (stat.key === objective) continue;
    finalStats[stat.key] = Math.min(
      200,
      finalStats[stat.key] + modCounts[stat.key] * 10,
    );
  }

  while (remainingMods > 0) {
    let bestStat: ArmorStatKey | null = null;
    let bestGain = 0;
    for (const stat of ARMOR_STATS) {
      const gain = Math.min(10, Math.max(0, 200 - finalStats[stat.key]));
      if (gain > bestGain) {
        bestStat = stat.key;
        bestGain = gain;
      }
    }
    if (!bestStat) break;
    modCounts[bestStat] += 1;
    finalStats[bestStat] += bestGain;
    remainingMods -= 1;
  }

  const meetsTargets = ARMOR_STATS.every(
    (stat) => finalStats[stat.key] >= targets[stat.key],
  );
  return meetsTargets ? { finalStats, modCounts } : null;
}

function maximizeStatWithTargets(
  pieces: OptimizerArmorPiece[],
  objective: ArmorStatKey,
  constraints: ArmorOptimizationConstraints,
  targets: ArmorStats,
) {
  const setRequirements = normalizeSetRequirements(constraints.sets);
  const candidatesBySlot = getTargetCandidatesBySlot(pieces, constraints);
  const remainingMaximums = getRemainingMaximums(candidatesBySlot);
  const progressStats = ARMOR_STATS.filter(
    (stat) => stat.key !== objective && targets[stat.key] > 0,
  ).map((stat) => stat.key);
  const initialStats = createEmptyArmorStats();
  const initialState: TargetSearchState = {
    objectiveValue: 0,
    usefulTotal: 0,
    baseStats: initialStats,
    itemIds: [],
    exoticCount: 0,
    selectedExoticFound: false,
    setCounts: setRequirements.map(() => 0),
  };
  let states = new Map<string, TargetSearchState>();
  states.set(getTargetStateKey(initialState, progressStats, targets), initialState);

  for (let slotIndex = 0; slotIndex < ARMOR_SLOTS.length; slotIndex += 1) {
    const candidates = candidatesBySlot.get(ARMOR_SLOTS[slotIndex]) ?? [];
    if (candidates.length === 0) return null;
    const nextStates = new Map<string, TargetSearchState>();

    for (const state of states.values()) {
      for (const piece of candidates) {
        const exoticCount = state.exoticCount + (piece.isExotic ? 1 : 0);
        if (exoticCount > 1) continue;

        const baseStats = addArmorStats(state.baseStats, piece.baseStats);
        if (
          !canStillMeetTargets(
            baseStats,
            remainingMaximums[slotIndex + 1],
            targets,
          )
        ) {
          continue;
        }

        const setCounts = state.setCounts.map((count, index) => {
          const requirement = setRequirements[index];
          return piece.setHash === requirement.setHash
            ? Math.min(requirement.count, count + 1)
            : count;
        });
        const nextState: TargetSearchState = {
          objectiveValue: baseStats[objective],
          usefulTotal: getUsefulArmorStatTotal(baseStats),
          baseStats,
          itemIds: [...state.itemIds, piece.id],
          exoticCount,
          selectedExoticFound:
            state.selectedExoticFound ||
            (piece.isExotic && piece.exoticKey === constraints.exotic),
          setCounts,
        };
        const key = getTargetStateKey(nextState, progressStats, targets);
        const existing = nextStates.get(key);
        if (
          !existing ||
          nextState.objectiveValue > existing.objectiveValue ||
          (nextState.objectiveValue === existing.objectiveValue &&
            nextState.usefulTotal > existing.usefulTotal)
        ) {
          nextStates.set(key, nextState);
        }
      }
    }
    states = pruneDominatedTargetStates(
      nextStates,
      progressStats,
      targets,
    );
  }

  const requiresSpecificExotic =
    constraints.exotic !== "any" && constraints.exotic !== "none";
  let best:
    | (TargetSearchState & {
        finalStats: ArmorStats;
        modCounts: ArmorStats;
      })
    | null = null;

  for (const state of states.values()) {
    if (
      (requiresSpecificExotic && !state.selectedExoticFound) ||
      !setRequirements.every(
        (requirement, index) => state.setCounts[index] >= requirement.count,
      )
    ) {
      continue;
    }
    const allocation = allocateMajorMods(state.baseStats, targets, objective);
    if (!allocation) continue;
    const finalTotal = getArmorStatTotal(allocation.finalStats);
    const bestFinalTotal = best ? getArmorStatTotal(best.finalStats) : -1;
    if (
      !best ||
      allocation.finalStats[objective] > best.finalStats[objective] ||
      (allocation.finalStats[objective] === best.finalStats[objective] &&
        finalTotal > bestFinalTotal)
    ) {
      best = { ...state, ...allocation };
    }
  }

  return best;
}

export function computeArmorTargetBuilds(
  pieces: OptimizerArmorPiece[],
  constraints: ArmorOptimizationConstraints,
  targets: ArmorStats,
): ArmorTargetBuild[] {
  return ARMOR_STATS.map((stat) => {
    const result = maximizeStatWithTargets(
      pieces,
      stat.key,
      constraints,
      targets,
    );
    return {
      stat: stat.key,
      base: result?.baseStats[stat.key] ?? null,
      withMajorMods: result?.finalStats[stat.key] ?? null,
      baseStats: result?.baseStats ?? null,
      finalStats: result?.finalStats ?? null,
      modCounts: result?.modCounts ?? null,
      itemIds: result?.itemIds ?? [],
    };
  });
}
