import type { ArmorStatMaximums } from "@/lib/armor-build-results";
import {
  ARMOR_STAT_TARGET_PARAMS,
  ARMOR_STATS,
  type ArmorStats,
} from "@/lib/armor-optimizer";

type ArmorStatTargetsProps = {
  targets: ArmorStats;
  maximums: ArmorStatMaximums;
  clearHref: string;
};

export function ArmorStatTargets({
  targets,
  maximums,
  clearHref,
}: ArmorStatTargetsProps) {
  const activeTargetCount = ARMOR_STATS.filter(
    (stat) => targets[stat.key] > 0,
  ).length;

  return (
    <fieldset className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.035] p-3 sm:p-4">
      <legend className="px-1 text-sm font-semibold text-slate-200">
        Stat targets
      </legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs leading-5 text-slate-400">
            Set minimum final stats. Zero leaves a stat unconstrained, and all
            targets share the same five +10 armor mods.
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">
            {activeTargetCount > 0
              ? `${activeTargetCount} active target${activeTargetCount === 1 ? "" : "s"}`
              : "No active targets"}
          </p>
        </div>
        {activeTargetCount > 0 ? (
          <a
            href={clearHref}
            className="shrink-0 text-xs font-semibold text-slate-500 transition hover:text-white"
          >
            Clear targets
          </a>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {ARMOR_STATS.map((stat) => {
          const target = targets[stat.key];
          const maximum = maximums[stat.key];
          const descriptionId = `armor-target-${stat.key}-maximum`;
          return (
            <label
              key={stat.key}
              className={
                target > 0
                  ? "rounded-lg border border-cyan-200/35 bg-cyan-300/[0.07] p-3"
                  : "rounded-lg border border-white/[0.07] bg-slate-950/30 p-3"
              }
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-200">
                  {stat.label}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600">Target</span>
                  <input
                    type="number"
                    name={ARMOR_STAT_TARGET_PARAMS[stat.key]}
                    min={0}
                    max={200}
                    step={1}
                    defaultValue={target}
                    aria-describedby={descriptionId}
                    className="h-9 w-16 rounded-md border border-white/10 bg-slate-950/70 px-2 text-right font-mono text-sm font-semibold text-white focus:border-cyan-300/50 focus:outline-none"
                  />
                </span>
              </span>
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-cyan-300/70"
                  style={{ width: `${((maximum ?? 0) / 200) * 100}%` }}
                />
              </span>
              <span
                id={descriptionId}
                className={
                  maximum === null
                    ? "mt-2 block text-[10px] text-amber-200"
                    : "mt-2 block text-[10px] text-slate-500"
                }
              >
                {maximum === null
                  ? "No build meets all current targets"
                  : `${activeTargetCount > 0 ? "Conditional" : "Unconstrained"} maximum: ${maximum}`}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
