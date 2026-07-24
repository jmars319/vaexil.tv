"use client";

import type { ArmorStatMaximums } from "@/lib/armor-build-results";
import {
  ARMOR_STAT_TARGET_PARAMS,
  ARMOR_STATS,
  type ArmorStatKey,
  type ArmorStats,
} from "@/lib/armor-stat-definitions";

const STAT_CAP = 200;

type ArmorStatTargetsProps = {
  targets: ArmorStats;
  maximums: ArmorStatMaximums;
  status: "ready" | "updating" | "error";
  resultsAreStale: boolean;
  onChange: (stat: ArmorStatKey, value: number) => void;
  onClear: () => void;
};

export function ArmorStatTargets({
  targets,
  maximums,
  status,
  resultsAreStale,
  onChange,
  onClear,
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
            Enter a minimum on the left. The number after the slash is the
            exact potential with your owned armor, current bonuses, other
            targets, and five shared +10 mods.
          </p>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200"
            aria-live="polite"
          >
            {status === "updating"
              ? "Updating live potentials…"
              : status === "error"
                ? "Live preview unavailable · exact calculation still works"
                : resultsAreStale
                  ? "Potential preview is live · exact armor results need refresh"
                  : activeTargetCount > 0
                    ? `${activeTargetCount} active target${activeTargetCount === 1 ? "" : "s"}`
                    : "No active targets"}
          </p>
        </div>
        {activeTargetCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-semibold text-slate-500 transition hover:text-white"
          >
            Clear targets
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {ARMOR_STATS.map((stat) => (
          <StatTargetControl
            key={stat.key}
            stat={stat}
            target={targets[stat.key]}
            maximum={maximums[stat.key]}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

function StatTargetControl({
  stat,
  target,
  maximum,
  onChange,
}: {
  stat: (typeof ARMOR_STATS)[number];
  target: number;
  maximum: number | null;
  onChange: (stat: ArmorStatKey, value: number) => void;
}) {
  const descriptionId = `armor-target-${stat.key}-maximum`;
  const potentialPercent = ((maximum ?? 0) / STAT_CAP) * 100;
  const targetPercent = (target / STAT_CAP) * 100;
  const abovePotential = maximum !== null && target > maximum;

  function updateTarget(rawValue: number) {
    const normalized = Number.isFinite(rawValue)
      ? Math.min(STAT_CAP, Math.max(0, Math.trunc(rawValue)))
      : 0;
    onChange(
      stat.key,
      maximum === null ? normalized : Math.min(normalized, maximum),
    );
  }

  return (
    <label
      className={
        abovePotential
          ? "rounded-lg border border-amber-200/40 bg-amber-300/[0.07] p-3"
          : target > 0
            ? "rounded-lg border border-fuchsia-200/35 bg-fuchsia-300/[0.06] p-3"
            : "rounded-lg border border-white/[0.07] bg-slate-950/30 p-3"
      }
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-200">
          {stat.label}
        </span>
        <span className="flex items-baseline gap-1 rounded-md border border-white/10 bg-slate-950/70 px-2 py-1">
          <input
            type="number"
            name={ARMOR_STAT_TARGET_PARAMS[stat.key]}
            min={0}
            max={STAT_CAP}
            step={1}
            value={target}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => updateTarget(event.currentTarget.valueAsNumber)}
            aria-label={`${stat.label} minimum target`}
            aria-describedby={descriptionId}
            aria-invalid={abovePotential}
            className="h-7 w-14 bg-transparent text-right font-mono text-base font-semibold text-fuchsia-100 focus:outline-none"
          />
          <span className="text-xs text-slate-600" aria-hidden="true">
            /
          </span>
          <span className="min-w-7 font-mono text-sm font-semibold text-cyan-100">
            {maximum ?? "—"}
          </span>
        </span>
      </span>

      <span
        className="relative mt-3 block h-2 overflow-hidden rounded-full bg-slate-800"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 5px, rgba(255,255,255,0.035) 5px 7px)",
        }}
      >
        <span
          className="absolute inset-y-0 left-0 bg-cyan-300/30"
          style={{ width: `${potentialPercent}%` }}
        />
        <span
          className="absolute inset-y-0 left-0 bg-fuchsia-300/80"
          style={{ width: `${targetPercent}%` }}
        />
        {maximum !== null ? (
          <span
            className="absolute inset-y-0 w-px bg-cyan-100"
            style={{ left: `${potentialPercent}%` }}
          />
        ) : null}
        {target > 0 ? (
          <span
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-fuchsia-300"
            style={{ left: `${targetPercent}%` }}
          />
        ) : null}
      </span>

      <span className="mt-2 flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.08em]">
        <span className="text-fuchsia-200">Selected {target}</span>
        <span className="text-cyan-200">
          {maximum === null ? "No valid potential" : `Potential ${maximum}`}
        </span>
        <span className="text-slate-600">Cap {STAT_CAP}</span>
      </span>
      <span id={descriptionId} className="sr-only">
        {maximum === null
          ? `No build can satisfy the other selected targets for ${stat.label}.`
          : `${target} selected out of ${maximum} potential, on a scale capped at ${STAT_CAP}.`}
      </span>
    </label>
  );
}
