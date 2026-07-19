import { desertPerpetualRaidGuides } from "@/data/destiny-raid-guide-desert-perpetual";
import { lastWishRaidGuide } from "@/data/destiny-raid-guide-last-wish";

export type RaidGuideRole = {
  name: string;
  count: string;
  job: string;
};

export type RaidGuideScope = {
  encounters?: string[];
  excludeEncounters?: string[];
};

export type RaidGuideReferenceItem =
  | string
  | (RaidGuideScope & {
      text: string;
    });

export type RaidGuideChecklistItem =
  | string
  | (RaidGuideScope & {
      text: string;
    });

export type RaidGuideQuickReference = RaidGuideScope & {
  title: string;
  items: RaidGuideReferenceItem[];
};

export type RaidGuideSystem = RaidGuideScope & {
  title: string;
  body: string;
};

export type RaidGuideEncounter = {
  slug: string;
  title: string;
  summary: string;
  objective: string;
  roles: RaidGuideRole[];
  rhythm: string[];
  pressure: string[];
  recoveries: string[];
  loadout: string;
  interactiveTool?: "verity";
  externalTools?: {
    title: string;
    href: string;
    body: string;
    plainEnglish: string[];
    caution: string;
  }[];
};

export type RaidGuide = {
  slug: string;
  path: string[];
  href: string;
  title: string;
  shortTitle: string;
  game: string;
  raid: string;
  mode: string;
  description: string;
  sourcePacket: string;
  sourceDownload: {
    label: string;
    href: string;
  };
  tags: string[];
  stats: { label: string; value: string }[];
  systems: RaidGuideSystem[];
  encounters: RaidGuideEncounter[];
  quickReferences: RaidGuideQuickReference[];
  pullChecklist: RaidGuideChecklistItem[];
};

export function scopedItemText(item: RaidGuideChecklistItem | RaidGuideReferenceItem) {
  return typeof item === "string" ? item : item.text;
}

export function appliesToEncounter(scope: RaidGuideScope, encounterSlug: string) {
  if (scope.encounters?.length && !scope.encounters.includes(encounterSlug)) {
    return false;
  }

  if (scope.excludeEncounters?.includes(encounterSlug)) {
    return false;
  }

  return true;
}

export function getChecklistItemsForEncounter(items: RaidGuideChecklistItem[], encounterSlug: string) {
  return items.filter((item) => (typeof item === "string" ? true : appliesToEncounter(item, encounterSlug))).map(scopedItemText);
}

export function getQuickReferencesForEncounter(references: RaidGuideQuickReference[], encounterSlug: string) {
  return references
    .filter((reference) => appliesToEncounter(reference, encounterSlug))
    .map((reference) => ({
      title: reference.title,
      items: reference.items
        .filter((item) => (typeof item === "string" ? true : appliesToEncounter(item, encounterSlug)))
        .map(scopedItemText),
    }))
    .filter((reference) => reference.items.length > 0);
}

