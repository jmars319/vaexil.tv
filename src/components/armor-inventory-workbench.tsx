import { ArmorBuildResults } from "@/components/armor-build-results";
import { ArmorConstraintPicker } from "@/components/armor-constraint-picker";
import { createArmorBuildResults } from "@/lib/armor-build-results";
import {
  ARMOR_SLOTS,
  ARMOR_STAT_TARGET_PARAMS,
  ARMOR_STATS,
  computeArmorTargetBuilds,
  createEmptyArmorStats,
  type ArmorSetRequirement,
  type ArmorStatKey,
  type ArmorStats,
} from "@/lib/armor-optimizer";
import type {
  BungieArmorPiece,
  BungieArmorSetSummary,
} from "@/lib/bungie-inventory";

const OPTIMIZER_PATH = "/tools/destiny2/armor-optimizer";

export type ArmorWorkbenchSelection = {
  className?: string;
  exotic?: string;
  set?: string;
  set2?: string;
  targets?: Partial<Record<ArmorStatKey, string>>;
};

type NormalizedSelection = {
  className: string;
  exotic: string;
  set: string;
  set2: string;
  targets: ArmorStats;
};

type ArmorInventoryWorkbenchProps = {
  armor: BungieArmorPiece[];
  armorSets: BungieArmorSetSummary[];
  defaultClass: string;
  selection: ArmorWorkbenchSelection;
};

function getClassOptions(armor: BungieArmorPiece[]) {
  const ownedClasses = new Set(
    armor
      .map((piece) => piece.className)
      .filter((className) => className !== "Any Class"),
  );
  return ["Titan", "Hunter", "Warlock"].filter((className) =>
    ownedClasses.has(className),
  );
}

function normalizeSelection(
  selection: ArmorWorkbenchSelection,
  armor: BungieArmorPiece[],
  armorSets: BungieArmorSetSummary[],
  defaultClass: string,
): NormalizedSelection {
  const classOptions = getClassOptions(armor);
  const className = classOptions.includes(selection.className ?? "")
    ? selection.className!
    : classOptions.includes(defaultClass)
      ? defaultClass
      : classOptions[0] ?? "Titan";
  const classArmor = armor.filter(
    (piece) => piece.className === className || piece.className === "Any Class",
  );
  const exoticKeys = new Set(
    classArmor.flatMap((piece) => (piece.exoticKey ? [piece.exoticKey] : [])),
  );
  const exotic =
    selection.exotic === "none" ||
    selection.exotic === "any" ||
    exoticKeys.has(selection.exotic ?? "")
      ? selection.exotic ?? "any"
      : "any";
  const availableSlotCounts = new Map<number, number>();
  for (const set of armorSets) {
    availableSlotCounts.set(
      set.hash,
      new Set(
        classArmor
          .filter((piece) => piece.setHash === set.hash)
          .map((piece) => piece.slot),
      ).size,
    );
  }
  const set = normalizeSetValue(selection.set, availableSlotCounts, [2, 4]);
  let set2 = normalizeSetValue(selection.set2, availableSlotCounts, [2]);
  const primaryRequirement = parseSetRequirement(set);
  const secondaryRequirement = parseSetRequirement(set2);
  if (
    primaryRequirement?.count === 4 ||
    primaryRequirement?.setHash === secondaryRequirement?.setHash
  ) {
    set2 = "";
  }

  const targets = createEmptyArmorStats();
  for (const stat of ARMOR_STATS) {
    const value = Number(selection.targets?.[stat.key]);
    targets[stat.key] = Number.isInteger(value)
      ? Math.min(200, Math.max(0, value))
      : 0;
  }

  return { className, exotic, set, set2, targets };
}

function normalizeSetValue(
  value: string | undefined,
  availableSlotCounts: Map<number, number>,
  allowedCounts: number[],
) {
  const match = value?.match(/^(\d+):(2|4)$/);
  if (!match) {
    return "";
  }

  const setHash = Number(match[1]);
  const count = Number(match[2]);
  return (availableSlotCounts.get(setHash) ?? 0) >= count &&
    allowedCounts.includes(count)
    ? value!
    : "";
}

function parseSetRequirement(value: string): ArmorSetRequirement | null {
  const [hash, count] = value.split(":").map(Number);
  return Number.isInteger(hash) && (count === 2 || count === 4)
    ? { setHash: hash, count }
    : null;
}

function getSetRequirements(selection: NormalizedSelection) {
  const primary = parseSetRequirement(selection.set);
  const secondary = parseSetRequirement(selection.set2);
  const requirements: ArmorSetRequirement[] = primary ? [primary] : [];

  if (
    secondary &&
    primary?.count !== 4 &&
    secondary.setHash !== primary?.setHash
  ) {
    requirements.push(secondary);
  }

  return requirements;
}

