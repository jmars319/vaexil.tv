import { ArmorConstraintPicker } from "@/components/armor-constraint-picker";
import {
  ARMOR_SLOTS,
  ARMOR_STATS,
  computeArmorStatCeilings,
  type ArmorSetRequirement,
  type ArmorStatKey,
} from "@/lib/armor-optimizer";
import type {
  BungieArmorPiece,
  BungieArmorSetSummary,
} from "@/lib/bungie-inventory";
import Image from "next/image";

const OPTIMIZER_PATH = "/tools/destiny2/armor-optimizer";
const DEFAULT_PIECES_PER_SLOT = 6;

export type ArmorWorkbenchSelection = {
  className?: string;
  exotic?: string;
  set?: string;
  set2?: string;
  q?: string;
  view?: string;
  peak?: string;
};

type NormalizedSelection = {
  className: string;
  exotic: string;
  set: string;
  set2: string;
  q: string;
  view: "compact" | "all";
  peak: ArmorStatKey | "";
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
  const peak = ARMOR_STATS.some((stat) => stat.key === selection.peak)
    ? (selection.peak as ArmorStatKey)
    : "";

  return {
    className,
    exotic,
    set,
    set2,
    q: selection.q?.trim().slice(0, 80) ?? "",
    view: selection.view === "all" ? "all" : "compact",
    peak,
  };
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

function buildHref(
  selection: NormalizedSelection,
  changes: Partial<Record<keyof NormalizedSelection, string>>,
) {
  const next = { ...selection, ...changes };
  const params = new URLSearchParams();
  params.set("class", next.className);
  if (next.exotic !== "any") params.set("exotic", next.exotic);
  if (next.set) params.set("set", next.set);
  if (next.set2) params.set("set2", next.set2);
  if (next.q) params.set("q", next.q);
  if (next.view === "all") params.set("view", "all");
  if (next.peak) params.set("peak", next.peak);
  return `${OPTIMIZER_PATH}?${params.toString()}`;
}

function getAvailableSets(
  armorSets: BungieArmorSetSummary[],
  classArmor: BungieArmorPiece[],
) {
  return armorSets
    .map((set) => {
      const pieces = classArmor.filter((piece) => piece.setHash === set.hash);
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
  const ceilings = computeArmorStatCeilings(
    classArmor.map((piece) => ({
      id: piece.id,
      slot: piece.slot,
      isExotic: piece.isExotic,
      exoticKey: piece.exoticKey,
      setHash: piece.setHash,
      baseStats: piece.baseStats,
    })),
    {
      exotic: selection.exotic,
      sets: setRequirements,
    },
  );
  const selectedPeak = ceilings.find((ceiling) => ceiling.stat === selection.peak);
  const peakPieces = selectedPeak
    ? selectedPeak.itemIds
        .map((id) => classArmor.find((piece) => piece.id === id))
        .filter((piece): piece is BungieArmorPiece => Boolean(piece))
    : [];

  return (
    <div className="space-y-6">
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
              Pick an Exotic and up to two armor-set bonuses. Every peak below is
              recalculated from the base rolls you actually own.
            </p>
          </div>
          <nav aria-label="Guardian class" className="flex flex-wrap gap-2">
            {classOptions.map((className) => (
              <a
                key={className}
                href={buildHref(selection, { className, peak: "" })}
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
          className={selection.className}
          initialExotic={selection.exotic}
          initialSets={setRequirements}
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
                }
              : null,
            fourPiece: set.fourPiece
              ? {
                  name: set.fourPiece.name,
                  description: set.fourPiece.description,
                }
              : null,
          }))}
        />
      </section>

      <section aria-labelledby="stat-ceilings-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Exact owned-inventory search
            </p>
            <h2 id="stat-ceilings-heading" className="mt-2 text-2xl font-semibold text-white">
              Highest possible peak for each stat
            </h2>
          </div>
          <p className="max-w-xl text-xs leading-5 text-slate-500 sm:text-right">
            “With mods” uses five +10 stat mods. Base totals exclude active mods;
            masterwork, subclass, and tuning effects stay separate until modeled exactly.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {ceilings.map((ceiling) => {
            const stat = ARMOR_STATS.find((entry) => entry.key === ceiling.stat)!;
            const isSelected = selection.peak === ceiling.stat;
            return (
              <a
                key={ceiling.stat}
                href={buildHref(selection, { peak: isSelected ? "" : ceiling.stat })}
                className={
                  isSelected
                    ? "rounded-2xl border border-cyan-200/60 bg-cyan-300/[0.1] p-4 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                    : "rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.055]"
                }
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {stat.label}
                </p>
                {ceiling.base === null ? (
                  <p className="mt-4 text-sm font-semibold text-rose-200">No valid build</p>
                ) : (
                  <>
                    <p className="mt-3 font-mono text-3xl font-semibold text-white">
                      {ceiling.base}
                    </p>
                    <p className="mt-1 text-xs text-cyan-200">
                      {ceiling.withMajorMods} with mods
                    </p>
                    <p className="mt-3 text-[11px] text-slate-500">
                      {isSelected ? "Hide peak build" : "Show peak build"}
                    </p>
                  </>
                )}
              </a>
            );
          })}
        </div>
      </section>

      {selectedPeak?.base !== null && peakPieces.length > 0 ? (
        <PeakBuild
          pieces={peakPieces}
          stat={selectedPeak!.stat}
          base={selectedPeak!.base!}
          withMods={selectedPeak!.withMajorMods!}
        />
      ) : null}

      <section aria-labelledby="owned-armor-heading" className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Base rolls · {classArmor.length.toLocaleString()} owned
            </p>
            <h2 id="owned-armor-heading" className="mt-2 text-2xl font-semibold text-white">
              {selection.className} armor inventory
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Colored values beneath a base stat are the currently active mod,
              masterwork, or tuning difference reported by Bungie.
            </p>
          </div>
          <form method="get" action={OPTIMIZER_PATH} className="flex w-full max-w-xl gap-2">
            <input type="hidden" name="class" value={selection.className} />
            {selection.exotic !== "any" ? <input type="hidden" name="exotic" value={selection.exotic} /> : null}
            {selection.set ? <input type="hidden" name="set" value={selection.set} /> : null}
            {selection.set2 ? <input type="hidden" name="set2" value={selection.set2} /> : null}
            <label className="sr-only" htmlFor="armor-search">Search owned armor</label>
            <input
              id="armor-search"
              type="search"
              name="q"
              defaultValue={selection.q}
              placeholder="Search armor, set, or location"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none"
            />
            <button type="submit" className="rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white">
              Search
            </button>
          </form>
        </div>

        <div className="mt-7 space-y-8">
          {ARMOR_SLOTS.map((slot) => {
            const query = selection.q.toLocaleLowerCase();
            const matching = classArmor
              .filter((piece) => piece.slot === slot)
              .filter(
                (piece) =>
                  !query ||
                  [piece.name, piece.setName, piece.location]
                    .filter(Boolean)
                    .some((value) => value!.toLocaleLowerCase().includes(query)),
              )
              .sort(
                (left, right) =>
                  right.baseStatTotal - left.baseStatTotal ||
                  left.name.localeCompare(right.name),
              );
            const visible =
              selection.view === "all"
                ? matching
                : matching.slice(0, DEFAULT_PIECES_PER_SLOT);

            return (
              <div key={slot}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">{slot}</h3>
                  <p className="font-mono text-xs text-slate-500">{matching.length} pieces</p>
                </div>
                {visible.length > 0 ? (
                  <div className="mt-3 grid gap-3 xl:grid-cols-2">
                    {visible.map((piece) => <ArmorPieceCard key={piece.id} piece={piece} />)}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-500">
                    No matching {slot.toLocaleLowerCase()} pieces.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {classArmor.length > DEFAULT_PIECES_PER_SLOT ? (
          <div className="mt-8 flex justify-center">
            <a
              href={buildHref(selection, {
                view: selection.view === "all" ? "compact" : "all",
                peak: "",
              })}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            >
              {selection.view === "all" ? "Show compact inventory" : "Show all owned armor"}
            </a>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PeakBuild({
  pieces,
  stat,
  base,
  withMods,
}: {
  pieces: BungieArmorPiece[];
  stat: ArmorStatKey;
  base: number;
  withMods: number;
}) {
  const statDefinition = ARMOR_STATS.find((entry) => entry.key === stat)!;
  return (
    <section aria-labelledby="peak-build-heading" className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.055] p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {statDefinition.label} peak build
          </p>
          <h2 id="peak-build-heading" className="mt-2 text-2xl font-semibold text-white">
            {base} base · {withMods} with five major mods
          </h2>
        </div>
        <p className="text-xs text-slate-400">Suggested on every slot: +10 {statDefinition.label}</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {pieces.map((piece) => (
          <article key={piece.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
            <div className="flex items-center gap-3">
              <ArmorIcon piece={piece} size={48} />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{piece.slot}</p>
                <p className="truncate text-sm font-semibold text-white">{piece.name}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Base {statDefinition.label}</span>
              <span className="font-mono font-semibold text-white">{piece.baseStats[stat]}</span>
            </div>
            <p className="mt-2 rounded-lg bg-cyan-300/10 px-2 py-1.5 text-center text-[11px] font-semibold text-cyan-100">
              +10 {statDefinition.label} mod
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArmorPieceCard({ piece }: { piece: BungieArmorPiece }) {
  const hasActiveDelta = ARMOR_STATS.some(
    (stat) => piece.activeStatDelta[stat.key] !== 0,
  );
  return (
    <article
      className="rounded-xl border border-white/10 bg-slate-950/35 p-4"
      style={{ contentVisibility: "auto", containIntrinsicSize: "190px" }}
    >
      <div className="flex gap-4">
        <ArmorIcon piece={piece} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className={piece.isExotic ? "truncate font-semibold text-amber-200" : "truncate font-semibold text-white"}>
                {piece.name}
              </h4>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {piece.setName ? `${piece.setName} · ` : ""}{piece.location}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-semibold text-white">{piece.baseStatTotal}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">base total</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-1">
            {ARMOR_STATS.map((stat) => (
              <div key={stat.key} className="rounded-md bg-white/[0.04] px-1 py-1.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-600">
                  {stat.label.slice(0, 3)}
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-200">
                  {piece.baseStats[stat.key]}
                </p>
                {hasActiveDelta && piece.activeStatDelta[stat.key] !== 0 ? (
                  <p className={piece.activeStatDelta[stat.key] > 0 ? "text-[9px] text-emerald-300" : "text-[9px] text-rose-300"}>
                    {piece.activeStatDelta[stat.key] > 0 ? "+" : ""}{piece.activeStatDelta[stat.key]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {piece.isExotic ? <Badge tone="amber">Exotic</Badge> : null}
            {piece.gearTier ? <Badge>Tier {piece.gearTier}</Badge> : null}
            {piece.setName ? <Badge tone="fuchsia">Set armor</Badge> : null}
            {piece.equipped ? <Badge tone="emerald">Equipped</Badge> : null}
            {piece.isMasterworked ? <Badge tone="cyan">Masterworked</Badge> : null}
            {piece.isLocked ? <Badge>Locked</Badge> : null}
            {piece.baseStatsSource === "live" ? <Badge tone="rose">Live-stat fallback</Badge> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function ArmorIcon({ piece, size }: { piece: BungieArmorPiece; size: number }) {
  return piece.iconUrl ? (
    <Image
      src={piece.iconUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-lg border border-white/10 bg-slate-900"
    />
  ) : (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-xs text-slate-600"
      style={{ width: size, height: size }}
    >
      D2
    </div>
  );
}

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "amber" | "fuchsia" | "emerald" | "cyan" | "rose";
}) {
  const styles = {
    slate: "border-white/10 bg-white/[0.04] text-slate-400",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    fuchsia: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-200",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    rose: "border-rose-300/20 bg-rose-300/10 text-rose-200",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}
