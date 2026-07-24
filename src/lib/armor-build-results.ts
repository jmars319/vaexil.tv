import {
  ARMOR_STATS,
  ARMOR_SLOTS,
  createEmptyArmorStats,
  getArmorStatTotal,
  getSuggestedMajorModCount,
  type ArmorSlot,
  type ArmorStatCeiling,
  type ArmorStatKey,
  type ArmorStats,
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
  itemIds: string[];
  suggestedModCount: number;
};

export type ArmorBuildResultsModel = {
  results: ArmorBuildResultSummary[];
  pieces: ArmorBuildPieceSummary[];
};

export function createArmorBuildResults(
  ceilings: ArmorStatCeiling[],
  armor: ArmorBuildPieceInput[],
): ArmorBuildResultsModel {
  const armorById = new Map(armor.map((piece) => [piece.id, piece]));
  const usedPieces = new Map<string, ArmorBuildPieceSummary>();
  const results: ArmorBuildResultSummary[] = [];

  for (const ceiling of ceilings) {
    if (ceiling.base === null || ceiling.withMajorMods === null) {
      continue;
    }

    const pieces = ceiling.itemIds
      .map((id) => armorById.get(id))
      .filter((piece): piece is ArmorBuildPieceInput => Boolean(piece));
    if (pieces.length !== ARMOR_SLOTS.length) {
      continue;
    }

    const baseStats = createEmptyArmorStats();
    for (const piece of pieces) {
      usedPieces.set(piece.id, piece);
      for (const stat of ARMOR_STATS) {
        baseStats[stat.key] += piece.baseStats[stat.key];
      }
    }

    const moddedStats = { ...baseStats };
    moddedStats[ceiling.stat] = ceiling.withMajorMods;
    results.push({
      id: ceiling.stat,
      targetStat: ceiling.stat,
      targetBase: ceiling.base,
      targetWithMods: ceiling.withMajorMods,
      baseTotal: getArmorStatTotal(baseStats),
      moddedTotal: getArmorStatTotal(moddedStats),
      baseStats,
      moddedStats,
      itemIds: pieces.map((piece) => piece.id),
      suggestedModCount: getSuggestedMajorModCount(
        ceiling.base,
        ceiling.withMajorMods,
      ),
    });
  }

  return {
    results,
    pieces: [...usedPieces.values()],
  };
}
