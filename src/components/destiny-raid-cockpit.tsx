"use client";

import {
  getChecklistItemsForEncounter,
  getQuickReferencesForEncounter,
  type RaidGuide,
  type RaidGuideEncounter,
} from "@/data/destiny-raid-guides";
import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";

type AssignmentState = Record<string, string>;

export type RaidCockpitRosterMember = {
  displayName: string;
  className: string;
  subclassName: string;
  power: number | null;
  emblemBackgroundPath?: string;
  items?: {
    slot: string;
    name: string;
    icon: string;
    isExotic: boolean;
  }[];
};

type FireteamCardDensity = "compact" | "comfortable" | "identity";

type RaidCockpitProps = {
  guideSlug: string;
  encounters: RaidGuideEncounter[];
  pullChecklist: RaidGuide["pullChecklist"];
  quickReferences: RaidGuide["quickReferences"];
  selectedEncounterTool?: ReactNode;
  children?: ReactNode;
};

export function RaidCockpit({
  guideSlug,
  encounters,
  pullChecklist,
  quickReferences,
  selectedEncounterTool,
  children,
}: RaidCockpitProps) {
  const [selectedEncounterSlug, setSelectedEncounterSlug] = useState(
    encounters[0]?.slug ?? "",
  );
  const selectedEncounter =
    encounters.find((encounter) => encounter.slug === selectedEncounterSlug) ??
    encounters[0];
  const [checkedItems, setCheckedItems] = useLocalRecord(`${guideSlug}:checklist`);
  const [rosterMembers, setRosterMembers] = useState<RaidCockpitRosterMember[]>([]);

  if (!selectedEncounter) {
    return null;
  }

  const selectedChecklist = getChecklistItemsForEncounter(pullChecklist, selectedEncounter.slug);
  const selectedQuickReferences = getQuickReferencesForEncounter(quickReferences, selectedEncounter.slug);
  const completedCount = selectedChecklist.filter((item) => checkedItems[item]).length;

  return (
    <section
      id="raid-cockpit"
      className="border-y border-cyan-300/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),rgba(255,255,255,0.025)]"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Raid cockpit
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Live pull workspace
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-white/10 bg-[#080b14] p-5">
            <h3 className="text-2xl font-semibold text-white">Encounter route</h3>

            <div className="mt-6 grid gap-2">
              {encounters.map((encounter) => (
                <button
                  key={encounter.slug}
                  type="button"
                  onClick={() => setSelectedEncounterSlug(encounter.slug)}
                  className={
                    encounter.slug === selectedEncounter.slug
                      ? "rounded-xl border border-cyan-300/50 bg-cyan-300/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100"
                      : "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                  }
                >
                  {encounter.title}
                </button>
              ))}
            </div>

            <FireteamRosterPanel
              rosterMembers={rosterMembers}
              onRosterLoaded={setRosterMembers}
            />

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Pull checklist
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {completedCount} of {selectedChecklist.length} checked
              </p>
              <div className="mt-4 space-y-2">
                {selectedChecklist.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.08] bg-slate-950/40 p-3 text-sm leading-6 text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedItems[item])}
                      onChange={(event) =>
                        setCheckedItems({ ...checkedItems, [item]: event.target.checked ? "true" : "" })
                      }
                      className="mt-1 size-4 accent-cyan-300"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#080b14] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Active encounter
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selectedEncounter.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{selectedEncounter.objective}</p>
            </div>

            <RoleAssignmentPanel
              key={selectedEncounter.slug}
              guideSlug={guideSlug}
              encounter={selectedEncounter}
              rosterMembers={rosterMembers}
            />

            {selectedQuickReferences.length > 0 ? (
              <EncounterQuickReferences references={selectedQuickReferences} />
            ) : null}

            {selectedEncounter.interactiveTool === "verity" ? (
              <>
                <VerityIdentityPanel rosterMembers={rosterMembers} />
                {selectedEncounterTool}
              </>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function EncounterQuickReferences({
  references,
}: {
  references: ReturnType<typeof getQuickReferencesForEncounter>;
}) {
  return (
    <div className="mt-6 space-y-3">
      {references.map((reference) => (
        <details
          key={reference.title}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4 open:border-cyan-300/30"
        >
          <summary className="cursor-pointer text-sm font-semibold text-white">
            {reference.title}
          </summary>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
            {reference.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

function FireteamRosterPanel({
  rosterMembers,
  onRosterLoaded,
}: {
  rosterMembers: RaidCockpitRosterMember[];
  onRosterLoaded: (members: RaidCockpitRosterMember[]) => void;
}) {
  async function loadRoster(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bungieName = String(formData.get("bungieName") || "").trim();

    if (!bungieName) {
      window.alert("Enter a Bungie ID.");
      return;
    }

    try {
      const response = await fetch(
        `/api/destiny/fireteam-fashion?bungieName=${encodeURIComponent(bungieName)}`,
      );
      const payload = await response.json() as {
        fireteam?: RaidCockpitRosterMember[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Lookup unavailable.");
      }

      onRosterLoaded((payload.fireteam ?? []).filter((member) => member.displayName));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Lookup unavailable.");
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Fireteam
      </p>
      <form onSubmit={loadRoster} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          name="bungieName"
          placeholder="Bungie ID"
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Load
        </button>
      </form>
      {rosterMembers.length > 0 ? (
        <div className="mt-3 space-y-2">
          {rosterMembers.map((member) => (
            <FireteamMemberCard key={member.displayName} member={member} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FireteamMemberCard({
  member,
}: {
  member: RaidCockpitRosterMember;
}) {
  const loadoutItems = member.items ?? [];

  return (
    <details className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <FireteamMemberBanner member={member} />
      </summary>
      {loadoutItems.length > 0 ? (
        <LoadoutGrid items={loadoutItems} density="compact" />
      ) : (
        <p className="px-3 pb-3 text-xs text-slate-500">No equipped items returned.</p>
      )}
    </details>
  );
}

function FireteamMemberBanner({
  member,
  density = "compact",
}: {
  member: RaidCockpitRosterMember;
  density?: FireteamCardDensity;
}) {
  const isIdentity = density === "identity";
  const isComfortable = density === "comfortable" || isIdentity;
  const bannerClass = isIdentity
    ? "relative min-h-28 bg-slate-900"
    : isComfortable
      ? "relative min-h-20 bg-slate-900"
      : "relative min-h-12 bg-slate-900";
  const overlayClass = isIdentity
    ? "relative bg-gradient-to-r from-black/82 to-black/20 p-5"
    : isComfortable
      ? "relative bg-gradient-to-r from-black/82 to-black/20 p-4"
      : "relative bg-gradient-to-r from-black/82 to-black/30 p-2.5";

  return (
    <div className={bannerClass}>
      {member.emblemBackgroundPath ? (
        <Image
          src={member.emblemBackgroundPath}
          alt=""
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          unoptimized
          className="object-cover"
        />
      ) : null}
      <div className={overlayClass}>
        <p className={isIdentity ? "text-xl font-semibold text-white" : isComfortable ? "text-base font-semibold text-white" : "text-sm font-semibold text-white"}>
          {member.displayName}
        </p>
        <p className={isIdentity ? "mt-2 text-base font-medium text-cyan-100" : isComfortable ? "mt-1 text-sm font-medium text-cyan-100" : "mt-0.5 text-xs font-medium text-cyan-100"}>
          {member.className} / {member.subclassName}
          {member.power ? ` / ${member.power}` : ""}
        </p>
      </div>
    </div>
  );
}

function LoadoutGrid({
  items,
  density = "compact",
}: {
  items: NonNullable<RaidCockpitRosterMember["items"]>;
  density?: FireteamCardDensity;
}) {
  const isIdentity = density === "identity";
  const gridClass = isIdentity
    ? "grid grid-cols-3 gap-3 p-4 sm:grid-cols-4"
    : density === "comfortable"
      ? "grid grid-cols-3 gap-2.5 p-3"
      : "grid grid-cols-[repeat(auto-fill,minmax(3.5rem,4rem))] gap-1.5 p-2";
  const tileClass = isIdentity
    ? "min-w-0 rounded-xl border border-white/10 bg-black/30 p-2"
    : density === "comfortable"
      ? "min-w-0 rounded-xl border border-white/10 bg-black/30 p-2"
      : "min-w-0 rounded-lg border border-white/10 bg-black/30 p-1";
  const labelClass = isIdentity
    ? "mt-2 truncate text-center text-xs font-semibold text-slate-200"
    : density === "comfortable"
      ? "mt-1.5 truncate text-center text-[0.7rem] font-medium text-slate-300"
      : "mt-1 truncate text-center text-[0.58rem] font-medium leading-3 text-slate-400";

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <div
          key={`${item.slot}-${item.name}`}
          className={tileClass}
          title={item.name}
        >
          <Image
            src={item.icon}
            alt={item.name}
            width={96}
            height={96}
            unoptimized
            className="aspect-square w-full rounded object-cover"
          />
          <p className={labelClass}>
            {item.name}
          </p>
        </div>
      ))}
    </div>
  );
}

function VerityIdentityPanel({
  rosterMembers,
}: {
  rosterMembers: RaidCockpitRosterMember[];
}) {
  if (rosterMembers.length === 0) {
    return null;
  }

  const gridClass =
    rosterMembers.length === 1 ? "mt-4 grid gap-4" : "mt-4 grid gap-4 xl:grid-cols-2";

  return (
    <section className="mt-6 rounded-2xl border border-cyan-300/20 bg-slate-950/50 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
        Verity identity
      </p>
      <div className={gridClass}>
        {rosterMembers.map((member) => (
          <div
            key={member.displayName}
            className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60"
          >
            <FireteamMemberBanner member={member} density="identity" />
            <LoadoutGrid
              items={(member.items ?? []).filter(isVisibleIdentityItem)}
              density="identity"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function isVisibleIdentityItem(item: NonNullable<RaidCockpitRosterMember["items"]>[number]) {
  const identitySlots = ["helmet", "classItem", "ghost"];
  const armorSlots = ["helmet", "arms", "chest", "legs", "classItem"];
  return identitySlots.includes(item.slot) || (armorSlots.includes(item.slot) && item.isExotic);
}

function RoleAssignmentPanel({
  guideSlug,
  encounter,
  rosterMembers,
}: {
  guideSlug: string;
  encounter: RaidGuideEncounter;
  rosterMembers: RaidCockpitRosterMember[];
}) {
  const [assignments, setAssignments] = useLocalRecord(`${guideSlug}:${encounter.slug}:roles`);

  return (
    <div className="mt-6 grid gap-3">
      {encounter.roles.map((role) => {
        const assignedNames = splitAssignmentValue(assignments[role.name] || "");

        return (
          <div
            key={role.name}
            className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] md:items-center"
          >
            <span>
              <span className="block text-sm font-semibold text-white">{role.name}</span>
              <span className="mt-1 block text-xs text-slate-500">{role.count} player(s)</span>
              <span className="mt-2 block text-xs leading-5 text-slate-400">{role.job}</span>
            </span>
            <span className="grid gap-3">
              {rosterMembers.length > 0 ? (
                <span className="flex flex-wrap gap-2">
                  {rosterMembers.map((member) => (
                    <label
                      key={member.displayName}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40"
                    >
                      <input
                        type="checkbox"
                        checked={assignedNames.includes(member.displayName)}
                        onChange={(event) =>
                          setAssignments({
                            ...assignments,
                            [role.name]: toggleAssignmentName(
                              assignments[role.name] || "",
                              member.displayName,
                              event.target.checked,
                            ),
                          })
                        }
                        className="size-3.5 accent-cyan-300"
                      />
                      <span>{member.displayName}</span>
                    </label>
                  ))}
                </span>
              ) : null}
              <input
                value={assignments[role.name] || ""}
                onChange={(event) => setAssignments({ ...assignments, [role.name]: event.target.value })}
                placeholder={rosterMembers.length > 0 ? "Override" : "Player"}
                aria-label={`${role.name} assignment`}
                className="min-h-11 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function splitAssignmentValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleAssignmentName(value: string, name: string, checked: boolean) {
  const names = splitAssignmentValue(value);
  const nextNames = checked
    ? [...names.filter((item) => item !== name), name]
    : names.filter((item) => item !== name);

  return nextNames.join(", ");
}

function readLocalRecord(key: string) {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    return JSON.parse(window.localStorage.getItem(key) || "{}") as AssignmentState;
  } catch {
    return {};
  }
}

function useLocalRecord(key: string) {
  const [record, setRecord] = useState<AssignmentState>(() => readLocalRecord(key));

  function updateRecord(nextRecord: AssignmentState) {
    const cleanRecord = Object.fromEntries(
      Object.entries(nextRecord).filter(([, value]) => value.trim()),
    );
    setRecord(cleanRecord);
    window.localStorage.setItem(key, JSON.stringify(cleanRecord));
  }

  return [record, updateRecord] as const;
}
