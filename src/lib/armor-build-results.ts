import {
  ARMOR_SLOTS,
  getArmorStatTotal,
  type ArmorSlot,
  type ArmorStatKey,
  type ArmorStats,
  type ArmorTargetBuild,
} from "@/lib/armor-optimizer";

export type ArmorBuildPieceInput = {
  id: string;
  name: string;
  slot: ArmorSlot;
  iconUrl: string | null;
  isExotic: boolean;
  isMasterworked: boolean;
  equipped: boolean;
  location: string;
  setName: string | null;
  baseStatTotal: number;
  baseStats: ArmorStats;
};

export type ArmorBuildPieceSummary = ArmorBuildPieceInput;

export type ArmorBuildResultSummary = {
  id: ArmorStatKey;
  targetStat: ArmorStatKey;
  targetBase: number;
  targetWithMods: number;
  baseTotal: number;
  moddedTotal: number;
  baseStats: ArmorStats;
  moddedStats: ArmorStats;
  modCounts: ArmorStats;
  itemIds: string[];
};

export type ArmorStatMaximums = Record<ArmorStatKey, number | null>;

export type ArmorBuildResultsModel = {
  results: ArmorBuildResultSummary[];
  pieces: ArmorBuildPieceSummary[];
  targets: ArmorStats;
  maximums: ArmorStatMaximums;
};

export function createArmorBuildResults(
  builds: ArmorTargetBuild[],
  armor: ArmorBuildPieceInput[],
  targets: ArmorStats,
): ArmorBuildResultsModel {
  const armorById = new Map(armor.map((piece) => [piece.id, piece]));
  const usedPieces = new Map<string, ArmorBuildPieceSummary>();
  const results: ArmorBuildResultSummary[] = [];
  const maximums = Object.fromEntries(
    builds.map((build) => [build.stat, build.potential]),
  ) as ArmorStatMaximums;

  for (const build of builds) {
    if (
      build.base === null ||
      build.withMajorMods === null ||
      !build.baseStats ||
      !build.finalStats ||
      !build.modCounts
    ) {
      continue;
    }

    const pieces = build.itemIds
      .map((id) => armorById.get(id))
      .filter((piece): piece is ArmorBuildPieceInput => Boolean(piece));
    if (pieces.length !== ARMOR_SLOTS.length) {
      continue;
    }

    for (const piece of pieces) {
      usedPieces.set(piece.id, piece);
    }

    results.push({
      id: build.stat,
      targetStat: build.stat,
      targetBase: build.base,
      targetWithMods: build.withMajorMods,
      baseTotal: getArmorStatTotal(build.baseStats),
      moddedTotal: getArmorStatTotal(build.finalStats),
      baseStats: build.baseStats,
      moddedStats: build.finalStats,
      modCounts: build.modCounts,
      itemIds: pieces.map((piece) => piece.id),
    });
  }

  return {
    results,
    pieces: [...usedPieces.values()],
    targets,
    maximums,
  };
}
