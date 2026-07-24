import type {
  ArmorBuildPieceSummary,
  ArmorBuildResultSummary,
  ArmorBuildResultsModel,
} from "@/lib/armor-build-results";
import { ARMOR_STATS, type ArmorStatKey } from "@/lib/armor-optimizer";
import Image from "next/image";

type ArmorBuildResultsProps = {
  model: ArmorBuildResultsModel;
  inputArmorCount: number;
};

export function ArmorBuildResults({
  model,
  inputArmorCount,
}: ArmorBuildResultsProps) {
  const pieceById = new Map(model.pieces.map((piece) => [piece.id, piece]));
  const activeTargetCount = ARMOR_STATS.filter(
    (stat) => model.targets[stat.key] > 0,
  ).length;

  return (
    <section
      aria-labelledby="calculated-builds-heading"
      className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Exact owned-inventory results
          </p>
          <h2
            id="calculated-builds-heading"
            className="mt-1 text-xl font-semibold text-white"
          >
            Conditional peak builds
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            One exact peak per stat. Expand any result for its five armor
            instances and shared mod plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <ResultMetric label="Builds" value={model.results.length} />
          <ResultMetric label="Armor considered" value={inputArmorCount} />
          <ResultMetric label="Active targets" value={activeTargetCount} />
          <ResultMetric label="Search" value="Exact" />
        </div>
      </div>

      {model.results.length > 0 ? (
        <div className="mt-3">
          <input
            id="armor-results-cards"
            className="peer/cards sr-only"
            type="radio"
            name="armor-results-view"
            defaultChecked
          />
          <input
            id="armor-results-table"
            className="peer/table sr-only"
            type="radio"
            name="armor-results-view"
          />
          <div
            className="inline-flex rounded-lg border border-white/10 bg-slate-950/45 p-0.5"
            role="group"
            aria-label="Build result view"
          >
            <label
              htmlFor="armor-results-cards"
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white peer-checked/cards:bg-cyan-300 peer-checked/cards:text-slate-950"
            >
              Cards
            </label>
            <label
              htmlFor="armor-results-table"
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white peer-checked/table:bg-cyan-300 peer-checked/table:text-slate-950"
            >
              Table
            </label>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-2 peer-checked/table:hidden">
            {model.results.map((result) => (
              <BuildResultCard
                key={result.id}
                result={result}
                pieces={getResultPieces(result, pieceById)}
                targets={model.targets}
              />
            ))}
          </div>

          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-white/10 bg-white/[0.025] peer-checked/table:block">
            <div className="min-w-[58rem]">
              <div
                className="grid grid-cols-[minmax(11rem,1.35fr)_repeat(6,minmax(4.4rem,0.55fr))_minmax(6.5rem,0.65fr)_2rem] gap-2 border-b border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                role="row"
              >
                <span>Peak target</span>
                {ARMOR_STATS.map((stat) => (
                  <span key={stat.key} className="text-center">
                    <span className="block">{stat.label}</span>
                    {model.targets[stat.key] > 0 ? (
                      <span className="mt-0.5 block text-[9px] text-fuchsia-200">
                        ≥ {model.targets[stat.key]}
                      </span>
                    ) : null}
                  </span>
                ))}
                <span className="text-right">Build total</span>
                <span className="sr-only">Expand</span>
              </div>
              {model.results.map((result) => (
                <BuildResultTableRow
                  key={result.id}
                  result={result}
                  pieces={getResultPieces(result, pieceById)}
                  targets={model.targets}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-4">
          <h3 className="font-semibold text-amber-100">No valid builds</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The current stat targets, Exotic, and armor-set requirements cannot
            be completed with the owned armor for this class. Lower a target or
            relax an armor requirement and calculate again.
          </p>
        </div>
      )}
    </section>
  );
}

function ResultMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-slate-400">
      {label} <strong className="ml-1 font-mono text-slate-200">{value}</strong>
    </span>
  );
}

function getResultPieces(
  result: ArmorBuildResultSummary,
  pieceById: Map<string, ArmorBuildPieceSummary>,
) {
  return result.itemIds
    .map((id) => pieceById.get(id))
    .filter((piece): piece is ArmorBuildPieceSummary => Boolean(piece));
}

function BuildResultCard({
  result,
  pieces,
  targets,
}: {
  result: ArmorBuildResultSummary;
  pieces: ArmorBuildPieceSummary[];
  targets: Record<ArmorStatKey, number>;
}) {
  const target = getStatDefinition(result.targetStat);
  return (
    <details
      name="armor-build-cards"
      className="group rounded-2xl border border-white/10 bg-white/[0.035] open:border-cyan-300/30 open:bg-cyan-300/[0.055] open:lg:col-span-2"
    >
      <summary className="cursor-pointer list-none p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200/70 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {target.label} peak
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-semibold text-white">
                {result.targetBase}
              </span>
              <span className="text-sm text-slate-600">base</span>
              <span className="text-slate-600" aria-hidden="true">→</span>
              <span className="font-mono text-lg font-semibold text-cyan-200">
                {result.targetWithMods}
              </span>
              <span className="text-xs text-slate-500">with mods</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <p className="font-mono text-lg font-semibold text-white">
                {result.moddedTotal}
              </p>
              <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                final total
              </p>
            </div>
            <span
              className="text-lg text-slate-500 transition group-open:rotate-180"
              aria-hidden="true"
            >
              ⌄
            </span>
          </div>
        </div>
        <BuildStatStrip
          stats={result.moddedStats}
          targetStat={result.targetStat}
          targets={targets}
          className="mt-2.5"
        />
      </summary>
      <BuildExpansion result={result} pieces={pieces} targets={targets} />
    </details>
  );
}

function BuildResultTableRow({
  result,
  pieces,
  targets,
}: {
  result: ArmorBuildResultSummary;
  pieces: ArmorBuildPieceSummary[];
  targets: Record<ArmorStatKey, number>;
}) {
  const target = getStatDefinition(result.targetStat);
  return (
    <details name="armor-build-table" className="group border-b border-white/[0.07] last:border-b-0 open:bg-cyan-300/[0.04]">
      <summary className="grid cursor-pointer list-none grid-cols-[minmax(11rem,1.35fr)_repeat(6,minmax(4.4rem,0.55fr))_minmax(6.5rem,0.65fr)_2rem] items-center gap-2 px-4 py-3 outline-none hover:bg-white/[0.035] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200/70 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-semibold text-white">{target.label}</span>
          <span className="mt-0.5 block text-[10px] text-cyan-200">
            {result.targetBase} base · {result.targetWithMods} modded
          </span>
        </span>
        {ARMOR_STATS.map((stat) => (
          <span
            key={stat.key}
            className={
              stat.key === result.targetStat
                ? "rounded-md bg-cyan-300/10 py-1 text-center font-mono text-sm font-semibold text-cyan-100"
                : "text-center font-mono text-sm text-slate-300"
            }
          >
            {result.moddedStats[stat.key]}
          </span>
        ))}
        <span className="text-right font-mono text-sm font-semibold text-white">
          {result.moddedTotal}
        </span>
        <span
          className="text-center text-lg text-slate-500 transition group-open:rotate-180"
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>
      <BuildExpansion
        result={result}
        pieces={pieces}
        targets={targets}
        compact
      />
    </details>
  );
}

function BuildStatStrip({
  stats,
  targetStat,
  targets,
  className = "",
}: {
  stats: Record<ArmorStatKey, number>;
  targetStat: ArmorStatKey;
  targets: Record<ArmorStatKey, number>;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 gap-1.5 sm:grid-cols-6 ${className}`}>
      {ARMOR_STATS.map((stat) => (
        <div
          key={stat.key}
          className={
            stat.key === targetStat
              ? "rounded-md border border-cyan-300/20 bg-cyan-300/10 px-1.5 py-1.5 text-center"
              : targets[stat.key] > 0
                ? "rounded-md border border-fuchsia-300/20 bg-fuchsia-300/[0.07] px-1.5 py-1.5 text-center"
                : "rounded-md border border-white/[0.06] bg-slate-950/35 px-1.5 py-1.5 text-center"
          }
        >
          <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-600">
            {stat.label}
          </p>
          <p className={stat.key === targetStat ? "font-mono text-sm font-semibold text-cyan-100" : "font-mono text-sm font-semibold text-slate-300"}>
            {stats[stat.key]}
          </p>
          {targets[stat.key] > 0 ? (
            <p className="mt-0.5 text-[8px] font-semibold text-fuchsia-200">
              min {targets[stat.key]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function BuildExpansion({
  result,
  pieces,
  targets,
  compact = false,
}: {
  result: ArmorBuildResultSummary;
  pieces: ArmorBuildPieceSummary[];
  targets: Record<ArmorStatKey, number>;
  compact?: boolean;
}) {
  const modAssignments = getModAssignments(result);
  return (
    <div className="border-t border-white/10 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-semibold text-white">Armor used</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            These are the exact owned instances used by this result.
          </p>
        </div>
        <p className="text-xs text-cyan-200">
          {modAssignments.length > 0
            ? `Suggested: ${formatModPlan(result)}`
            : "No stat mods required"}
        </p>
      </div>

      <div className={compact ? "mt-4 grid gap-2 lg:grid-cols-2" : "mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5"}>
        {pieces.map((piece, index) => (
          <BuildPieceCard
            key={piece.id}
            piece={piece}
            suggestedMod={modAssignments[index] ?? null}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-white/[0.07] bg-slate-950/40 p-3 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="text-slate-500">
            Base total <strong className="ml-1 font-mono text-slate-200">{result.baseTotal}</strong>
          </span>
          <span className="text-slate-500">
            Final total <strong className="ml-1 font-mono text-cyan-100">{result.moddedTotal}</strong>
          </span>
        </div>
        <BuildStatStrip
          stats={result.moddedStats}
          targetStat={result.targetStat}
          targets={targets}
        />
      </div>
    </div>
  );
}

function getModAssignments(result: ArmorBuildResultSummary) {
  return ARMOR_STATS.flatMap((stat) =>
    Array.from(
      { length: result.modCounts[stat.key] },
      () => stat.label,
    ),
  );
}

function formatModPlan(result: ArmorBuildResultSummary) {
  return ARMOR_STATS.flatMap((stat) =>
    result.modCounts[stat.key] > 0
      ? [`${result.modCounts[stat.key]}× +10 ${stat.label}`]
      : [],
  ).join(" · ");
}

function BuildPieceCard({
  piece,
  suggestedMod,
}: {
  piece: ArmorBuildPieceSummary;
  suggestedMod: string | null;
}) {
  return (
    <article className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <ArmorBuildIcon piece={piece} />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {piece.slot}
          </p>
          <h4 className={piece.isExotic ? "truncate text-sm font-semibold text-amber-200" : "truncate text-sm font-semibold text-white"}>
            {piece.name}
          </h4>
          <p className="mt-0.5 truncate text-[10px] text-slate-500">
            {piece.setName ? `${piece.setName} · ` : ""}{piece.location}
          </p>
        </div>
        <span className="font-mono text-sm font-semibold text-slate-300">
          {piece.baseStatTotal}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1">
        {ARMOR_STATS.map((stat) => (
          <div key={stat.key} className="rounded bg-slate-950/55 px-1 py-1 text-center">
            <p className="truncate text-[8px] uppercase text-slate-700">{stat.label.slice(0, 3)}</p>
            <p className="font-mono text-[11px] font-semibold text-slate-300">
              {piece.baseStats[stat.key]}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {suggestedMod ? <BuildBadge tone="cyan">+10 {suggestedMod}</BuildBadge> : <BuildBadge>Stat slot open</BuildBadge>}
        {piece.isExotic ? <BuildBadge tone="amber">Exotic</BuildBadge> : null}
        {piece.isMasterworked ? <BuildBadge tone="fuchsia">Masterworked</BuildBadge> : null}
        {piece.equipped ? <BuildBadge tone="emerald">Equipped</BuildBadge> : null}
      </div>
    </article>
  );
}

function ArmorBuildIcon({ piece }: { piece: ArmorBuildPieceSummary }) {
  return piece.iconUrl ? (
    <Image
      src={piece.iconUrl}
      alt=""
      width={44}
      height={44}
      loading="lazy"
      className="size-11 shrink-0 rounded-lg border border-white/10 bg-slate-900"
    />
  ) : (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-[10px] text-slate-600" aria-hidden="true">
      D2
    </div>
  );
}

function BuildBadge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "cyan" | "amber" | "fuchsia" | "emerald";
}) {
  const styles = {
    slate: "border-white/10 bg-white/[0.035] text-slate-500",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    fuchsia: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-200",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function getStatDefinition(stat: ArmorStatKey) {
  return ARMOR_STATS.find((definition) => definition.key === stat)!;
}