export const destinyRaidGuides: RaidGuide[] = [
  ...desertPerpetualRaidGuides,
  {
    slug: "salvations-edge",
    path: ["salvations-edge"],
    href: "/guides/destiny2/raids/salvations-edge",
    title: "Salvation's Edge Raid Guide",
    shortTitle: "Salvation's Edge",
    game: "Destiny 2",
    raid: "Salvation's Edge",
    mode: "Normal / Master",
    description:
      "A Salvation's Edge guide for Resonance, plate pulses, conductor locks, encounter roles, Master constraints, challenges, triumphs, loot, and puzzle routes.",
    sourcePacket: "Salvations_Edge_Complete_Guide.docx / PDF, July 2026 verification edition",
    sourceDownload: {
      label: "Download Salvation's Edge source PDF",
      href: "/downloads/guides/destiny2/raids/salvations-edge/salvations-edge-complete-guide.pdf",
    },
    tags: ["Destiny 2", "Raid", "Master", "Challenges", "Guide"],
    stats: [
      { label: "Encounters", value: "5" },
      { label: "Core mechanic", value: "Resonance" },
      { label: "Master focus", value: "Challenge plus combat pressure" },
      { label: "Best use", value: "Full clear reference" },
    ],
    systems: [
      {
        title: "Resonance stack discipline",
        body:
          "A Guardian can hold at most three Resonance stacks. A fourth stack kills that player immediately, so every pickup should have a destination or a stated reason.",
      },
      {
        title: "The last pickup can change the stack",
        body:
          "In Dissipation and Repository, the last Resonance type picked up determines the active type of the stack. This can correct a route, but it also punishes casual pickups.",
      },
      {
        title: "Plate pulses are timing checks",
        body:
          "Standing on the receiving plate early does not reserve it. Wait for the visible pulse arrival, catch it, and step off after the bounce registers.",
      },
      {
        title: "Master is not just health scaling",
        body:
          "Master can layer challenge restrictions, Champions, threats, and surges on top of the Normal mechanic. Learn the mechanic cleanly first, then add the Master constraint.",
      },
    ],
    encounters: [
      {
        slug: "substratum",
        title: "1. Substratum - Gain Access to the Monolith",
        summary:
          "Two teams clear mirrored room chains, regroup for Threshold Sentinels, then use plate pulses to lock conductors and deposit Resonance.",
        objective:
          "Complete three deposit rounds by locking both active conductors, surviving center pressure, and keeping stack counts under control.",
        roles: [
          { name: "Plate player", count: "2", job: "Own sends and catches on connected plates." },
          { name: "Conductor player", count: "2", job: "Collect up to three Pyramidal Resonance, arm conductors, and lock on pulse arrival." },
          { name: "Add Clear / collector", count: "2", job: "Control rooms, kill Weavers quickly, and gather overflow without exceeding three stacks." },
        ],
        rhythm: [
          "Open the encounter by depositing central Resonance.",
          "Split into two teams, clear rooms, and kill Hydras that open the opposite team's path.",
          "Return for each Threshold Sentinel before doors punish late players.",
          "Bounce plate pulses, lock both conductors, deposit, and repeat for three rounds.",
        ],
        pressure: [
          "Supplicants can punish rushed room entries.",
          "Late center returns can trap or crush players.",
          "Repeated missed plate catches can lead to Subjugator disruption.",
        ],
        recoveries: [
          "On a missed catch, restart the send cleanly instead of chasing the pulse.",
          "If a Subjugator locks the system, stop mechanics and kill it first.",
          "If someone holds three stacks, assign that player a deposit path immediately.",
        ],
        loadout:
          "Bring strong room clear, burst for Hydras and Sentinels, and survivability that does not require leaving plate timing unattended.",
      },
      {
        slug: "dissipation",
        title: "2. Dissipation - Herald of Finality",
        summary:
          "A boss checkpoint built on Resonance type control, conductor assignments, and damage windows that punish sloppy stack management.",
        objective:
          "Collect the correct Resonance, lock conductors, control Herald pressure, and enter damage without players carrying accidental stacks.",
        roles: [
          { name: "Conductors", count: "2-3", job: "Track required Resonance type and lock assigned conductors." },
          { name: "Collectors", count: "2", job: "Build correct stacks and avoid accidental fourth pickups." },
          { name: "Control / damage", count: "1-2", job: "Keep dangerous enemies down and coordinate burst during damage." },
        ],
        rhythm: [
          "Identify the required active Resonance before locking.",
          "Use the last-pickup rule deliberately when correcting a stack.",
          "Lock conductors only when the type and pulse timing are confirmed.",
          "Clean the arena before committing to damage.",
        ],
        pressure: [
          "A wrong active type can turn a clean route into a wipe.",
          "Players often forget old stacks while focusing the boss.",
          "Master pressure can make conductor timing feel shorter than it is.",
        ],
        recoveries: [
          "Call stack count and type together: 'two square,' not just 'two.'",
          "If a stack is wrong, use the final pickup correction only when the path is safe.",
          "If a conductor lock is late, reset timing instead of shooting early.",
        ],
        loadout:
          "Use a mix of add control, burst for priority targets, and boss damage that allows players to disengage for stack safety.",
      },
      {
        slug: "repository",
        title: "3. Repository - Carve a Path",
        summary:
          "A pathing and conductor encounter where teams move through rooms, manage active Resonance, and keep plate timing consistent under pressure.",
        objective:
          "Advance the route by locking conductors with correct Resonance while preserving team pace and avoiding fourth-stack deaths.",
        roles: [
          { name: "Route caller", count: "1", job: "Keep the team moving and call the next room state." },
          { name: "Plate / conductor pairs", count: "4", job: "Send, catch, arm, and lock the current conductor set." },
          { name: "Flex collector", count: "1", job: "Patch missing Resonance and protect slow transitions." },
        ],
        rhythm: [
          "Enter each room with stack count and destination known.",
          "Use pulse timing to lock conductors rather than rushing the shot.",
          "Let the last pickup determine active Resonance only when correction is intended.",
          "Move as a unit so the path does not split into separate fights.",
        ],
        pressure: [
          "Fast teams accidentally pick up more Resonance than they can spend.",
          "Slow teams lose the room pace and start missing pulse windows.",
          "Role drift makes it unclear who owns the next lock.",
        ],
        recoveries: [
          "If the route stalls, freeze pickups and reassign current stacks.",
          "If a player is at three stacks, route them to the next spend before anyone else collects.",
          "If two players call the same job, the route caller assigns one voice immediately.",
        ],
        loadout:
          "Favor mobile add clear, reliable Champion or priority coverage, and weapons that work while rotating between rooms.",
      },
      {
        slug: "verity",
        title: "4. Verity - See Beyond",
        summary:
          "A communication-heavy identity puzzle where statue order, inside/outside responsibilities, and calm language matter more than raw speed.",
        objective:
          "Resolve inside and outside states using left-to-right statue reads while preventing callout collisions and preserving revive safety.",
        roles: [
          { name: "Inside players", count: "3", job: "Read personal statue and shape state without over-talking outside calls." },
          { name: "Outside dissecting team", count: "3", job: "Read projector-wall statue order left to right and perform clean dissection." },
          { name: "Stability caller", count: "1", job: "Decide when to pause, repeat, or recover after a death." },
        ],
        rhythm: [
          "Anchor statue order left to right while facing the projector wall.",
          "Separate inside identity calls from outside dissection calls.",
          "Repeat state changes after each meaningful action.",
          "Confirm completion before moving into the next pressure window.",
        ],
        pressure: [
          "Players use names, shapes, and statue positions interchangeably.",
          "Deaths create information gaps that teams try to fill with guesses.",
          "Master add pressure can drown out puzzle language.",
        ],
        recoveries: [
          "After a death, repeat the last confirmed state instead of the last guess.",
          "If outside dissection is disputed, return to left-to-right statue order.",
          "If inside calls overlap, have one player speak at a time in fixed order.",
        ],
        loadout:
          "Use self-healing, high-uptime primary damage, and add-clear tools that do not obscure statue visibility.",
        interactiveTool: "verity",
        externalTools: [
          {
            title: "Ninjachicken737 Verity Solver",
            href: "https://ninjachicken737.com/verity",
            body:
              "A separate web tool for checking Verity dissection steps and ghost-phase visual callouts.",
            plainEnglish: [
              "For dissection, enter the three inside statue symbols in left, middle, right order, then enter the three outside 3D shapes in the same order.",
              "The solver breaks each 3D shape into two 2D parts, checks that the outside room has two circles, two squares, and two triangles total, then looks for statues still carrying the symbol tied to that position.",
              "It outputs one dissection swap at a time, updates the expected outside 3D state after that swap, and repeats until no more correction swaps are needed.",
              "Its fashion helper is separate: enter a Bungie ID and it pulls current fireteam gear, ornaments, exotics, and ghosts so the team can make cleaner ghost-phase identity calls.",
            ],
            caution:
              "Treat it as a reference check, not a replacement for stable left-to-right statue calls. Bad input order will produce bad instructions.",
          },
        ],
      },
      {
        slug: "zenith",
        title: "5. Zenith - The Witness",
        summary:
          "The final platform fight combines hand geometry, Resonance discipline, movement survival, and sustained ranged damage.",
        objective:
          "Name Witness hands by attack geometry, collect and spend safely, survive platform attacks, and commit to damage only from stable positions.",
        roles: [
          { name: "Hand readers", count: "2-3", job: "Call triangular floor blast, circular seeker field, or horizontal beam by geometry." },
          { name: "Runners", count: "2-3", job: "Handle Resonance movement and cleanses without over-stacking." },
          { name: "Damage lead", count: "1", job: "Call safe damage posture, support timing, and disengage windows." },
        ],
        rhythm: [
          "Call hands by attack geometry rather than ambiguous arm posture.",
          "Track stack counts before committing to pickups.",
          "Survive the platform pattern first; damage only matters if the team stays alive.",
          "Use long-range sustained DPS and coordinated support effects.",
        ],
        pressure: [
          "Close-range damage is not practical on the final platform.",
          "Unclear hand names cause players to dodge the wrong pattern.",
          "Greedy damage leads to late movement and stack errors.",
        ],
        recoveries: [
          "If hand language breaks down, reset to geometry: triangle, circle, horizontal.",
          "If a runner is at three stacks, stop pickups until they cleanse or spend.",
          "If damage formation collapses, call survival first and rebuild for the next window.",
        ],
        loadout:
          "Use reliable ranged precision or sustained damage, one team debuff, support effects, and personal survival tools for platform movement.",
      },
    ],
    quickReferences: [
      {
        title: "Resonance rules",
        excludeEncounters: ["verity"],
        items: [
          "Maximum three stacks per Guardian.",
          "A fourth pickup kills that Guardian.",
          "Deposit or cleanse before the timer expires.",
          "In Dissipation and Repository, the last pickup can set the active type.",
        ],
      },
      {
        title: "Plate lock sequence",
        encounters: ["substratum", "dissipation", "repository"],
        items: [
          "Step on the active starting plate to send.",
          "Receiving player waits for visible arrival.",
          "Conductor holder shoots the center to arm.",
          "Catch the next connected pulse to lock.",
        ],
      },
    ],
    pullChecklist: [
      "Check live launch screen for Champions, threats, surges, and active challenge.",
      {
        text: "Assign plate, conductor, collector, and backup jobs.",
        encounters: ["substratum", "dissipation", "repository"],
      },
      {
        text: "Repeat shape and destination language before the pull.",
        encounters: ["verity", "zenith"],
      },
      {
        text: "Call stack count before each pickup-heavy phase.",
        excludeEncounters: ["verity"],
      },
      {
        text: "Confirm damage plan, support timing, and survival call before final stand.",
        encounters: ["dissipation", "zenith"],
      },
    ],
  },
  lastWishRaidGuide,
];

export function getDestinyRaidGuide(path: string[]) {
  return destinyRaidGuides.find((guide) => guide.path.join("/") === path.join("/"));
}
