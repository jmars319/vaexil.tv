"use client";

import {
  toggleArmorSetRequirement,
  type ArmorSetToggleRequirement,
} from "@/lib/armor-constraint-selection";
import type { ArmorSlot } from "@/lib/armor-optimizer";
import Image from "next/image";
import { useDeferredValue, useMemo, useRef, useState } from "react";

const OPTIMIZER_PATH = "/tools/destiny2/armor-optimizer";

export type ArmorConstraintExoticOption = {
  key: string;
  name: string;
  slot: ArmorSlot;
  iconUrl: string | null;
};

type ArmorConstraintSetPerk = {
  name: string;
  description: string;
  iconUrl: string | null;
};

export type ArmorConstraintSetOption = {
  hash: number;
  name: string;
  ownedPieces: number;
  ownedSlotCount: number;
  twoPiece: ArmorConstraintSetPerk | null;
  fourPiece: ArmorConstraintSetPerk | null;
};

type ArmorConstraintPickerProps = {
  className: string;
  exoticOptions: ArmorConstraintExoticOption[];
  setOptions: ArmorConstraintSetOption[];
  initialExotic: string;
  initialSets: ArmorSetToggleRequirement[];
};

export function ArmorConstraintPicker({
  className,
  exoticOptions,
  setOptions,
  initialExotic,
  initialSets,
}: ArmorConstraintPickerProps) {
  const [exotic, setExotic] = useState(initialExotic);
  const [sets, setSets] = useState(initialSets);
  const [exoticSearch, setExoticSearch] = useState("");
  const [setSearch, setSetSearch] = useState("");
  const deferredExoticSearch = useDeferredValue(exoticSearch);
  const deferredSetSearch = useDeferredValue(setSearch);
  const exoticDetailsRef = useRef<HTMLDetailsElement>(null);
  const selectedExotic = exoticOptions.find((option) => option.key === exotic);
  const filteredExotics = useMemo(() => {
    const query = deferredExoticSearch.trim().toLocaleLowerCase();
    return query
      ? exoticOptions.filter((option) =>
          `${option.slot} ${option.name}`.toLocaleLowerCase().includes(query),
        )
      : exoticOptions;
  }, [deferredExoticSearch, exoticOptions]);
  const filteredSets = useMemo(() => {
    const query = deferredSetSearch.trim().toLocaleLowerCase();
    return query
      ? setOptions.filter((option) =>
          [option.name, option.twoPiece?.name, option.fourPiece?.name]
            .filter(Boolean)
            .some((value) => value!.toLocaleLowerCase().includes(query)),
        )
      : setOptions;
  }, [deferredSetSearch, setOptions]);
  const primarySet = sets[0] ? `${sets[0].setHash}:${sets[0].count}` : "";
  const secondarySet = sets[1] ? `${sets[1].setHash}:${sets[1].count}` : "";

  function selectExotic(value: string) {
    setExotic(value);
    setExoticSearch("");
    if (exoticDetailsRef.current) {
      exoticDetailsRef.current.open = false;
    }
  }

  function toggleSet(target: ArmorSetToggleRequirement) {
    setSets((current) => toggleArmorSetRequirement(current, target));
  }

  return (
    <form method="get" action={OPTIMIZER_PATH} className="mt-6 space-y-5">
      <input type="hidden" name="class" value={className} />
      <input type="hidden" name="exotic" value={exotic} />
      <input type="hidden" name="set" value={primarySet} />
      <input type="hidden" name="set2" value={secondarySet} />

      <div className="grid gap-5 xl:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.5fr)]">
        <fieldset className="min-w-0">
          <legend className="text-sm font-semibold text-slate-200">Exotic requirement</legend>
          <details
            ref={exoticDetailsRef}
            className="group mt-2 rounded-xl border border-white/10 bg-slate-950/45 open:border-amber-300/25"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-3">
                {selectedExotic?.iconUrl ? (
                  <Image
                    src={selectedExotic.iconUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-md border border-amber-300/20"
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-sm text-slate-500">
                    {exotic === "none" ? "Ø" : "✦"}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Current choice
                  </span>
                  <span className="block truncate text-sm font-semibold text-white">
                    {selectedExotic
                      ? `${selectedExotic.slot} · ${selectedExotic.name}`
                      : exotic === "none"
                        ? "Legendary armor only"
                        : "No Exotic requirement"}
                  </span>
                </span>
              </span>
              <span className="text-slate-500 transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>

            <div className="border-t border-white/10 p-3">
              <div className="grid grid-cols-2 gap-2">
                <ExoticChoiceButton
                  selected={exotic === "any"}
                  label="Any Exotic"
                  detail="Optimizer may choose one"
                  onClick={() => selectExotic("any")}
                />
                <ExoticChoiceButton
                  selected={exotic === "none"}
                  label="Legendary only"
                  detail="Exclude all Exotics"
                  onClick={() => selectExotic("none")}
                />
              </div>
              <label className="mt-3 block">
                <span className="sr-only">Search owned Exotics</span>
                <input
                  type="search"
                  value={exoticSearch}
                  onChange={(event) => setExoticSearch(event.target.value)}
                  placeholder="Search owned Exotics"
                  className="min-h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-300/45 focus:outline-none"
                />
              </label>
              <div className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-1">
                {filteredExotics.length > 0 ? (
                  <ExoticOptions
                    options={filteredExotics}
                    selectedKey={exotic}
                    onSelect={selectExotic}
                  />
                ) : (
                  <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
                    No owned Exotics match that search.
                  </p>
                )}
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset className="min-w-0 rounded-xl border border-white/10 bg-slate-950/30 p-3 sm:p-4">
          <legend className="px-1 text-sm font-semibold text-slate-200">Armor-set bonuses</legend>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Choose one 4-piece bonus or up to two 2-piece bonuses. A third
              2-piece choice replaces the oldest one.
            </p>
            <label className="block shrink-0">
              <span className="sr-only">Search armor sets</span>
              <input
                type="search"
                value={setSearch}
                onChange={(event) => setSetSearch(event.target.value)}
                placeholder="Search sets"
                className="min-h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-white placeholder:text-slate-600 focus:border-fuchsia-300/45 focus:outline-none sm:w-48"
              />
            </label>
          </div>

          <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1">
            {filteredSets.length > 0 ? (
              <div className="grid gap-2 lg:grid-cols-2">
                {filteredSets.map((option) => (
                  <ArmorSetToggleCard
                    key={option.hash}
                    option={option}
                    selections={sets}
                    onToggle={toggleSet}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
                No owned armor sets match that search.
              </p>
            )}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
        <SelectedConstraintSummary
          exotic={exotic}
          selectedExotic={selectedExotic}
          sets={sets}
          setOptions={setOptions}
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
        >
          Calculate builds
        </button>
      </div>
    </form>
  );
}

function ExoticOptions({
  options,
  selectedKey,
  onSelect,
}: {
  options: ArmorConstraintExoticOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const slots = [...new Set(options.map((option) => option.slot))];
  return slots.map((slot) => (
    <div key={slot}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{slot}</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {options
          .filter((option) => option.slot === slot)
          .map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={selectedKey === option.key}
              onClick={() => onSelect(option.key)}
              className={
                selectedKey === option.key
                  ? "flex min-w-0 items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-300/10 p-2 text-left text-amber-100"
                  : "flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] p-2 text-left text-slate-300 transition hover:border-amber-300/30 hover:bg-white/[0.04]"
              }
            >
              {option.iconUrl ? (
                <Image
                  src={option.iconUrl}
                  alt=""
                  width={34}
                  height={34}
                  loading="lazy"
                  className="size-[34px] shrink-0 rounded border border-white/10"
                />
              ) : null}
              <span className="truncate text-xs font-medium">{option.name}</span>
            </button>
          ))}
      </div>
    </div>
  ));
}

function ExoticChoiceButton({
  selected,
  label,
  detail,
  onClick,
}: {
  selected: boolean;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        selected
          ? "rounded-lg border border-amber-200/50 bg-amber-300/10 p-2 text-left"
          : "rounded-lg border border-white/10 p-2 text-left transition hover:border-amber-300/30 hover:bg-white/[0.04]"
      }
    >
      <span className={selected ? "block text-xs font-semibold text-amber-100" : "block text-xs font-semibold text-white"}>{label}</span>
      <span className="mt-0.5 block text-[10px] text-slate-500">{detail}</span>
    </button>
  );
}

function ArmorSetToggleCard({
  option,
  selections,
  onToggle,
}: {
  option: ArmorConstraintSetOption;
  selections: ArmorSetToggleRequirement[];
  onToggle: (requirement: ArmorSetToggleRequirement) => void;
}) {
  const selectedCount = selections.find(
    (selection) => selection.setHash === option.hash,
  )?.count;
  return (
    <article
      className={
        selectedCount
          ? "rounded-lg border border-fuchsia-200/45 bg-fuchsia-300/[0.08] p-3"
          : "rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
      }
      style={{ contentVisibility: "auto", containIntrinsicSize: "112px" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{option.name}</h3>
          <p className="mt-0.5 text-[10px] text-slate-600">
            {option.ownedPieces} rolls · {option.ownedSlotCount} slots
          </p>
        </div>
        {selectedCount ? (
          <span className="shrink-0 rounded-full bg-fuchsia-300/15 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-100">
            {selectedCount}-piece
          </span>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <SetCountButton
          count={2}
          perkName={option.twoPiece?.name ?? "Set bonus"}
          description={option.twoPiece?.description ?? ""}
          iconUrl={option.twoPiece?.iconUrl ?? null}
          selected={selectedCount === 2}
          onClick={() => onToggle({ setHash: option.hash, count: 2 })}
        />
        <SetCountButton
          count={4}
          perkName={option.fourPiece?.name ?? "Set bonus"}
          description={option.fourPiece?.description ?? ""}
          iconUrl={option.fourPiece?.iconUrl ?? null}
          align="right"
          selected={selectedCount === 4}
          disabled={option.ownedSlotCount < 4 || !option.fourPiece}
          onClick={() => onToggle({ setHash: option.hash, count: 4 })}
        />
      </div>
    </article>
  );
}

function SetCountButton({
  count,
  perkName,
  description,
  iconUrl,
  align = "left",
  selected,
  disabled = false,
  onClick,
}: {
  count: 2 | 4;
  perkName: string;
  description: string;
  iconUrl: string | null;
  align?: "left" | "right";
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const buttonClassName =
    "flex min-h-12 w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left";

  return (
    <div className="group/bonus relative min-w-0">
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
        className={`${buttonClassName} ${
          selected
            ? "border-fuchsia-200/60 bg-fuchsia-300/15 text-fuchsia-100"
            : "border-white/[0.08] text-slate-400 transition enabled:hover:border-fuchsia-300/30 enabled:hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-35"
        }`}
      >
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt=""
            width={22}
            height={22}
            className="size-[22px] shrink-0"
          />
        ) : null}
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold">{count}-piece</span>
          <span className="mt-0.5 block truncate text-[9px] text-slate-500">{perkName}</span>
        </span>
      </button>
      {description && !disabled ? (
        <span
          role="tooltip"
          className={`pointer-events-none absolute top-[calc(100%+0.4rem)] z-50 hidden w-72 max-w-[80vw] rounded-lg border border-fuchsia-200/20 bg-slate-950/95 p-3 text-left shadow-2xl group-hover/bonus:block group-focus-within/bonus:block ${align === "right" ? "right-0" : "left-0"}`}
        >
          <span className="block text-xs font-semibold text-fuchsia-100">{perkName}</span>
          <span className="mt-1 block text-[11px] leading-5 text-slate-300">{description}</span>
        </span>
      ) : null}
    </div>
  );
}

function SelectedConstraintSummary({
  exotic,
  selectedExotic,
  sets,
  setOptions,
}: {
  exotic: string;
  selectedExotic: ArmorConstraintExoticOption | undefined;
  sets: ArmorSetToggleRequirement[];
  setOptions: ArmorConstraintSetOption[];
}) {
  const setByHash = new Map(setOptions.map((option) => [option.hash, option]));
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Ready to calculate</p>
      <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2.5 py-1 text-amber-100">
          {selectedExotic?.name ?? (exotic === "none" ? "Legendary only" : "Any Exotic")}
        </span>
        {sets.length > 0 ? (
          sets.map((selection) => {
            const set = setByHash.get(selection.setHash);
            const perk = selection.count === 4 ? set?.fourPiece : set?.twoPiece;
            return (
              <span
                key={`${selection.setHash}:${selection.count}`}
                className="rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.06] px-2.5 py-1 text-fuchsia-100"
                title={perk?.description || perk?.name}
              >
                {selection.count}× {set?.name ?? "Armor set"} · {perk?.name ?? "Set bonus"}
              </span>
            );
          })
        ) : (
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-slate-500">No set requirement</span>
        )}
      </div>
    </div>
  );
}