function buildOptimizerHref(
  selection: NormalizedSelection,
  className: string,
) {
  const params = new URLSearchParams();
  params.set("class", className);
  if (selection.exotic !== "any") params.set("exotic", selection.exotic);
  if (selection.set) params.set("set", selection.set);
  if (selection.set2) params.set("set2", selection.set2);
  for (const stat of ARMOR_STATS) {
    if (selection.targets[stat.key] > 0) {
      params.set(
        ARMOR_STAT_TARGET_PARAMS[stat.key],
        String(selection.targets[stat.key]),
      );
    }
  }
  return `${OPTIMIZER_PATH}?${params.toString()}`;
}

function getAvailableSets(
  armorSets: BungieArmorSetSummary[],
  classArmor: BungieArmorPiece[],
) {
  const piecesBySet = new Map<number, BungieArmorPiece[]>();
  for (const piece of classArmor) {
    if (piece.setHash === null) continue;
    const pieces = piecesBySet.get(piece.setHash) ?? [];
    pieces.push(piece);
    piecesBySet.set(piece.setHash, pieces);
  }

  return armorSets
    .map((set) => {
      const pieces = piecesBySet.get(set.hash) ?? [];
      return {
        ...set,
        ownedPieces: pieces.length,
        ownedSlots: [...new Set(pieces.map((piece) => piece.slot))],
      };
    })
    .filter((set) => set.ownedSlots.length >= 2)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function ArmorInventoryWorkbench({
  armor,
  armorSets,
  defaultClass,
  selection: rawSelection,
}: ArmorInventoryWorkbenchProps) {
  const selection = normalizeSelection(
    rawSelection,
    armor,
    armorSets,
    defaultClass,
  );
  const classOptions = getClassOptions(armor);
  const classArmor = armor.filter(
    (piece) =>
      piece.className === selection.className || piece.className === "Any Class",
  );
  const exoticOptions = [
    ...new Map(
      classArmor
        .filter((piece) => piece.exoticKey)
        .map((piece) => [piece.exoticKey!, piece]),
    ).values(),
  ].sort(
    (left, right) =>
      ARMOR_SLOTS.indexOf(left.slot) - ARMOR_SLOTS.indexOf(right.slot) ||
      left.name.localeCompare(right.name),
  );
  const availableSets = getAvailableSets(armorSets, classArmor);
  const setRequirements = getSetRequirements(selection);
  const optimizerPieces = classArmor.map((piece) => ({
    id: piece.id,
    slot: piece.slot,
    isExotic: piece.isExotic,
    exoticKey: piece.exoticKey,
    setHash: piece.setHash,
    baseStats: piece.baseStats,
  }));
  const builds = computeArmorTargetBuilds(
    optimizerPieces,
    {
      exotic: selection.exotic,
      sets: setRequirements,
    },
    selection.targets,
  );
  const buildResults = createArmorBuildResults(
    builds,
    classArmor,
    selection.targets,
  );

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Build constraints
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Choose bonuses first
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Pick an Exotic and up to two armor-set bonuses. Every result is
              recalculated from the base rolls you actually own.
            </p>
          </div>
          <nav aria-label="Guardian class" className="flex flex-wrap gap-2">
            {classOptions.map((className) => (
              <a
                key={className}
                href={buildOptimizerHref(selection, className)}
                aria-current={selection.className === className ? "page" : undefined}
                className={
                  selection.className === className
                    ? "rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                    : "rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
                }
              >
                {className}
              </a>
            ))}
          </nav>
        </div>

        <ArmorConstraintPicker
          key={buildOptimizerHref(selection, selection.className)}
          className={selection.className}
          initialExotic={selection.exotic}
          initialSets={setRequirements}
          initialTargets={selection.targets}
          initialMaximums={buildResults.maximums}
          optimizerPieces={optimizerPieces}
          exoticOptions={exoticOptions.map((piece) => ({
            key: piece.exoticKey!,
            name: piece.name,
            slot: piece.slot,
            iconUrl: piece.iconUrl,
          }))}
          setOptions={availableSets.map((set) => ({
            hash: set.hash,
            name: set.name,
            ownedPieces: set.ownedPieces,
            ownedSlotCount: set.ownedSlots.length,
            twoPiece: set.twoPiece
              ? {
                  name: set.twoPiece.name,
                  description: set.twoPiece.description,
                  iconUrl: set.twoPiece.iconUrl,
                }
              : null,
            fourPiece: set.fourPiece
              ? {
                  name: set.fourPiece.name,
                  description: set.fourPiece.description,
                  iconUrl: set.fourPiece.iconUrl,
                }
              : null,
          }))}
        />
      </section>

      <ArmorBuildResults
        model={buildResults}
        inputArmorCount={classArmor.length}
      />
    </div>
  );
}
